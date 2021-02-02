import express, { Request, Response, NextFunction } from "express";
import chalk from "chalk";
import passport from "passport";

import Auth from "../../auth";
import User from "../../../models/User";

const router = express.Router();
const currentRoute = "/api/users";

// POST login, open access
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  console.log(
    `${chalk.inverse.green("POST")} : ${chalk.italic.cyan(
      `${currentRoute}/login`
    )}`
  );

  const {
    body: { user },
  } = req;

  if (!user.email) {
    return res.status(422).json({
      errors: {
        email: "is required",
      },
    });
  }

  if (!user.password) {
    return res.status(422).json({
      errors: {
        password: "is required",
      },
    });
  }

  return passport.authenticate(
    "local",
    { session: false },
    (err, passportUser, info) => {
      if (err) {
        return next(err);
      }

      if (passportUser) {
        const user = passportUser;
        user.token = passportUser.generateJWT();

        return res.json({ user: user.toAuthJSON() });
      }

      return res.status(400).json(info);
    }
  )(req, res, next);
});

// GET currently logged in user, if any
router.get(
  "/me",
  Auth.required,
  (req: Request, res: Response, next: NextFunction) => {
    console.log(
      `${chalk.inverse.blue("GET")}   : ${chalk.italic.cyan(
        `${currentRoute}/me`
      )}`
    );

    if (!req.user) {
      // No JWT was given, first login from a device
      return res.json({ error: "No JWT" });
    }

    const {
      payload: { id },
    } = req;

    return User.findById(id).then((user) => {
      if (!user) {
        return res.sendStatus(400);
      }

      return res.json({ user: user.toAuthJSON() });
    });
  }
);

export default router;
