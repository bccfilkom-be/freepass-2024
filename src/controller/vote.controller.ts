import type { NextFunction, Request, Response } from 'express'
import { findElectionById } from '../services/election.service'
import { createVoteValidation } from '../validation/vote.validation'
import { findUserById } from '../services/user.service'
import type { CreateVoteForm } from '../types/vote.type'
import { checkPassword, hashing } from '../utils/bcrypt'
import { createVoteService, findVoteById } from '../services/vote.service'

export const createVote = async (req: Request, res: Response, next: NextFunction) => {
  const payload: CreateVoteForm = req.body
  const electionId: string = req.params.electionId
  const userId: string = res.locals.user._doc._id

  try {
    const { error } = createVoteValidation(payload)
    if (error) throw error

    const election = await findElectionById(electionId)
    if (!election) throw new Error('election not found')

    const now = new Date()
    if (election.startDate >= now || election.endDate <= now) throw new Error('cannot vote today')

    const user = await findUserById(userId)
    if (!user) throw new Error('user not found')

    const votes = election.votes
    const votePromises = votes.map(async (voteId) => {
      const vote = await findVoteById(voteId._id.toString())
      if (!vote) throw new Error('vote not found')

      const isVoted = checkPassword(user._id.toString(), vote.hashedUserId)
      if (isVoted) {
        throw new Error('user has already voted')
      }
    })
    await Promise.all(votePromises)

    const hashedUserId = hashing(user._id.toString())
    const vote = await createVoteService(payload, hashedUserId)
    election.votes = election.votes.concat(vote._id)
    await election.save()
    return res.status(201).send({ status: 201, message: 'create vote success' })
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(404).send({ status: 404, message: error.message })
    } else if (error.message.includes('has already vote')) {
      res.status(400).send({ status: 400, message: error.message })
    } else if (error.message.includes('cannot vote')) {
      res.status(400).send({ status: 400, message: error.message })
    } else {
      next(error)
    }
  }
}
