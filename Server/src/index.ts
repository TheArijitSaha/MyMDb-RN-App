import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import session from "express-session";
const MongoStore = require("connect-mongo")(session);
import passport from "passport";
import chalk from "chalk";
import routes from "./routes";

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Connect to the database
mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected successfully"))
  .catch((err: any) => console.log(err));
// mongoose.set("debug", true);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "session-secret",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
require("./config/passport");

app.use("/", routes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).json({
    error: err.message,
  });

  console.log(chalk.red(err.message));
  console.log(err);
  next();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
