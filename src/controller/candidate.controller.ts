import type { NextFunction, Request, Response } from 'express'
import { findCandidateById, getAllCandidates } from '../services/candidate.service'

export const viewAllCandidates = async (req: Request, res: Response, next: NextFunction) => {
  const candidates = await getAllCandidates()
  return res.status(200).send({
    status: 200,
    message: 'get all candidates success',
    data: { candidates, length: candidates.length }
  })
}

export const viewCandidate = async (req: Request, res: Response, next: NextFunction) => {
  const candidateId = req.params.candidateId

  try {
    const candidate = await findCandidateById(candidateId)
    if (!candidate) throw new Error('candidate not found')

    return res.status(200).send({ status: 200, message: 'view candidate by id success', data: candidate })
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(400).send({ status: 400, message: error.message })
    } else {
      next(error)
    }
  }
}

export const viewCandidatePosts = async (req: Request, res: Response, next: NextFunction) => {
  const candidateId = req.params.candidateId

  try {
    const candidate = await findCandidateById(candidateId)
    if (!candidate) throw new Error('candidate not found')

    const posts = candidate.posts
    return res
      .status(200)
      .send({ status: 200, message: "view candidate's posts success", data: { posts, length: posts.length } })
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(400).send({ status: 400, message: error.message })
    } else {
      next(error)
    }
  }
}
