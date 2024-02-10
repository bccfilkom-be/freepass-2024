import type { UpdateUserForm } from '../types/user.type'
import { User } from '../models/user.model'
import { deleteCommentById } from './comment.service'

export const findUserById = async (userId: string) => {
  return await User.findById(userId)
}

export const findUserByField = async (field: string, value: string) => {
  return await User.findOne({ [field]: value })
}

export const updateUserById = async (userId: string, payload: UpdateUserForm) => {
  return await User.findByIdAndUpdate(userId, payload, { new: true })
}

export const findUserByIdAndPromote = async (userId: string) => {
  return await User.findByIdAndUpdate(userId, { role: 'candidate' }, { new: true })
}

export const getAllUsers = async () => {
  return await User.find({})
}

export const deleteUserById = async (userId: string) => {
  const user = await findUserById(userId)
  if (!user) return user

  const comments = user.comments
  const deleteCommentPromises = comments.map(async (comment) => {
    await deleteCommentById(comment._id.toString())
  })
  await Promise.all(deleteCommentPromises)

  return await User.findByIdAndDelete(userId)
}
