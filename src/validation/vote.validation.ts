import Joi from 'joi'
import type { CreateVoteForm } from '../types/vote.type'

export const createVoteValidation = (payload: CreateVoteForm) => {
  const schema = Joi.object({
    candidate: Joi.string().required()
  })

  return schema.validate(payload)
}
