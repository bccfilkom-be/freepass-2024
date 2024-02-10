import morgan from 'morgan'
import { logger } from './logger'
import type { Response } from 'express'

morgan.token('message', (req, res: Response) => res.locals.errorMessage || '')

const successResponseFormat = ':remote-addr - :method :url :status - :response-time ms'
const errorResponseFormat = ':remote-addr - :method :url :status - :response-time ms - message: :message'

export const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: {
    write: (message) => {
      logger.info(message.trim())
    }
  }
})

export const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: {
    write: (message) => {
      logger.error(message.trim())
    }
  }
})
