import express from 'express';
import http from 'http';

import middleware from './routes/middleware';
import sampleRoutes from './routes/sample';
import config from './util/config';
import logger from './util/logger';

const router = express();

/** Log the request */
router.use(middleware.logRequest());

/** Parse the request */
router.use(express.json());

/** Routes */
router.use('/api/v1', sampleRoutes);

/** Error handling */
router.use(middleware.notFound());

/** Create the server */
const httpServer = http.createServer(router);
httpServer.listen(config.server.port, () => logger.info({ config: config }, `Server running on ${config.server.hostname}:${config.server.port}`));
