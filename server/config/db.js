import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillforge';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Connection lost. Attempting to reconnect...');
    });

    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection failed: ${error.message}`);
    // If running in development and Atlas connection isn't configured, alert the developer
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};
