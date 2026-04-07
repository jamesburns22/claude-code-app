import express from 'express';
import cors from 'cors';
import membersRouter from './routes/members.js';
import choresRouter from './routes/chores.js';
import occurrencesRouter from './routes/occurrences.js';
import completionsRouter from './routes/completions.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/members', membersRouter);
app.use('/api/chores', choresRouter);
app.use('/api/occurrences', occurrencesRouter);
app.use('/api/completions', completionsRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Chore app server running on http://0.0.0.0:${PORT}`);
});
