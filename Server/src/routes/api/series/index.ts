import express, { Request, Response, NextFunction } from "express";

import axios from "axios";
import { load } from "cheerio";

import Auth from "../../auth";
import Series from "../../../models/Series";

const router = express.Router();

// GET list of series
router.get(
  "/",
  Auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    const defaultLimit = 25;
    const defaultOffset = 0;

    const limit = parseInt((req.query.limit ?? defaultLimit).toString(), 10);
    const offset = parseInt((req.query.offset ?? defaultOffset).toString(), 10);

    let filterArray = [];

    // Title filter
    if (req.query.title) {
      try {
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
        switch (req.query.status as string) {
          case "seen":
            filterArray.push({
              "timeSpan.end": { $ne: null },
            });
            filterArray.push({
              $expr: { $eq: ["$seenEpisodes", { $sum: "$seasons" }] },
            });
            break;
          case "ongoing":
            filterArray.push({
              $or: [
                { $expr: { $lt: ["$seenEpisodes", { $sum: "$seasons" }] } },
                { "timeSpan.end": null },
              ],
            });
            break;
          case "unseen":
            filterArray.push({
              $expr: { $lt: ["$seenEpisodes", { $sum: "$seasons" }] },
            });
            break;
        }
      } catch (e) {
        console.log("Error while parsing cast filter query:");
        console.log(e);
      }
    }

    // Form query and apply filters, if any
    let query = Series.find();
    if (filterArray.length > 0) {
      query = query.and(filterArray);
    }

    // Apply sort
    if (req.query.sort) {
      const orderString = req.query.order === "desc" ? "-" : "";

      switch (req.query.sort) {
        case "rottenTomatoesRating":
          query.sort(`${orderString}rottenTomatoes.rating title`);
          break;
        case "IMDBRating":
          query.sort(`${orderString}imdb.rating title`);
          break;
        case "title":
          query.sort(`${orderString}title`);
          break;
        case "firstAir":
          query.sort(`${orderString}timeSpan.start title`);
          break;
        case "lastAir":
          query.sort(`${orderString}timeSpan.end title`);
          break;
        // case "episodes":
        //   query.sort(`${orderString}episodes title`);
        //   break;
      }
    }

    try {
      const data = await query.skip(offset).limit(limit);
      res.json(data);
    } catch (e) {
      next(e);
    }
  }
);

// POST /:id - create a series
router.post(
  "/",
  Auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    const { series } = req.body;

    // If any of the two required body parameters (title, timeSpan.start) are
    // missing then send Status 422: Unprocessable Entity
    if (!series) {
      res.status(422).json("required body parameter 'series' missing");
      return;
    }
    if (!series.title) {
      res.status(422).json("required series parameter 'title' missing");
      return;
    }
    if (!series.timeSpan.start) {
      res
        .status(422)
        .json("required series parameter 'timeSpan.start' missing");
      return;
    }

    try {
      const data = await Series.create({ ...series });

      res.status(201).json(data);
    } catch (e) {
      // If the error is caused due to duplicate series entry being requested,
      // return Response Status 409: Conflict
      if (e.name === "MongoError" && e.code === 11000) {
        res.status(409).json("Duplicate series");
        return;
      }

      next(e);
    }
  }
);

// PATCH /:id - update a series
router.patch(
  "/:id",
  Auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id.toString();

    if (!req.body.series || !(req.body.series._id === id)) {
      res.status(422).json({
        error:
          "The Series object with the unique id must be given to identify it.",
      });
      return;
    }

    let updatedSeries = req.body.series;

    // Delete title and releaseYear as they should not be edited
    delete updatedSeries.title;
    delete updatedSeries.timeSpan.start;

    try {
      const originalSeries = await Series.findById(updatedSeries._id);

      // Replenish deleted nested detail timeSpan.start
      // otherwise it will update incorrectly
      updatedSeries.timeSpan.start = originalSeries.timeSpan.start;

      const data = await Series.findOneAndUpdate(
        { _id: updatedSeries._id },
        { ...updatedSeries },
        { new: true }
      );

      res.json(data);
    } catch (e) {
      console.error(e);
      next(e);
    }
  }
);

