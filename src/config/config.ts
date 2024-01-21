require('dotenv').config({ path: '.env' });

export const server = {
    port: process.env.PORT || 3000,
};

export const db = {
    user: process.env.DB_USERNAME || 'username',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'database',
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || 5432),
};