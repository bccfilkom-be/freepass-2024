import Joi from 'joi'
import type { RegisterForm, LoginForm } from '../types/auth.type'

export const createUserValidation = (payload: RegisterForm) => {
  const schema = Joi.object({
    fullName: Joi.string().required(),
    nim: Joi.string().required(),
    faculty: Joi.string().required(),
    major: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required()
  })

  return schema.validate(payload)
}

export const loginValidation = (payload: LoginForm) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  })

  return schema.validate(payload)
}
