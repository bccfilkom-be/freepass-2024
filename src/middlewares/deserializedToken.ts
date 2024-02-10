import type { Request, Response, NextFunction } from 'express'
import { verifyJWT } from '../utils/jwt'

const deserializedToken = async (req: Request, res: Response, next: NextFunction) => {
  const authorization: string | undefined = req.get('authorization')

  if (authorization) {
    const accessToken: string = authorization.replace(/^Bearer\s/, '')
    if (!accessToken) {
      next()
      return
    }

    const token = verifyJWT(accessToken)
    if (token.decoded) {
      res.locals.user = token.decoded
      next()
      return
    }

    if (token.expired) {
      next()
      return
    }
  }
  next()
}

export default deserializedToken
