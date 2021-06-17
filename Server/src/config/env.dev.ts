require("dotenv").config();

export const PORT = process.env.PORT;
export const DB = process.env.DB;
export const NODE_ENV = process.env.NODE_ENV ?? "production";
export const MAILER_USER = process.env.MAILER_USER;
export const MAILER_PASS = process.env.MAILER_PASS;

if (!PORT) {
  throw new Error(
    ".env is missing the definition of PORT environmental variable"
  );
}

if (!MAILER_PASS) {
  throw new Error(
    ".env is missing the definition of MAILER_PASS environmental variable"
  );
}

if (!MAILER_USER) {
  throw new Error(
    ".env is missing the definition of MAILER_USER environmental variable"
  );
}

if (!DB) {
  throw new Error(".env is missing the definition of DB environment variable");
}
