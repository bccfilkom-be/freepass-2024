import { Router } from 'express'
import { requireUser } from '../../middlewares/auth'
import { createVote } from '../../controller/vote.controller'

export const voteRouter: Router = Router()

voteRouter.post('/:electionId', requireUser, createVote)
