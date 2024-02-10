import type { NextFunction, Request, Response } from 'express'
import { findUserById, updateUserById, findUserByField, getAllUsers } from '../services/user.service'
import { updateUserValidation } from '../validation/user.validation'
import type { UpdateUserForm } from '../types/user.type'

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const id: string = res.locals.user._doc._id

  try {
    const payload: UpdateUserForm = req.body

    const { error } = updateUserValidation(payload)
    if (error) throw error

    const user = await findUserById(id)
    if (!user) throw new Error('user not found')

    let foundUser: boolean = false
    if (payload.nim) foundUser = !!(await findUserByField('nim', payload.nim))
    if (foundUser) throw Error('nim has been taken')

    if (payload.username) foundUser = !!(await findUserByField('username', payload.username))
    if (foundUser) throw Error('username has been taken')

    if (payload.email) foundUser = !!(await findUserByField('email', payload.email))
    if (foundUser) throw new Error('email has been taken')

    await updateUserById(id, payload)
    return res.status(200).send({ status: 200, message: 'user update success', data: payload })
  } catch (error: any) {
    if (error.message.includes('has been taken')) {
      res.status(400).send({ status: 400, message: error.message })
    } else {
      next(error)
    }
  }
}

export const viewAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  const users = await getAllUsers()
  return res.status(200).send({ status: 200, message: 'get all users success', data: { users, length: users.length } })
}

export const viewUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId

  try {
    const user = await findUserById(userId)
    if (!user) throw new Error('user not found')

    return res.status(200).send({ status: 200, message: 'view user by id success', data: user })
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(400).send({ status: 400, message: error.message })
    } else {
      next(error)
    }
  }
}
