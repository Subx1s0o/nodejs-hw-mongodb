import { createDirIfNotExists } from './utils/createDirIfNotExists.js';
import { initMongoConnection } from './db/initMongoConnection.js';
import { setupServer } from './server.js';

const bootstrap = async () => {
  await initMongoConnection();
  await createDirIfNotExists("temp");
  setupServer();
};

bootstrap();
