import mongoose from 'mongoose'
import type { CommentDocument } from '../types/comment.type'

const commentSchema = new mongoose.Schema<CommentDocument>(
  {
    caption: {
      type: String,
      required: true,
      trim: true
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
)

commentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

/**
 * @typedef Comment
 */
export const Comment = mongoose.model('Comment', commentSchema)
