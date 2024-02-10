import type { CreateCommentForm } from '../types/comment.type'
import { Comment } from '../models/comment.model'
import { findUserById } from './user.service'
import { findPostById } from './post.service'

export const createCommentForId = async (payload: CreateCommentForm, postId: string, userId: string) => {
  return await Comment.create({ ...payload, post: postId, user: userId })
}

export const findCommentById = async (commentId: string) => {
  return await Comment.findById(commentId)
}

export const deleteCommentById = async (commentId: string) => {
  const comment = await findCommentById(commentId)
  if (!comment) return comment

  const userId = comment.user._id.toString()
  const user = await findUserById(userId)
  if (!user) return user

  user.comments = user.comments.filter((c) => c._id.toString() !== comment._id.toString())
  user.commentedPosts = user.commentedPosts.filter((post) => post._id.toString() !== comment.post._id.toString())
  await user.save()

  const postId = comment.post._id.toString()
  const post = await findPostById(postId)
  if (!post) return post

  post.comments = post.comments.filter((c) => c._id.toString() !== comment._id.toString())
  await post.save()

  return await Comment.findByIdAndDelete(commentId)
}
