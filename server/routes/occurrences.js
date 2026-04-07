import { Router } from 'express';
import { read } from '../lib/store.js';
import { expandOccurrences } from '../lib/recurrence.js';

const router = Router();

// GET /api/occurrences?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/', (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'start and end required' });

  const chores = read('chores');
  const completions = read('completions');

  const completionMap = new Map();
  for (const c of completions) {
    completionMap.set(`${c.choreId}::${c.occurrenceDate}`, c);
  }

  const occurrences = [];
  for (const chore of chores) {
    const expanded = expandOccurrences(chore, start, end);
    for (const occ of expanded) {
      const key = `${occ.choreId}::${occ.date}`;
      const completion = completionMap.get(key) ?? null;
      occurrences.push({ ...occ, chore, completion });
    }
  }

  res.json(occurrences);
});

export default router;
