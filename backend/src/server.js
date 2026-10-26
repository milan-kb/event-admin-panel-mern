import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const port = Number(process.env.PORT || 5000);

async function startServer() {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  await connectDB();

  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on('error', () => {
    console.error('HTTP server could not start. Check whether PORT is already in use.');
    process.exit(1);
  });
}

startServer().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
