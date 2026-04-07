import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { read, write } from '../lib/store.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(read('members'));
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'name required' });

  const members = read('members');
  const member = { id: uuidv4(), name: name.trim() };
  members.push(member);
  write('members', members);
  res.status(201).json(member);
});

router.delete('/:id', (req, res) => {
  const members = read('members').filter(m => m.id !== req.params.id);
  write('members', members);
  res.status(204).end();
});

export default router;
