import express, { Request, Response, NextFunction } from "express";
import { json } from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import passport from "passport";
import routes from "./routes";
// import { scheduleJob } from "node-schedule";
// import { createTransport } from "nodemailer";
// import { getAllMovies } from "./models/Movie";
// import { getAllSeries } from "./models/Series";

import { PORT, DB, NODE_ENV, MAILER_PASS, MAILER_USER } from "./config/env.dev";
import "./config/passport";

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

app.use(json());

// passport related
app.use(passport.initialize());
app.use(passport.session());

app.use("/", routes);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  res.status(err.status || 500).json({
    error: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// const transporter = createTransport({
//   service: "gmail",
//   auth: {
//     user: MAILER_USER,
//     pass: MAILER_PASS,
//   },
// });
//
// scheduleJob("59 21 17 * *", async function () {
//   const mailOptions = {
//     from: `"MyMDb" ${MAILER_USER}`,
//     to: "arijitbiley@gmail.com",
//     subject: "MyMDb Backup",
//     text: "PFA the json content of Movies and Series stored in MyMDb.",
//     attachments: [
//       {
//         filename: "movies.json",
//         content: JSON.stringify(await getAllMovies()),
//       },
//       {
//         filename: "series.json",
//         content: JSON.stringify(await getAllSeries()),
//       },
//     ],
//   };
//
//   transporter.sendMail(mailOptions, function (err, _info) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("Backup email sent!");
//     }
//   });
// });
