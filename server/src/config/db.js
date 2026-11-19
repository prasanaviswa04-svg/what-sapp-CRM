const mongoose = require('mongoose');
const env = require('./env');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    let connectionUri = env.MONGO_URI;

    // If MONGO_URI is not provided or local connection fails, use mongodb-memory-server
    if (!connectionUri) {
      console.log('ℹ️ No MONGO_URI provided. Initializing embedded in-memory MongoDB engine...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        connectionUri = mongoMemoryServer.getUri();
        console.log('✅ Embedded in-memory MongoDB initialized successfully.');
      } catch (memErr) {
        console.warn('⚠️ Could not start mongodb-memory-server, trying localhost fallback: ' + memErr.message);
        connectionUri = 'mongodb://127.0.0.1:27017/estateflow_crm';
      }
    }

    const conn = await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`❌ MongoDB initial connection failed (${err.message}). Trying memory server fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`✅ MongoDB Connected to in-memory fallback successfully: ${conn.connection.name}`);
      return conn;
    } catch (fallbackErr) {
      console.error(`❌ Fatal: Could not connect to any MongoDB instance: ${fallbackErr.message}`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
