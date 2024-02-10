import type { Types } from 'mongoose'

export interface CreateElectionForm {
  startDate: Date
  endDate: Date
}

export interface ElectionType {
  startDate: Date
  endDate: Date
  votes: Types.ObjectId[]
  createdAt?: Date
  updatedAt?: Date
  _id: Types.ObjectId
}

export interface ElectionDocument extends Document, ElectionType {}
