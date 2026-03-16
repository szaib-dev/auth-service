import { config } from 'dotenv';

config();

const { PORT } = process.env;

let Config;

export default Config = {
    PORT,
};
