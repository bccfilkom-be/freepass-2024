import { type Request, type Response, type NextFunction } from 'express'
import { logger } from '../utils/logger'

export const unknownEndpoint = (request: Request, response: Response) => {
  response.status(404).send({ status: 400, error: 'unknown endpoint' })
}

export const errorHandlerEndpoint = (error: Error, request: Request, response: Response, next: NextFunction) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ status: 400, error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ status: 400, error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ status: 401, error: 'invalid token' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ status: 401, error: 'token expired' })
  } else {
    next(error)
  }
}
