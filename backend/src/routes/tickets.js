import express from 'express';
import QRCode from 'qrcode';
import { authenticateToken } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();

// Get user's tickets
router.get('/my-tickets', authenticateToken, async (req, res) => {
  try {
    const tickets = await req.prisma.ticket.findMany({
      where: { userId: req.user.userId },
      include: {
        show: true,
        seat: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

// Get ticket by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const ticket = await req.prisma.ticket.findUnique({
      where: { id: req.params.id },
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

    // Verify ownership (unless admin)
    if (ticket.userId !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch ticket' });
  }
});

// Generate QR code for ticket
router.get('/:id/qr', authenticateToken, async (req, res) => {
  try {
    const ticket = await req.prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        show: true,
        seat: true,
      }
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Verify ownership (unless admin)
    if (ticket.userId !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Generate QR code data
    const qrData = JSON.stringify({
      ticketId: ticket.id,
      showId: ticket.showId,
      seatId: ticket.seatId,
    });

    // Generate QR code as base64
    const qrCodeUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 1,
    });

    // Update ticket with QR code URL if not already set
    if (!ticket.qrCodeUrl) {
      await req.prisma.ticket.update({
        where: { id: ticket.id },
        data: { qrCodeUrl }
      });
    }

    res.json({ qrCodeUrl });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
});

export default router;
