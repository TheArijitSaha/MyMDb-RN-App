import passport from "passport";
import { Strategy } from "passport-local";

import User from "../models/User";

passport.use(
  new Strategy(
    {
      usernameField: "user[email]",
      passwordField: "user[password]",
    },
    (email: string, password: string, done) => {
      User.findOne({ email })
        .then((user) => {
          if (!user || !user.validatePassword(password)) {
            return done(null, false, {
              message: "email or password is invalid",
            });
          }

          return done(null, user);
        })
        .catch(done);
    }
  )
);
