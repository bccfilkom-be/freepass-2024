import { Router } from 'express'
import { register, login } from '../../controller/auth.controller'

export const authRouter: Router = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
