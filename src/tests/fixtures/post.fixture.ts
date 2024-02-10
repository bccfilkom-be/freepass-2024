import mongoose from 'mongoose'
import { newCandidate } from './candidate.fixture'
import type { PostType } from '../../types/post.type'

export const newPost: PostType = {
  _id: new mongoose.Types.ObjectId(),
  caption: 'hai ini caption',
  candidate: newCandidate._id,
  comments: []
}
