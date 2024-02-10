import { Router } from 'express'
import {
  promoteUser,
  deleteUser,
  deleteCandidate,
  deletePost,
  deleteComment,
  createElection,
  viewAllElections,
  viewElection
} from '../../controller/admin.controller'
import { requireAdmin } from '../../middlewares/auth'

export const adminRouter: Router = Router()

adminRouter.post('/election', requireAdmin, createElection)
adminRouter.get('/election', requireAdmin, viewAllElections)
adminRouter.get('/election/:electionId', requireAdmin, viewElection)
adminRouter.post('/:userId', requireAdmin, promoteUser)
adminRouter.delete('/user/:userId', requireAdmin, deleteUser)
adminRouter.delete('/candidate/:candidateId', requireAdmin, deleteCandidate)
adminRouter.delete('/post/:postId', requireAdmin, deletePost)
adminRouter.delete('/comment/:commentId', requireAdmin, deleteComment)
