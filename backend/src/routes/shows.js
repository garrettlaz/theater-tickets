import express from 'express';
import { z } from 'zod';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const showSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.coerce.date(),
  basePrice: z.number().int().min(0),
});

// Get all shows
router.get('/', async (req, res) => {
  try {
    const shows = await req.prisma.show.findMany({
      orderBy: { date: 'asc' },
      include: {
        _count: {
          select: { tickets: true }
        }
      }
    });

    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch shows' });
  }
});

// Get single show
router.get('/:id', async (req, res) => {
  try {
    const show = await req.prisma.show.findUnique({
      where: { id: req.params.id },
      include: {
        seats: {
          orderBy: [{ row: 'asc' }, { number: 'asc' }]
        }
      }
    });

    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    res.json(show);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch show' });
  }
});

// Create show (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = showSchema.parse(req.body);
    
    const show = await req.prisma.show.create({
      data: {
        ...data,
        basePrice: data.basePrice,
      }
    });

    res.status(201).json(show);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to create show' });
  }
});

// Update show (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = showSchema.partial().parse(req.body);
    
    const show = await req.prisma.show.update({
      where: { id: req.params.id },
      data
    });

    res.json(show);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to update show' });
  }
});

// Delete show (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await req.prisma.show.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Show deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete show' });
  }
});

export default router;
