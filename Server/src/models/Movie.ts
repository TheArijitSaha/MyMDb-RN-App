/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

import { NextFunction } from "express";
import { Schema, model, Model, Document } from "mongoose";

// Interface for Movie Schema
export interface MovieDocument extends Document {
  _id: string;
  title: string;
  subtitle: string | null;
  releaseYear: number;
  directors: string[];
  cast: string[];
  genres: string[];
  imdb: { rating: number; link: string };
  rottenTomatoes: { rating: number | null };
  runtime: number;
  seen: boolean;
  poster: string;
}

// For model type
export interface MovieModelInterface extends Model<MovieDocument> {}

// create schema for Movie
const MovieSchema = new Schema<MovieDocument, MovieModelInterface>(
  {
    title: {
      type: String,
      required: [true, "The Movie Title field is required"],
    },
    releaseYear: {
      type: Number,
      required: [true, "The Movie Release Year field is required"],
    },
    subtitle: String,
    directors: [String],
    cast: [String],
    genres: [String],
    imdb: { rating: Number, link: String },
    rottenTomatoes: { rating: Number },
    runtime: Number,
    seen: Boolean,
    poster: String,
  },
  { emitIndexErrors: true }
);

MovieSchema.index({ title: 1, releaseYear: 1 }, { unique: true });

function handleE11000(error: any, movie: MovieDocument, next: NextFunction) {
  if (error.name === "MongoError" && error.code === 11000) {
    next(
      new Error(
        `Duplicate Entry: ${movie.title} [${movie.releaseYear}] already exists!`
      )
    );
  } else {
    next(error);
  }
}

MovieSchema.post("save", handleE11000);

// create model for Movies
const MovieModel: Model<MovieDocument> = model("Movie", MovieSchema, "Movies");

export default MovieModel;
