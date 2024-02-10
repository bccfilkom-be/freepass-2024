import { Router } from 'express'
import { viewAllCandidates, viewCandidate, viewCandidatePosts } from '../../controller/candidate.controller'
import { requireAdmin, requireUser } from '../../middlewares/auth'

export const candidateRouter: Router = Router()

candidateRouter.get('/', requireUser, viewAllCandidates)
candidateRouter.get('/:candidateId', requireAdmin, viewCandidate)
candidateRouter.get('/:candidateId/post', requireUser, viewCandidatePosts)
