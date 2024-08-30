import dotenv from 'dotenv';
dotenv.config();

export const env = {
    APP_PORT: process.env.APP_PORT || 4003,
    DATABASE: {
        CONNECT: process.env.DATABASE_CONNECT as any,
        HOST: process.env.DATABASE_HOST,
        PORT: Number(process.env.DATABASE_PORT),
        USER: process.env.DATABASE_USER,
        PASSWORD: process.env.DATABASE_PASSWORD,
        NAME: process.env.DATABASE_NAME
    }
};
