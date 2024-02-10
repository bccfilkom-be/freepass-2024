import { type Request, type Response, type NextFunction } from 'express'

export const unknownEndpoint = (request: Request, response: Response) => {
  response.status(404).send({ status: 404, message: 'unknown endpoint' })
}

export const errorHandlerEndpoint = (error: Error, request: Request, response: Response, next: NextFunction) => {
  if (error.name === 'CastError') {
    response.status(400).send({ status: 400, message: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    response.status(400).send({ status: 400, message: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    response.status(401).send({ status: 401, message: 'invalid token' })
  } else if (error.name === 'TokenExpiredError') {
    response.status(401).send({ status: 401, message: 'token expired' })
  } else {
    response.status(500).send({ status: 500, message: 'internal server error' })
  }
}
