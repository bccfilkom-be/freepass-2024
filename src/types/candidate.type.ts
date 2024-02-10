import type { Types } from 'mongoose'

export interface CandidateType {
  user: Types.ObjectId
  posts: Types.ObjectId[]
  createdAt?: Date
  updatedAt?: Date
  _id: Types.ObjectId
}

export interface CandidateDocument extends Document, CandidateType {}
