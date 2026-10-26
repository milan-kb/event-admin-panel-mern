import express from 'express';
import cors from 'cors';
import errorHandler from './middleware/errorHandler.js';
import eventRoutes from './routes/eventRoutes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy.' });
});

app.use('/api/events', eventRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

app.use(errorHandler);

export default app;
