import { config } from 'dotenv';

config({
    path: `${import.meta.dirname}/../../.env.${process.env.NODE_ENV}`,
});

const { PORT, DATABASE_URL, REFRESH_TOKEN_SECRET, JWKS_URI } = process.env;

let Config;

export default Config = {
    PORT,
    DATABASE_URL,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
};
