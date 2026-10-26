import mongoose from 'mongoose';

let pendingConnection;

export default async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (pendingConnection) return pendingConnection;

  const uri = process.env.MONGO_URI?.trim();

  if (!uri) {
    throw new Error('MONGO_URI is required. Set it in backend/.env before starting the server.');
  }

  pendingConnection = mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
    .then(connection => {
      console.log('MongoDB connected successfully.');
      return connection;
    })
    .catch(() => {
      throw new Error('MongoDB connection failed. Check MONGO_URI, Atlas network access, and database user permissions.');
    })
    .finally(() => { pendingConnection = undefined; });

  return pendingConnection;
}
