import { TestOne } from './testfunctions';
import request from 'supertest';
import app from './src/app';

describe('TestOne', () => {
    it('should load', () => {
        expect(TestOne(3)).toBe(3);
    });

    it('Should return 200 Status', async () => {
        const res = await request(app).get('/check');
        expect(res.status).toBe(200);
    });
});
