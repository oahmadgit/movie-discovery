import { createApp } from './app.js';
import { logger } from './logger.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const app = createApp();

app.listen(PORT, () => {
  logger.info({ port: PORT }, `API listening on http://localhost:${PORT}`);
});
