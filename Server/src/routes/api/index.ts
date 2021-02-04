import express from "express";

import moviesRouter from "./movies";
import seriesRouter from "./series";
import usersRouter from "./users";

const router = express.Router();

router.use("/users", usersRouter);
router.use("/movies", moviesRouter);
router.use("/series", seriesRouter);

export default router;
