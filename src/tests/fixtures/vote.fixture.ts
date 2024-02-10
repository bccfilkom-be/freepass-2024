import mongoose from 'mongoose'
import type { VoteType } from '../../types/vote.type'
import { newUser } from './user.fixture'
import { hashing } from '../../utils/bcrypt'
import { newCandidate } from './candidate.fixture'

export const newVote: VoteType = {
  _id: new mongoose.Types.ObjectId(),
  hashedUserId: hashing(newUser._id.toString()),
  candidate: newCandidate._id
}
