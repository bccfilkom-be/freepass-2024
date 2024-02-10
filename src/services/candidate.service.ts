import { Candidate } from '../models/candidate.model'
import { deletePostById } from './post.service'
import { findUserById } from './user.service'

export const createCandidate = async (userId: string) => {
  return await Candidate.create({ user: userId })
}

export const findCandidateByField = async (field: string, value: string) => {
  return await Candidate.findOne({ [field]: value })
}

export const getAllCandidates = async () => {
  return await Candidate.find({}).populate('posts')
}

export const findCandidateById = async (candidateId: string) => {
  return await Candidate.findById(candidateId).populate('posts')
}

export const deleteCandidateById = async (candidateId: string) => {
  const candidate = await findCandidateById(candidateId)
  if (!candidate) return candidate

  const posts = candidate.posts
  const deletePostPromises = posts.map(async (post) => {
    await deletePostById(post._id.toString())
  })
  await Promise.all(deletePostPromises)

  const user = await findUserById(candidate.user._id.toString())
  if (user) {
    user.role = 'user'
    await user.save()
  }

  return await Candidate.findByIdAndDelete(candidateId)
}
