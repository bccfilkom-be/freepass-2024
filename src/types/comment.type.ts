import type { Types } from 'mongoose'

export interface CreateCommentForm {
  caption: string
}

export interface UpdateCommentForm {
  caption: string
}

export interface CommentType {
  caption: string
  post: Types.ObjectId
  user: Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
  _id: Types.ObjectId
}

export interface CommentDocument extends Document, CommentType {}
