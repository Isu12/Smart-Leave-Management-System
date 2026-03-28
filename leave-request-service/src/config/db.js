const mongoose = require('mongoose');

let memoryServer = null;

async function connectDB() {
  mongoose.set('strictQuery', true);

  const wantsExternal = process.env.USE_IN_MEMORY_DB === 'false';

  if (wantsExternal) {
    const uri =
      process.env.MONGODB_URI?.trim() || process.env.MONGO_URI?.trim();
    if (!uri) {
      throw new Error('MONGODB_URI is required when USE_IN_MEMORY_DB=false');
    }
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    return;
  }

  const { MongoMemoryServer } = require('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  console.log(
    'Using in-memory MongoDB (mongodb-memory-server). Data is cleared when the process stops.'
  );
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  });
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = { connectDB, disconnectDB };
