import app from './app';
import { env } from './config/env';
import { testDatabaseConnection } from './config/database';
import { logger } from './utils/logger';

const startServer = async () => {
  // Verify database is reachable before accepting traffic
  await testDatabaseConnection();

  app.listen(env.PORT, () => {
    logger.info(`🚀 FoodBridge server running on http://localhost:${env.PORT}`);
    logger.info(`   Environment: ${env.NODE_ENV}`);
  });
};

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
