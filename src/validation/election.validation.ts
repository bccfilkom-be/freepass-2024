import Joi from 'joi'
import type { CreateElectionForm } from '../types/election.type'

export const createElectionValidation = (payload: CreateElectionForm) => {
  const schema = Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).greater('now').required()
  })

  return schema.validate(payload)
}
