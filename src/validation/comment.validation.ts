import Joi from 'joi'
import type { CreateCommentForm, UpdateCommentForm } from '../types/comment.type'

export const createCommentValidation = (payload: CreateCommentForm) => {
  const schema = Joi.object({
    caption: Joi.string().required()
  })

  return schema.validate(payload)
}

export const updateCommentValidation = (payload: UpdateCommentForm) => {
  const schema = Joi.object({
    caption: Joi.string().required()
  })

  return schema.validate(payload)
}
