import mongoose from 'mongoose'
import type { ElectionType } from '../../types/election.type'
import { stringtoDate } from '../../utils/date'

export const newElection: ElectionType = {
  _id: new mongoose.Types.ObjectId(),
  startDate: stringtoDate('2024-01-01'),
  endDate: stringtoDate('2024-12-31'),
  votes: []
}
