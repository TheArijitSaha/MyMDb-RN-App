import express from "express";

import moviesRouter from "./movies";
import usersRouter from "./users";

const router = express.Router();

router.use("/users", usersRouter);
router.use("/movies", moviesRouter);
// router.use("/series", require("./reviews"));

export default router;
