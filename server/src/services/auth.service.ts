import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../middleware/authenticate';

const SALT_ROUNDS = 12;

export const hashPassword = async (plainText: string): Promise<string> => {
  return bcrypt.hash(plainText, SALT_ROUNDS);
};

export const comparePassword = async (
  plainText: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(plainText, hash);
};

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

/** Strips the password from a user object before sending to the client */
export const sanitiseUser = <T extends { password: string }>(user: T) => {
  const { password: _password, ...safe } = user;
  return safe;
};
