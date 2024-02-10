import type { Types } from 'mongoose'

export interface CreatePostForm {
  caption: string
}

export interface UpdatePostForm {
  caption: string
}

export interface PostType {
  caption: string
  candidate: Types.ObjectId
  comments: Types.ObjectId[]
  createdAt?: Date
  updatedAt?: Date
  _id: Types.ObjectId
}

export interface PostDocument extends Document, PostType {}
