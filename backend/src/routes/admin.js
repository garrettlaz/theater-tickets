import express from 'express';
import QRCode from 'qrcode';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get sales report for a show
router.get('/reports/show/:showId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { showId } = req.params;

    const show = await req.prisma.show.findUnique({
      where: { id: showId },
      include: {
        tickets: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              }
            },
            seat: true,
          }
        }
      }
    });

    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    const totalRevenue = show.tickets.reduce((sum, ticket) => sum + ticket.price, 0);
    const totalSold = show.tickets.length;
    const ticketsByType = show.tickets.reduce((acc, ticket) => {
      acc[ticket.ticketType] = (acc[ticket.ticketType] || 0) + 1;
      return acc;
    }, {});

    res.json({
      show: {
        id: show.id,
        title: show.title,
        date: show.date,
      },
      sales: {
        totalSold,
        totalRevenue,
        ticketsByType,
        averagePrice: totalSold > 0 ? totalRevenue / totalSold : 0,
      },
      tickets: show.tickets,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch report' });
  }
});

// Scan QR code for check-in
router.post('/scan', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ message: 'QR data required' });
    }

    let ticketData;
    try {
      ticketData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid QR code data' });
    }

    const ticket = await req.prisma.ticket.findUnique({
      where: { id: ticketData.ticketId },
      include: {
        show: true,
        seat: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.checkedIn) {
      return res.status(400).json({ 
        message: 'Ticket already checked in',
        ticket 
      });
    }

    // Mark as checked in
    await req.prisma.ticket.update({
      where: { id: ticket.id },
      data: { checkedIn: true }
    });

    res.json({
      message: 'Ticket checked in successfully',
      ticket: {
        ...ticket,
        checkedIn: true,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process check-in' });
  }
});

export default router;
