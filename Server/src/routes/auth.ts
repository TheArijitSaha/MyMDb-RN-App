import { Request } from 'express';
import jwt from 'express-jwt';

const getTokenFromHeaders = (req: Request): string => {
  if (
    req.headers.authorization
    && req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

export default {
  required: jwt({
    secret: process.env.JWT_SECRET || 'secret',
    requestProperty: 'payload',
    getToken: getTokenFromHeaders,
    algorithms: ['sha1', 'RS256', 'HS256'],
  }),
  optional: jwt({
    secret: process.env.JWT_SECRET || 'secret',
    requestProperty: 'payload',
    getToken: getTokenFromHeaders,
    credentialsRequired: false,
    algorithms: ['sha1', 'RS256', 'HS256'],
  }),
};
