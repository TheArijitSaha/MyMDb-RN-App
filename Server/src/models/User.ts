/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

import { NextFunction } from "express";
import { Schema, model, Model, Document } from "mongoose";
import { sign } from "jsonwebtoken";
import { pbkdf2Sync, randomBytes } from "crypto";

// Interface for Users Schema
export interface UserDocument extends Document {
  _id: string;
  name: string;
  email: string;
  hash: string;
  salt: string;
  setPassword: (password: string) => void;
  validatePassword: (password: string) => boolean;
  generateJWT: () => string;
  toAuthJSON: () => UserAuthInfo;
}

// Interface for Users Authorization Object
export interface UserAuthInfo {
  _id: string;
  name: string;
  email: string;
  token: string;
}

// For model type
export interface UserModelInterface extends Model<UserDocument> {}

// create schema for Users
const UserSchema = new Schema<UserDocument, UserModelInterface>(
  {
    name: {
      type: String,
      required: [true, "The Name field is required"],
    },
    email: {
      type: String,
      required: [true, "The Email field is required"],
      unique: true,
    },
    hash: String,
    salt: String,
  },
  { emitIndexErrors: true }
);

UserSchema.methods.setPassword = function setPassword(password: string) {
  this.salt = randomBytes(16).toString("hex");
  this.hash = pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString(
    "hex"
  );
};

UserSchema.methods.validatePassword = function validatePassword(
  password: string
): boolean {
  const hash: string = pbkdf2Sync(
    password,
    this.salt,
    10000,
    512,
    "sha512"
  ).toString("hex");
  return this.hash === hash;
};

UserSchema.methods.generateJWT = function generateJWT(): string {
  return sign(
    {
      email: this.email,
      id: this._id,
    },
    process.env.JWT_SECRET || "secret",
    {
      expiresIn: "2d",
    }
  );
};

UserSchema.methods.toAuthJSON = function toAuthJSON(): UserAuthInfo {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    token: this.generateJWT(),
  };
};

function handleE11000(error: any, doc: UserDocument, next: NextFunction) {
  if (error.name === "MongoError" && error.code === 11000) {
    next(new Error(`Duplicate Unique Key: ${doc.email} already exists!`));
  } else {
    next(error);
  }
}

UserSchema.post("save", handleE11000);

// create model for Users
const UserModel: Model<UserDocument> = model("User", UserSchema, "User");

export default UserModel;