// GET /scrape/imdb - fetches scraped data from IMDB
router.get(
  "/scrape/imdb",
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.query.link) {
      res.status(400).send("No link to scrape");
      return;
    }

    const link = req.query.link.toString();

    try {
      const response = await axios.get(link.replace("m.imdb", "imdb"), {
        headers: { "Accept-Language": "en-US,en;" },
      });

      const $ = load(response.data, { xmlMode: true, decodeEntities: false });

      let imdbSeries = JSON.parse(
        $('script[type="application/ld+json"]').eq(0).html()
      );

      const title = imdbSeries.name;

      let creators = [];
      if (Array.isArray(imdbSeries.creator)) {
        for (let cre of imdbSeries.creator) {
          if (cre["@type"] === "Person") creators.push(cre.name);
        }
      } else {
        if (imdbSeries.creator["@type"] === "Person") {
          creators.push(imdbSeries.creator.name);
        }
      }

      let cast = [];
      if (Array.isArray(imdbSeries.actor)) {
        for (let actor of imdbSeries.actor) {
          cast.push(actor.name);
        }
      } else {
        cast.push(imdbSeries.actor.name);
      }

      let genres = [];
      if (Array.isArray(imdbSeries.genre)) {
        for (let i = 0; i < Math.min(imdbSeries.genre.length, 3); ++i) {
          genres.push(imdbSeries.genre[i]);
        }
      } else {
        genres.push(imdbSeries.genre);
      }

      // TODO: find a way to scrape these things
      // meanRuntime
      // rottenTomatoes
      // timeSpan.end
      const scrapedSeries = {
        title,
        timeSpan: { start: parseInt(imdbSeries.datePublished, 10) },
        creators,
        cast,
        genres,
        imdb: {
          rating: parseFloat(imdbSeries.aggregateRating.ratingValue),
          link,
        },
      };

      res.json(scrapedSeries);
    } catch (e) {
      next(e);
    }
  }
);

// GET /stats/count - fetches count of series
router.get(
  "/stats/count",
  Auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    let filter: false | "seen" | "unseen" | "ongoing" = false;

    // Status Filter
    if (req.query.filter) {
      try {
        const stringFilter = req.query.filter as string;
        switch (stringFilter) {
          case "seen":
          case "unseen":
          case "ongoing":
            filter = stringFilter;
            break;
          default:
            return res.status(400).json({
              error: `The filter ${req.query.filter} is invalid. It must be 'seen', 'unseen' or 'ongoing'.`,
            });
        }
      } catch (e) {
        console.error(e);
        return res
          .status(400)
          .json({ error: `Invalid filter. Could not be parsed!` });
      }
    }

    // Form query and apply filters, if any
    let query = Series.find();
    if (filter) {
      switch (filter) {
        case "seen":
          query = query
            .where({
              "timeSpan.end": { $ne: null },
            })
            .where({
              $expr: { $eq: ["$seenEpisodes", { $sum: "$seasons" }] },
            });
          break;
        case "ongoing":
          query = query.where({
            $or: [
              { $expr: { $lt: ["$seenEpisodes", { $sum: "$seasons" }] } },
              { "timeSpan.end": null },
            ],
          });
          break;
        case "unseen":
          query = query.where({
            $expr: { $lt: ["$seenEpisodes", { $sum: "$seasons" }] },
          });
          break;
      }
    }

    try {
      const data = await query.countDocuments();
      res.json(data);
    } catch (e) {
      next(e);
    }
  }
);

// GET /stats/time - fetches total time spent on watching series in hrs
router.get(
  "/stats/time",
  Auth.required,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await Series.aggregate().group({
        _id: "seen",
        minutes: { $sum: { $multiply: ["$seenEpisodes", "$meanRuntime"] } },
      });
      res.json(Math.floor(data[0].minutes / 60));
    } catch (e) {
      next(e);
    }
  }
);

// GET /stats/episodes - fetches total # of episodes (seen/unseen/unfiltered)
router.get(
  "/stats/episodes",
  Auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    let filter: false | "seen" | "unseen" = false;

    // Status Filter
    if (req.query.filter) {
      try {
        const stringFilter = req.query.filter as string;
        switch (stringFilter) {
          case "seen":
          case "unseen":
            filter = stringFilter;
            break;
          default:
            return res.status(400).json({
              error: `The filter ${req.query.filter} is invalid. It must be either 'seen' or 'unseen'.`,
            });
        }
      } catch (e) {
        console.error(e);
        return res
          .status(400)
          .json({ error: `Invalid filter. Could not be parsed!` });
      }
    }

    try {
      const data = await Series.aggregate().group({
        _id: filter,
        count:
          filter === false
            ? { $sum: { $sum: "$seasons" } }
            : filter === "seen"
            ? { $sum: "$seenEpisodes" }
            : { $sum: { $subtract: [{ $sum: "$seasons" }, "$seenEpisodes"] } },
      });
      res.json(data[0].count);
    } catch (e) {
      next(e);
    }
  }
);

// GET /suggestions - fetches random suggestion of series
router.get(
  "/suggestions",
  Auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    const defaultCount = 20;

    const count = parseInt((req.query.count ?? defaultCount).toString(), 10);

    try {
      const data = await Series.aggregate()
        .match({ $expr: { $lt: ["$seenEpisodes", { $sum: "$seasons" }] } })
        .sample(count);
      res.json(data);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
