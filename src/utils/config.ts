import dotenv from 'dotenv'
dotenv.config()

const PORT = Number(process.env.PORT) ?? 3000
const MONGODB_URI = process.env.MONGODB_URI ?? ''
const JWT_SECRET = process.env.JWT_SECRET ?? ''
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION ?? ''
const NODE_ENV = process.env.NODE_ENV ?? ''

export const config = {
  port: PORT,
  mongodbUri: MONGODB_URI,
  jwtSecret: JWT_SECRET,
  jwtAccessExpiration: JWT_ACCESS_EXPIRATION,
  nodeEnv: NODE_ENV
}
