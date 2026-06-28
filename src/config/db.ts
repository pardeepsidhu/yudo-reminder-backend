import { Sequelize } from "sequelize";
import * as dotenv from "dotenv";

dotenv.config({});

export const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: "postgres",

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },

  define: {
    schema: process.env.DB_SCHEMA,
  },

  logging: false,
});


