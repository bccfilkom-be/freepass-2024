import Joi from 'joi'
import type { CreatePostForm, UpdatePostForm } from '../types/post.type'

export const createPostValidation = (payload: CreatePostForm) => {
  const schema = Joi.object({
    caption: Joi.string().required()
  })

  return schema.validate(payload)
}

export const updatePostValidation = (payload: UpdatePostForm) => {
  const schema = Joi.object({
    caption: Joi.string().required()
  })

  return schema.validate(payload)
}
