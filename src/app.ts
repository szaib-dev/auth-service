import express from 'express';
import type { Application, NextFunction, Request, Response } from 'express';
import logger from './config/logger.js';
import type { HttpError } from 'http-errors';

// import routes
import UserRoutes from './routes/user.routes.js';

const app: Application = express();

app.use(express.json());

app.get('/check', async (req, res, next) => {
    return res.status(200).json('success');
});

app.use('/api/user', UserRoutes);

// global error handler
app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(error.message, { status: error.statusCode || 500 });

    return res.status(error.statusCode || 500).json([
        {
            err: error.message,
            errStatus: error.statusCode || 500,
            location: '',
            path: '',
        },
    ]);
});

export default app;
