import express, { Request, Response } from "express";

const router = express.Router();

// import Auth from "../../auth";

router.get("/", (req: Request, res: Response) => {
  res.send("The sedulous hyena ate the antelope!");
});

export default router;
