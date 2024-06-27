const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  development: {
    client: "mysql",
    connection: {
      host: process.env.DBHOST,
      port: process.env.DBPORT,
      user: process.env.DBUSER,
      password: process.env.DBPASS || "",
      database: process.env.DBNAME,
      charset: "utf8",
    },
    migrations: {
      directory: __dirname + "/database/migrations",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: __dirname + "/database/seeds",
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
  production: {
    client: "mysql",
    connection: {
      host: process.env.DBHOST,
      port: process.env.DBPORT,
      user: process.env.DBUSER,
      password: process.env.DBPASS || "",
      database: process.env.DBNAME,
      charset: "utf8",
    },
    migrations: {
      directory: __dirname + "/database/migrations",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: __dirname + "/database/seeds",
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};
