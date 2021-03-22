import express, { Request, Response, NextFunction } from "express";

import axios from "axios";
import chalk from "chalk";
import { load } from "cheerio";

import Auth from "../../auth";
import Movie from "../../../models/Movie";

const router = express.Router();
const currentRoute = "/api/movies";

// GET / - fetches list of movies
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
          $or: [
            {
              title: {
                $regex: `^(.* )*${req.query.title as string}.*$`,
                $options: "i",
              },
            },
            {
              subtitle: {
                $regex: `^(.* )*${req.query.title as string}.*$`,
                $options: "i",
              },
            },
          ],
        });
      } catch (e) {
        console.log("Error while parsing title filter query:");
        console.log(e);
      }
    }

    // Release year Filter
    if (req.query.releaseYear) {
      try {
        logString += chalk.gray(
          `, releaseYear=${req.query.releaseYear as string}`
        );

        filterArray.push({
          releaseYear: parseInt(req.query.releaseYear as string, 10),
        });
      } catch (e) {
        console.log("Error while parsing genres filter query:");
        console.log(e);
      }
    }

    // Genre Filter
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

    // Director Filter
    if (req.query.director) {
      try {
        logString += chalk.gray(`, director=${req.query.director as string}`);

        filterArray.push({
          directors: {
            $regex: `^(.* )*(${req.query.director as string}).*$`,
            $options: "i",
          },
        });
      } catch (e) {
        console.log("Error while parsing directors filter query:");
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
              seen: true,
            });
            break;
          case "unseen":
            filterArray.push({
              seen: false,
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
    let query = Movie.find();
    if (filterArray.length > 0) {
      query = query.and(filterArray);
    }

    // Apply sort
    if (req.query.sort) {
      const orderString = req.query.order === "desc" ? "-" : "";

      switch (req.query.sort) {
        case "releaseYear":
          query.sort(`${orderString}releaseYear title`);
          break;
        case "rottenTomatoesRating":
          query.sort(`${orderString}rottenTomatoes.rating title`);
          break;
        case "IMDBRating":
          query.sort(`${orderString}imdb.rating title`);
          break;
        case "title":
          query.sort(`${orderString}title`);
          break;
        case "runtime":
          query.sort(`${orderString}runtime title`);
          break;
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

// POST /:id - create a movie
router.post(
  "/",
  Auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    const { movie } = req.body;

    // If any of the two required body parameters (title, releaseYear) are
    // missing then send Status 422: Unprocessable Entity
    if (!movie) {
      res.status(422).json("required body parameter 'movie' missing");
      return;
    }
    if (!movie.title) {
      res.status(422).json("required movie parameter 'title' missing");
      return;
    }
    if (!movie.releaseYear) {
      res.status(422).json("required movie parameter 'releaseYear' missing");
      return;
    }

    try {
      const data = await Movie.create({ ...movie });

      res.status(201).json(data);
    } catch (e) {
      // If the error is caused due to duplicate movie entry being requested,
      // return Response Status 409: Conflict
      if (e.name === "MongoError" && e.code === 11000) {
        res.status(409).json("Duplicate movie");
        return;
      }

      next(e);
    }
  }
);

// PATCH /:id - update a movie
router.patch(
  "/:id",
  Auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id.toString();

    if (!req.body.movie || !(req.body.movie._id === id)) {
      res.status(422).json({
        error:
          "The Movie object with the unique id must be given to identify it.",
      });
      return;
    }

    let updatedMovie = req.body.movie;

    // Delete title and releaseYear as they should not be edited
    delete updatedMovie.title;
    delete updatedMovie.releaseYear;

    try {
      const data = await Movie.findOneAndUpdate(
        { _id: updatedMovie._id },
        { ...updatedMovie },
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

    const response = await axios.get(link, {
      headers: { "Accept-Language": "en-US,en;" },
    });

    const $ = load(response.data, { xmlMode: true });

    const title = $("div.title_wrapper h1")
      .eq(0)
      .text()
      .trim()
      .split("&nbsp;")[0]
      .trim();

    const subtitle = $("div.originalTitle")
      .eq(0)
      .text()
      .trim()
      .split("(original")[0]
      .trim();

    let imdbMovie = JSON.parse(
      $('script[type="application/ld+json"]').eq(0).html()
    );

    let directors = [];
    if (Array.isArray(imdbMovie.director)) {
      for (let dir of imdbMovie.director) {
        directors.push(dir.name);
      }
    } else {
      directors.push(imdbMovie.director.name);
    }

    let cast = [];
    for (let i = 0; i < Math.min(imdbMovie.actor.length, 3); ++i) {
      cast.push(imdbMovie.actor[i].name);
    }

    let genres = [];
    for (let i = 0; i < Math.min(imdbMovie.genre.length, 3); ++i) {
      genres.push(imdbMovie.genre[i]);
    }

    let runtimeArray = imdbMovie.duration
      .substring(2, imdbMovie.duration.length - 1)
      .split("H");
    let runtime =
      runtimeArray.length == 2
        ? parseInt(runtimeArray[0], 10) * 60 + parseInt(runtimeArray[1], 10)
        : parseInt(runtimeArray[0], 10);

    const scrapedMovie = {
      title,
      subtitle: subtitle.length > 0 ? subtitle : null,
      releaseYear: parseInt(imdbMovie.datePublished, 10),
      directors,
      cast,
      genres,
      imdb: {
        rating: parseFloat(imdbMovie.aggregateRating.ratingValue),
        link,
      },
      runtime,
    };

    try {
      res.json(scrapedMovie);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
