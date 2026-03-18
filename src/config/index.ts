import { config } from 'dotenv';

config({
    path: `${import.meta.dirname}/../../.env.${process.env.NODE_ENV}`
});

const { PORT } = process.env;

let Config;

export default Config = {
    PORT,
};
