import type { Types } from 'mongoose'

export interface UpdateUserForm {
  fullName: string
  nim: string
  faculty: string
  major: string
  username: string
  email: string
  password: string
}

export interface UserType {
  fullName: string
  nim: string
  faculty: string
  major: string
  username: string
  email: string
  password: string
  role: string
  commentedPosts: Types.ObjectId[]
  comments: Types.ObjectId[]
  createdAt?: Date
  updatedAt?: Date
  _id: Types.ObjectId
}

export interface UserDocument extends Document, UserType {}
