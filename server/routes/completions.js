import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { read, write } from '../lib/store.js';

const router = Router();

// POST /api/completions
router.post('/', (req, res) => {
  const { choreId, occurrenceDate, completedBy } = req.body;
  if (!choreId || !occurrenceDate) {
    return res.status(400).json({ error: 'choreId and occurrenceDate required' });
  }

  const completions = read('completions');

  const exists = completions.find(
    c => c.choreId === choreId && c.occurrenceDate === occurrenceDate
  );
  if (exists) return res.json(exists);

  const completion = {
    id: uuidv4(),
    choreId,
    occurrenceDate,
    completedBy: completedBy ?? null,
    completedAt: new Date().toISOString(),
  };
  completions.push(completion);
  write('completions', completions);
  res.status(201).json(completion);
});

// DELETE /api/completions/:id
router.delete('/:id', (req, res) => {
  const completions = read('completions').filter(c => c.id !== req.params.id);
  write('completions', completions);
  res.status(204).end();
});

export default router;
