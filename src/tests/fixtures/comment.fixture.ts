import mongoose from 'mongoose'
import { newUser } from './user.fixture'
import { newPost } from './post.fixture'
import type { CommentType } from '../../types/comment.type'

export const newComment: CommentType = {
  _id: new mongoose.Types.ObjectId(),
  caption: 'hai ini caption',
  user: newUser._id,
  post: newPost._id
}
