import { useRuntimeConfig } from '#imports';
import { Db, MongoClient } from 'mongodb';

const config = useRuntimeConfig();
const MONGODB_URI = config.mongodbUri;

console.log('MONGODB_URI =>', MONGODB_URI);

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

let client: MongoClient | null = null;
let db: Db | null = null;

const clientOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

export async function connectDB(): Promise<Db> {
  try {
    if (db) {
      console.log('MongoDB is already connected');
      return db;
    }

    client = new MongoClient(MONGODB_URI, clientOptions);
    await client.connect();
    console.log('MongoDB connected successfully');

    db = client.db();
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

export async function closeDB(): Promise<void> {
  try {
    if (client) {
      await client.close();
      client = null;
      db = null;
      console.log('MongoDB connection closed');
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
}

process.on('SIGINT', async () => {
  try {
    await closeDB();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during MongoDB connection closure:', error);
    process.exit(1);
  }
});