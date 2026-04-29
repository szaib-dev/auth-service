import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';
import  createJWKSMock  from 'mock-jwks';

describe('/ Get User', () => {
    let jwks: ReturnType<typeof createJWKSMock>;
    const data = {
            fullname: 'Ali',
            email: 'alsssi@gmail.com',
            password: 'usernameali',
        };


    beforeAll(async() => {
        jwks = createJWKSMock('http://localhost:5501');
        await prisma.user.deleteMany({
            where: {
                email: data.email
            }
        })
    });

    beforeEach(() => {
        jwks.start();
    });

    afterEach(() => {
        jwks.stop();
    });

    it('should test /self', async () => {
        
        const user = await prisma.user.create({
            data,
        });

        const accessToken = jwks.token({ sub: user.id });

        const response = await request(app)
            .get('/api/user/self')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send();
        
        expect(response.body.id).toBe(user.id);
    });
});
