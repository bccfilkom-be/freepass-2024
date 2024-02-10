import mongoose from 'mongoose'
import type { CandidateDocument } from '../types/candidate.type'

const candidateSchema = new mongoose.Schema<CandidateDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
      }
    ]
  },
  {
    timestamps: true
  }
)

candidateSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

/**
 * @typedef Candidate
 */
export const Candidate = mongoose.model('Candidate', candidateSchema)
