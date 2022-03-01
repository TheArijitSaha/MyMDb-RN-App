require("dotenv").config();

export const {
  DB,
  MAILER_PASS,
  MAILER_USER,
  PORT,
  SESSION_SECRET,
} = process.env;
export const NODE_ENV = process.env.NODE_ENV ?? "production";

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

if (!SESSION_SECRET) {
  throw new Error(
    ".env is missing the definition of SESSION_SECRET environmental variable"
  );
}
