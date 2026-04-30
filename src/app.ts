import express from 'express';
import type { Application, NextFunction, Request, Response } from 'express';
import logger from './config/logger.js';
import type { HttpError } from 'http-errors';
import cookieParser from 'cookie-parser';

// import routes
import UserRoutes from './routes/user.routes.js';
import TenantRoutes from "./routes/tenant.routes.js"

const app: Application = express();
app.use(cookieParser());
app.use(express.json());

app.get('/check', async (req, res, next) => {
    return res.status(200).json('success');
});

app.use('/api/user', UserRoutes);
app.use('/api/tenant', TenantRoutes)

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
