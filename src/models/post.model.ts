import mongoose from 'mongoose'
import type { PostDocument } from '../types/post.type'

const postSchema = new mongoose.Schema<PostDocument>(
  {
    caption: {
      type: String,
      required: true,
      trim: true
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
      }
    ]
  },
  {
    timestamps: true
  }
)

postSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

/**
 * @typedef Post
 */
export const Post = mongoose.model('Post', postSchema)
