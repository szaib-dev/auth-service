import { config } from 'dotenv';
import { dirname } from 'node:path';

config({
    path: `${dirname}/../../.env.${process.env.NODE_ENV}`
});

const { PORT } = process.env;

let Config;

export default Config = {
    PORT,
};
