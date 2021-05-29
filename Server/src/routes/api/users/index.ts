import express, { Request, Response, NextFunction } from "express";
import passport from "passport";

import Auth from "../../auth";
import User from "../../../models/User";

const router = express.Router();

// POST login, open access
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
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
        const authenticatedUser = passportUser;
        authenticatedUser.token = passportUser.generateJWT();

        return res.json({ user: authenticatedUser.toAuthJSON() });
      }

      return res.status(400).json(info);
    }
  )(req, res, next);
});

// GET currently logged in user, if any
router.get(
  "/me",
  Auth.required,
  (req: Request, res: Response, _next: NextFunction) => {
    if (!req.payload) {
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
