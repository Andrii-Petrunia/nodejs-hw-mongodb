import { setupServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';

const startApp = async () => {
    await initMongoConnection();
    setupServer();
};

startApp();
