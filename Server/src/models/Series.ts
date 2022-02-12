/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

import { NextFunction } from "express";
import { Schema, model, Model, Document } from "mongoose";

interface Series {
  title: string;
  timeSpan: { start: number; end: number | null };
  creators: string[];
  cast: string[];
  genres: string[];
  seasons: number[];
  meanRuntime: number;
  imdb: { rating: number; link: string };
  rottenTomatoes: { rating: number | null };
  seenEpisodes: number;
  poster: string;
}

// Interface for Series Schema
export type SeriesDocument = Series & Document;

// For model type
export interface SeriesModelInterface extends Model<SeriesDocument> {}

// create schema for Series
const SeriesSchema = new Schema<SeriesDocument, SeriesModelInterface>(
  {
    title: {
      type: String,
      required: [true, "The Series Title field is required"],
    },
    timeSpan: {
      start: {
        type: Number,
        required: [true, "The Series Start year is required"],
      },
      end: Number,
    },
    creators: [String],
    cast: [String],
    genres: [String],
    seasons: [Number],
    meanRuntime: Number,
    imdb: { rating: Number, link: String },
    rottenTomatoes: { rating: Number },
    seenEpisodes: Number,
    poster: String,
  },
  { 
    timestamps: true,
    emitIndexErrors: true,
  }
);

SeriesSchema.index({ title: 1, "timeSpan.start": 1 }, { unique: true });

function handleE11000(error: any, series: SeriesDocument, next: NextFunction) {
  if (error.name === "MongoError" && error.code === 11000) {
    next(
      new Error(
        `Duplicate Entry: ${series.title} [${series.timeSpan.start}] already exists!`
      )
    );
  } else {
    next(error);
  }
}

SeriesSchema.post("save", handleE11000);

// create model for Movies
const SeriesModel: Model<SeriesDocument> = model(
  "Series",
  SeriesSchema,
  "Series"
);

export default SeriesModel;

export const getAllSeries = async () => {
  try {
    const data = await SeriesModel.find();
    return data;
  } catch (e) {
    console.error(e);
  }
};
