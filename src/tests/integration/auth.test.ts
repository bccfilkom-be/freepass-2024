import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { app } from '../../app'
import { User } from '../../models/user.model'
import type { RegisterForm, LoginForm } from '../../types/auth.type'

describe('authRoutes', () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoose.connection.close()
  })

  describe('POST /v1/auth/register', () => {
    let newUser: RegisterForm
    beforeEach(() => {
      newUser = {
        fullName: 'valid full name',
        username: 'validusername',
        nim: '231502001110111',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'validemail@gmail.com',
        password: 'validpassword'
      }
    })

    test('should return 201 and successfully register user if request data is ok', async () => {
      const res = await supertest(app).post('/v1/auth/register').send(newUser)
      expect(res.body.status).toBe(201)

      const user = await User.findOne({ username: newUser.username })
      expect(user).toBeDefined()
    })

    test('should return 400 if some request data is already taken', async () => {
      await supertest(app).post('/v1/auth/register').send(newUser)
      const res = await supertest(app).post('/v1/auth/register').send(newUser)
      expect(res.body.status).toBe(400)
    })

    test('should return 400 if email is not valid', async () => {
      const res = await supertest(app).post('/v1/auth/register').send(newUser)
      expect(res.body.status).toBe(400)
    })

    test('should return 400 if something is empty', async () => {
      newUser.email = ''
      const res = await supertest(app).post('/v1/auth/register').send(newUser)
      expect(res.body.status).toBe(400)
    })
  })

  describe('POST /v1/auth/login', () => {
    beforeAll(async () => {
      const newUser: RegisterForm = {
        fullName: 'valid full name',
        username: 'validusername',
        nim: '231502001110111',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'validemail@gmail.com',
        password: 'validpassword'
      }
      await supertest(app).post('/v1/auth/register').send(newUser)
    })

    let existingUser: LoginForm
    beforeEach(() => {
      existingUser = {
        username: 'validusername',
        password: 'validpassword'
      }
    })

    test('should return 200 if request data is ok', async () => {
      const res = await supertest(app).post('/v1/auth/login').send(existingUser)
      expect(res.body.status).toBe(200)
    })

    test('should return 400 if request data is not ok', async () => {
      existingUser.username = ''
      const res = await supertest(app).post('/v1/auth/login').send(existingUser)
      expect(res.body.status).toBe(400)
    })

    test('should return 401 if username is wrong', async () => {
      existingUser.username = 'notFound'
      const res = await supertest(app).post('/v1/auth/login').send(existingUser)
      expect(res.body.status).toBe(400)
    })

    test('should return 401 if password is wrong', async () => {
      existingUser.password = 'wrongPassword'
      const res = await supertest(app).post('/v1/auth/login').send(existingUser)
      expect(res.body.status).toBe(400)
    })
  })
})
