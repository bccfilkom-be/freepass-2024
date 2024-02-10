import { Router } from 'express'
import { requireAdmin, requireCandidate, requireUser } from '../../middlewares/auth'
import { createPost, updatePost, deletePost, viewPost, viewAllPosts } from '../../controller/post.controller'
import { createComment, viewPostComments } from '../../controller/comment.controller'

export const postRouter: Router = Router()

postRouter.get('/', requireAdmin, viewAllPosts)
postRouter.get('/:postId', viewPost)
postRouter.post('/', requireCandidate, createPost)
postRouter.patch('/:postId', requireCandidate, updatePost)
postRouter.delete('/:postId', requireCandidate, deletePost)
postRouter.post('/:postId', requireUser, createComment)
postRouter.get('/:postId/comment', requireAdmin, viewPostComments)
