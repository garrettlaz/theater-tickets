import express from 'express';
import { z } from 'zod';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const updateSeatSchema = z.object({
  status: z.enum(['AVAILABLE', 'SOLD', 'BLOCKED', 'RESERVED']),
});

// Generate seats for a show
router.post('/generate/:showId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { showId } = req.params;
    const { numRows = 20, seatsPerRow = 17 } = req.body;

    // Check if seats already exist
    const existingSeats = await req.prisma.seat.findFirst({
      where: { showId }
    });

    if (existingSeats) {
      return res.status(400).json({ message: 'Seats already generated for this show' });
    }

    // Generate seats
    const seats = [];
    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    for (let i = 0; i < numRows; i++) {
      for (let j = 1; j <= seatsPerRow; j++) {
        seats.push({
          row: rowLetters[i],
          number: j,
          status: 'AVAILABLE',
          showId,
        });
      }
    }

    await req.prisma.seat.createMany({
      data: seats
    });

    res.status(201).json({ message: `Created ${seats.length} seats` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate seats' });
  }
});

// Update seat status (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = updateSeatSchema.parse(req.body);
    
    const seat = await req.prisma.seat.update({
      where: { id: req.params.id },
      data
    });

    res.json(seat);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to update seat' });
  }
});

export default router;
