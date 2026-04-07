import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { read, write } from '../lib/store.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(read('chores'));
});

router.post('/', (req, res) => {
  const chore = sanitize(req.body);
  if (!chore.title) return res.status(400).json({ error: 'title required' });

  chore.id = uuidv4();
  const chores = read('chores');
  chores.push(chore);
  write('chores', chores);
  res.status(201).json(chore);
});

router.put('/:id', (req, res) => {
  const chores = read('chores');
  const idx = chores.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });

  const updated = { ...sanitize(req.body), id: req.params.id };
  chores[idx] = updated;
  write('chores', chores);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const chores = read('chores').filter(c => c.id !== req.params.id);
  write('chores', chores);

  // Remove associated completions
  const completions = read('completions').filter(c => c.choreId !== req.params.id);
  write('completions', completions);

  res.status(204).end();
});

function sanitize(body) {
  return {
    title: body.title?.trim() ?? '',
    description: body.description?.trim() ?? '',
    color: body.color ?? '#6366f1',
    recurrence: body.recurrence ?? { type: 'once', startDate: new Date().toISOString().slice(0, 10) },
    assignment: body.assignment ?? { type: 'fixed', memberId: null },
  };
}

export default router;
