import jwt from 'jsonwebtoken'
import { config } from './config'

export const signJWT = (payload: object, options?: jwt.SignOptions | undefined) => {
  return jwt.sign(payload, config.jwtSecret, {
    ...(options && options)
  })
}

export const verifyJWT = (token: string) => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret)
    return {
      valid: true,
      expired: false,
      decoded
    }
  } catch (error: any) {
    return {
      valid: false,
      expired: error.message === 'jwt is expired or not eligible to use',
      decoded: null
    }
  }
}
