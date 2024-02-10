import type { NextFunction, Request, Response } from 'express'
import type { RegisterForm, LoginForm } from '../types/auth.type'
import { findUserByField } from '../services/user.service'
import { createUser, findUserByUsername } from '../services/auth.service'
import { createUserValidation, loginValidation } from '../validation/auth.validation'
import { checkPassword, hashing } from '../utils/bcrypt'
import { signJWT } from '../utils/jwt'
import { config } from '../utils/config'

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload: RegisterForm = req.body

    const { error } = createUserValidation(payload)
    if (error) throw error

    let foundUser: boolean = false
    if (payload.nim) foundUser = !!(await findUserByField('nim', payload.nim))
    if (foundUser) throw Error('nim has been taken')

    if (payload.username) foundUser = !!(await findUserByField('username', payload.username))
    if (foundUser) throw Error('username has been taken')

    if (payload.email) foundUser = !!(await findUserByField('email', payload.email))
    if (foundUser) throw new Error('email has been taken')

    payload.password = hashing(payload.password)
    const user = await createUser(payload)
    return res.status(201).send({ status: 201, message: `create user success. please login ${user.username}` })
  } catch (error: any) {
    if (error.message.includes('has been taken')) {
      res.status(400).send({ status: 400, message: error.message })
    } else {
      next(error)
    }
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload: LoginForm = req.body
    const { error } = loginValidation(payload)
    if (error) throw error

    const user = await findUserByUsername(payload.username)
    if (!user) throw Error('username is wrong')

    const isValid = checkPassword(payload.password, user.password)
    if (!isValid) throw Error('password is wrong')

    const token = signJWT({ ...user }, { expiresIn: config.jwtAccessExpiration })
    return res.status(200).send({ status: 200, message: 'login success', data: token })
  } catch (error: any) {
    if (error.message.includes('is wrong')) {
      res.status(400).send({ status: 400, message: error.message })
    } else {
      next(error)
    }
  }
}
