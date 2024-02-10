import bcrypt from 'bcrypt'

export const hashing = (password: string) => {
  const saltRounds = 10
  return bcrypt.hashSync(password, saltRounds)
}

export const checkPassword = (data: string, encrypted: string) => {
  return bcrypt.compareSync(data, encrypted)
}
