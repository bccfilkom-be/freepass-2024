import type { NextFunction, Request, Response } from 'express'
import type { CreateElectionForm } from '../types/election.type'
import { deleteUserById, findUserById, findUserByIdAndPromote } from '../services/user.service'
import { createCandidate, deleteCandidateById, findCandidateByField } from '../services/candidate.service'
import { deletePostById } from '../services/post.service'
import { deleteCommentById } from '../services/comment.service'
import { createElectionService, findElectionById, getAllElections } from '../services/election.service'
import { createElectionValidation } from '../validation/election.validation'
import { stringtoDate } from '../utils/date'

export const promoteUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId: string = req.params.userId

  try {
    const user = await findUserById(userId)
    if (!user) throw new Error('user not found')

    if (user.role === 'admin') throw new Error('cannot promote admin')
    else if (user.role === 'candidate') throw new Error('cannot promote candidate')

    await findUserByIdAndPromote(userId)
    await createCandidate(userId)

    return res.status(200).send({ status: 200, message: 'user promote success' })
  } catch (error: any) {
    if (error.message.includes('cannot promote')) {
      res.status(400).send({ status: 400, message: error.message })
    } else {
      next(error)
    }
  }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId

  try {
    const candidate = await findCandidateByField('user', userId)
    if (candidate) await deleteCandidateById(candidate._id.toString())

    await deleteUserById(userId)

    return res.status(200).send({ status: 200, message: 'delete user success' })
  } catch (error) {
    next(error)
  }
}

export const deleteCandidate = async (req: Request, res: Response, next: NextFunction) => {
  const candidateId = req.params.candidateId

  try {
    await deleteCandidateById(candidateId)

    return res.status(200).send({ status: 200, message: 'delete candidate success' })
  } catch (error) {
    next(error)
  }
}

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.postId

  try {
    await deletePostById(postId)

    return res.status(200).send({ status: 200, message: 'delete post success' })
  } catch (error) {
    next(error)
  }
}

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  const commentId = req.params.commentId

  try {
    await deleteCommentById(commentId)

    return res.status(200).send({ status: 200, message: 'delete comment success' })
  } catch (error) {
    next(error)
  }
}

export const createElection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDateString: string = req.body.startDate
    const endDateString: string = req.body.endDate

    const startDate = stringtoDate(startDateString)
    const endDate = stringtoDate(endDateString)

    const payload: CreateElectionForm = {
      startDate,
      endDate
    }

    const { error } = createElectionValidation(payload)
    if (error) throw error

    await createElectionService(payload)
    return res.status(201).send({ status: 201, message: 'create election success' })
  } catch (error: any) {
    next(error)
  }
}

export const viewAllElections = async (req: Request, res: Response, next: NextFunction) => {
  const elections = await getAllElections()
  return res.status(200).send({
    status: 200,
    message: 'get all elections success',
    data: { elections, length: elections.length }
  })
}

export const viewElection = async (req: Request, res: Response, next: NextFunction) => {
  const electionId = req.params.electionId

  try {
    const election = await findElectionById(electionId)
    if (!election) throw new Error('election not found')

    return res.status(200).send({ status: 200, message: 'view election success', data: election })
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(400).send({ status: 400, message: error.message })
    } else {
      next(error)
    }
  }
}
