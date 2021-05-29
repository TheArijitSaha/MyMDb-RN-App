require("dotenv").config();

export const PORT = process.env.PORT;
export const DB = process.env.DB;
export const NODE_ENV = process.env.NODE_ENV ?? "production";

if (!PORT) {
  throw new Error(
    ".env is missing the definition of PORT environmental variable"
  );
}

if (!DB) {
  throw new Error(".env is missing the definition of DB environment variable");
}
