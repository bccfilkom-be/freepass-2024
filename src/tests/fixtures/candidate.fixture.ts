import mongoose from 'mongoose'
import { newUserCandidate } from './user.fixture'
import type { CandidateType } from '../../types/candidate.type'

export const newCandidate: CandidateType = {
  _id: new mongoose.Types.ObjectId(),
  user: newUserCandidate._id,
  posts: []
}
