require('dotenv').config();
const { connectDB, disconnectDB } = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5001;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Leave Request Service listening on port ${PORT}`);
    });

    const shutdown = () => {
      process.removeListener('SIGINT', shutdown);
      process.removeListener('SIGTERM', shutdown);
      server.close(async () => {
        try {
          await disconnectDB();
        } catch (e) {
          console.error(e);
        }
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  })
  .catch((err) => {
    console.error('Failed to connect to database', err.message || err);
    if (err?.message?.includes('ECONNREFUSED') || err?.name === 'MongooseServerSelectionError') {
      console.error(`
Could not reach MongoDB at ${process.env.MONGODB_URI || process.env.MONGO_URI || '(not set)'}.

For a hosted database, set in .env:
  USE_IN_MEMORY_DB=false
  MONGODB_URI=<your connection string>
  (MONGO_URI is also accepted)
`);
    }
    process.exit(1);
  });
