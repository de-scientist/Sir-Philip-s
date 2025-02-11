import dotenv from "dotenv";

dotenv.config(); // Load environment variables

export const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "hurry",
  COOKIE_SECRET: process.env.COOKIE_SECRET || "mycookie_secret",
};
