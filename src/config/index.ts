import { config } from 'dotenv';

config({
    path: `${import.meta.dirname}/../../.env.${process.env.NODE_ENV}`,
});

const {
    PORT,
    DATABASE_URL,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
    PRIVATE_KEY_SECRET,
    ADMIN_NAME,
    ADMIN_EMAIL,
    ADMIN_PASS,
} = process.env;

export default {
    PORT,
    DATABASE_URL,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
    PRIVATE_KEY_SECRET,
    ADMIN_NAME,
    ADMIN_EMAIL,
    ADMIN_PASS,
};
