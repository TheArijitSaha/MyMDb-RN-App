import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import { json } from "body-parser";
import { initialize, session } from "passport";
import routes from "./routes";

import { PORT, DB, NODE_ENV } from "./config/env.dev";

const app = express();
app.use(cors());

// Connect to the database
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected successfully"))
  .catch((err: any) => console.log(err));

if (NODE_ENV === "development") {
  // Set mongoose to debug mode
  mongoose.set("debug", true);

  // Add morgan for request-response logs
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(json());

// passport related
app.use(initialize());
app.use(session());
require("./config/passport");

app.use("/", routes);

app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).json({
    error: err.message,
  });

  console.error(err);
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
