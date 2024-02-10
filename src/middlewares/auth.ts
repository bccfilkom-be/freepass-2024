import type { Request, Response, NextFunction } from 'express'

export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user
  if (!user || user._doc.role !== 'user') {
    return res.status(403).send({ status: 403, message: 'forbidden' })
  }
  next()
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user
  if (!user || user._doc.role !== 'admin') {
    return res.status(403).send({ status: 403, message: 'forbidden' })
  }
  next()
}

export const requireCandidate = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user
  if (!user || user._doc.role !== 'candidate') {
    return res.status(403).send({ status: 403, message: 'forbidden' })
  }
  next()
}
