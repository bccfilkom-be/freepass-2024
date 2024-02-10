import type { Types } from 'mongoose'

export interface CreateVoteForm {
  candidate: string
}

export interface VoteType {
  hashedUserId: string
  candidate: Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
  _id: Types.ObjectId
}

export interface VoteDocument extends Document, VoteType {}
