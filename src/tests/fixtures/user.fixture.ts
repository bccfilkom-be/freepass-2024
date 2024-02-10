import mongoose from 'mongoose'
import { hashing } from '../../utils/bcrypt'
import type { UserType } from '../../types/user.type'

const password = 'password'
const hashedPassword = hashing(password)

export const newUser: UserType = {
  _id: new mongoose.Types.ObjectId(),
  fullName: 'user',
  username: 'user',
  nim: '1',
  faculty: 'ilmu komputer',
  major: 'teknik informatika',
  email: 'user@gmail.com',
  password: hashedPassword,
  role: 'user',
  commentedPosts: [],
  comments: []
}

export const newUserCandidate: UserType = {
  _id: new mongoose.Types.ObjectId(),
  fullName: 'candidate',
  username: 'candidate',
  nim: '2',
  faculty: 'ilmu komputer',
  major: 'teknik informatika',
  email: 'candidate@gmail.com',
  password: hashedPassword,
  role: 'candidate',
  commentedPosts: [],
  comments: []
}

export const newAdmin: UserType = {
  _id: new mongoose.Types.ObjectId(),
  fullName: 'admin',
  nim: '0000001',
  faculty: 'ilmu komputer',
  major: 'teknik informatika',
  email: 'admin@gmail.com',
  username: 'admin',
  password: hashedPassword,
  role: 'admin',
  commentedPosts: [],
  comments: []
}
