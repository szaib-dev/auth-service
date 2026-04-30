import type { Request } from 'express';

export interface authInterface extends Request {
    auth: {
        sub: string;
        id?: string
    };
}
