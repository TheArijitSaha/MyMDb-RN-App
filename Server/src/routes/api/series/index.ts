import express, { Request, Response, NextFunction } from "express";

import chalk from "chalk";

import Auth from "../../auth";
import Series from "../../../models/Series";

const router = express.Router();
const currentRoute = "/api/series";

// GET list of series
router.get(
  "/",
  Auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    const defaultLimit = 25;
    const defaultOffset = 0;

    const limit = parseInt((req.query.limit ?? defaultLimit).toString(), 10);
    const offset = parseInt((req.query.offset ?? defaultOffset).toString(), 10);

    let logString = `${chalk.inverse.blue("GET")}   : ${chalk.italic.cyan(
      `${currentRoute}`
    )}${chalk.gray(` offset=${offset}, limit=${limit}`)}`;

    let filterArray = [];

    // Title filter
    if (req.query.title) {
      try {
        logString += chalk.gray(`, title=${req.query.title as string}`);

        filterArray.push({
          title: {
            $regex: `^(.* )*${req.query.title as string}.*$`,
            $options: "i",
          },
        });
      } catch (e) {
        console.log("Error while parsing title filter query:");
        console.log(e);
      }
    }

    // Genres Filter
    if (req.query.genre) {
      try {
        logString += chalk.gray(`, genre=${req.query.genre as string}`);

        filterArray.push({
          genres: {
            $regex: `^(.* )*(${req.query.genre as string}).*$`,
            $options: "i",
          },
        });
      } catch (e) {
        console.log("Error while parsing genres filter query:");
        console.log(e);
      }
    }

    // Creators Filter
    if (req.query.creator) {
      try {
        logString += chalk.gray(`, creator=${req.query.creator as string}`);

        filterArray.push({
          creators: {
            $regex: `^(.* )*(${req.query.creator as string}).*$`,
            $options: "i",
          },
        });
      } catch (e) {
        console.log("Error while parsing creators filter query:");
        console.log(e);
      }
    }

    // Cast Filter
    if (req.query.cast) {
      try {
        logString += chalk.gray(`, cast=${req.query.cast as string}`);

        filterArray.push({
          cast: {
            $regex: `^(.* )*(${req.query.cast as string}).*$`,
            $options: "i",
          },
        });
      } catch (e) {
        console.log("Error while parsing cast filter query:");
        console.log(e);
      }
    }

    // Status Filter
    if (req.query.status) {
      try {
        logString += chalk.gray(`, status=${req.query.status as string}`);

        switch (req.query.status as string) {
          case "seen":
            filterArray.push({
              "timeSpan.end": { $ne: null },
            });
            filterArray.push({
              $expr: { $eq: ["$seenEpisodes", "$episodes"] },
            });
            break;
          case "ongoing":
            filterArray.push({
              $or: [
                { $expr: { $lt: ["$seenEpisodes", "$episodes"] } },
                { "timeSpan.end": null },
              ],
            });
            break;
          case "unseen":
            filterArray.push({
              $expr: { $lt: ["$seenEpisodes", "$episodes"] },
            });
            break;
        }
      } catch (e) {
        console.log("Error while parsing cast filter query:");
        console.log(e);
      }
    }

    console.log(logString);

    // Form query and apply filters, if any
    let query = Series.find();
    if (filterArray.length > 0) {
      query = query.and(filterArray);
    }

    try {
      const data = await query.skip(offset).limit(limit);
      res.json(data);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
