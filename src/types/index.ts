import type { Request } from 'express';

export interface AuthInterface extends Request {
    auth: {
        sub: string;
        role: string;
        id?: string;
    };
}
