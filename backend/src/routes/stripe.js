import express from 'express';
import Stripe from 'stripe';
import { authenticateToken } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const checkoutSchema = z.object({
  showId: z.string(),
  seatIds: z.array(z.string()),
  ticketTypes: z.array(z.string()).optional(),
});

// Create checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { showId, seatIds, ticketTypes = [] } = checkoutSchema.parse(req.body);

    // Get show details
    const show = await req.prisma.show.findUnique({
      where: { id: showId },
      include: {
        seats: {
          where: {
            id: { in: seatIds }
          }
        }
      }
    });

    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    // Validate seats are available
    const unavailableSeats = show.seats.filter(seat => seat.status !== 'AVAILABLE');
    if (unavailableSeats.length > 0) {
      return res.status(400).json({ 
        message: 'Some seats are no longer available',
        unavailableSeats: unavailableSeats.map(s => `${s.row}${s.number}`)
      });
    }

    // Calculate line items
    const lineItems = show.seats.map((seat, index) => {
      const ticketType = ticketTypes[index] || 'adult';
      let price = show.basePrice;
      
      // Adjust price based on ticket type
      if (ticketType === 'student') {
        price = Math.round(show.basePrice * 0.75); // 25% discount
      } else if (ticketType === 'free') {
        price = 0;
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${show.title} - Seat ${seat.row}${seat.number}`,
            description: `${ticketType.charAt(0).toUpperCase() + ticketType.slice(1)} ticket`,
          },
          unit_amount: price * 100, // Stripe uses cents
        },
        quantity: 1,
      };
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
      customer_email: req.user.email,
      metadata: {
        userId: req.user.userId,
        showId: showId,
        seatIds: JSON.stringify(seatIds),
      },
    });

    // Mark seats as reserved temporarily
    await req.prisma.seat.updateMany({
      where: {
        id: { in: seatIds }
      },
      data: {
        status: 'RESERVED',
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Stripe error:', error);
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
});

// Handle Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      const metadata = session.metadata;
      const userId = metadata.userId;
      const showId = metadata.showId;
      const seatIds = JSON.parse(metadata.seatIds);

      // Get the show to determine prices
      const show = await req.prisma.show.findUnique({
        where: { id: showId }
      });

      if (!show) {
        console.error('Show not found:', showId);
        return;
      }

      // Mark seats as sold and create tickets
      const seats = await req.prisma.seat.findMany({
        where: { id: { in: seatIds } }
      });

      for (const seat of seats) {
        // Create ticket
        const ticket = await req.prisma.ticket.create({
          data: {
            userId,
            showId,
            seatId: seat.id,
            ticketType: 'adult', // Default, can be enhanced
            price: show.basePrice,
            stripeId: session.payment_intent,
          }
        });

        // Generate QR code
        const qrData = JSON.stringify({
          ticketId: ticket.id,
          showId: ticket.showId,
          seatId: ticket.seatId,
        });

        const qrCodeUrl = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 1,
        });

        // Update ticket with QR code
        await req.prisma.ticket.update({
          where: { id: ticket.id },
          data: { qrCodeUrl }
        });

        // Update seat status
        await req.prisma.seat.update({
          where: { id: seat.id },
          data: { status: 'SOLD' }
        });
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(500).send('Webhook processing failed');
    }
  } else if (event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object;
    
    // Release reserved seats if payment fails
    try {
      const seatIds = JSON.parse(session.metadata.seatIds);
      await req.prisma.seat.updateMany({
        where: {
          id: { in: seatIds }
        },
        data: {
          status: 'AVAILABLE',
        }
      });
    } catch (error) {
      console.error('Error releasing seats:', error);
    }
  }

  res.json({ received: true });
});

export default router;
