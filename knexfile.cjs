require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

module.exports = {
  client: 'pg',
  connection: connectionString,
  migrations: {
    directory: './migrations',
  },
};
