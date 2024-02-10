import mongoose from 'mongoose'
import type { VoteType } from '../types/vote.type'

const voteSchema = new mongoose.Schema<VoteType>(
  {
    hashedUserId: {
      type: String,
      required: true
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true
    }
  },
  {
    timestamps: true
  }
)

voteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.hashedUser
    delete returnedObject.__v
  }
})

/**
 * @typedef Vote
 */
export const Vote = mongoose.model('Vote', voteSchema)
