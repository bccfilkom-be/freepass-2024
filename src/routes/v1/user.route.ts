import { Router } from 'express'
import { updateUser, viewAllUsers, viewUser } from '../../controller/user.controller'
import { requireAdmin, requireUser } from '../../middlewares/auth'

export const userRouter: Router = Router()

userRouter.get('/', requireAdmin, viewAllUsers)
userRouter.get('/:userId', requireAdmin, viewUser)
userRouter.patch('/profile', requireUser, updateUser)
