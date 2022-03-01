/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

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
    createdAt: { type: Date, default: new Date(2000, 1, 1) },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    emitIndexErrors: true,
  }
);

MovieSchema.index({ title: 1, releaseYear: 1 }, { unique: true });

// create model for Movies
const MovieModel: Model<MovieDocument> = model("Movie", MovieSchema, "Movies");

export default MovieModel;

export const getAllMovies = async () => {
  try {
    const data = await MovieModel.find();
    return data;
  } catch (e) {
    console.error(e);
  }
};
