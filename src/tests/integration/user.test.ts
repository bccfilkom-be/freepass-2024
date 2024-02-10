import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { app } from '../../app'
import { User } from '../../models/user.model'
import type { UpdateUserForm } from '../../types/user.type'
import type { RegisterForm } from '../../types/auth.type'
import { hashing } from '../../utils/bcrypt'
import { findUserByField } from '../../services/user.service'

describe('userRoutes', () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoose.connection.close()
  })

  describe('patch /v1/user/profile', () => {
    let token: string
    let newUser: RegisterForm
    let newOtherUser: RegisterForm
    beforeAll(async () => {
      newUser = {
        fullName: 'valid full name',
        username: 'validusername',
        nim: '231502001110111',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'validemail@gmail.com',
        password: 'validpassword'
      }
      await supertest(app).post('/v1/auth/register').send(newUser)

      const res = await supertest(app)
        .post('/v1/auth/login')
        .send({ username: newUser.username, password: newUser.password })
      token = res.body.data

      newOtherUser = {
        fullName: 'valid full name',
        username: 'othervalidusername',
        nim: '231502001110112',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'othervalidemail@gmail.com',
        password: 'validpassword'
      }
      await supertest(app).post('/v1/auth/register').send(newOtherUser)
    })

    let request: UpdateUserForm
    beforeEach(() => {
      request = {
        fullName: 'valid new full name',
        nim: '235150200111012',
        faculty: 'valid new faculty',
        major: 'valid new major',
        username: 'validnewusername',
        email: 'validnewemail@gmail.com',
        password: 'validnewpassword'
      }
    })

    test('should return 200 and updated data if request data is ok and correct token', async () => {
      const res = await supertest(app).patch('/v1/user/profile').set('Authorization', `Bearer ${token}`).send(request)
      expect(res.body.status).toBe(200)

      const user = await User.findOne({ username: request.username })
      expect(user?.username).toEqual(request.username)

      expect(res.body.data.username).toEqual(request.username)
    })

    test('should return 403 forbidden if token is wrong or empty', async () => {
      const res = await supertest(app).patch('/v1/user/profile').send(request)
      expect(res.body.status).toBe(403)
    })

    test('should return 400 and if request data is not valid', async () => {
      request.email = 'notvalidemail.com'
      const res = await supertest(app).patch('/v1/user/profile').set('Authorization', `Bearer ${token}`).send(request)
      expect(res.body.status).toBe(400)
    })

    test('should return 400 and if request data is taken', async () => {
      request.email = newOtherUser.email
      const res = await supertest(app).patch('/v1/user/profile').set('Authorization', `Bearer ${token}`).send(request)
      expect(res.body.status).toBe(400)
    })
  })

  describe('get /v1/user', () => {
    let newUser: RegisterForm
    beforeAll(async () => {
      newUser = {
        fullName: 'valid full name',
        username: 'validusername',
        nim: '231502001110111',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'validemail@gmail.com',
        password: 'validpassword'
      }
      await supertest(app).post('/v1/auth/register').send(newUser)

      const password = hashing('password')
      const admin = new User({
        fullName: 'admin',
        nim: '0000001',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'admin@gmail.com',
        username: 'admin',
        password,
        role: 'admin'
      })
      await admin.save()
    })

    test("should return 200 if logged user's role correct", async () => {
      const token = (await supertest(app).post('/v1/auth/login').send({ username: 'admin', password: 'password' })).body
        .data
      const res = await supertest(app).get('/v1/user').set('Authorization', `Bearer ${token}`)
      expect(res.body.status).toBe(200)
    })

    test("should return 403 if logged user's role not correct", async () => {
      const token = (
        await supertest(app).post('/v1/auth/login').send({ username: newUser.username, password: newUser.password })
      ).body.data
      const res = await supertest(app).get('/v1/user').set('Authorization', `Bearer ${token}`)
      expect(res.body.status).toBe(403)
    })
  })

  describe('get /v1/user/:id', () => {
    let newUser: RegisterForm
    beforeAll(async () => {
      newUser = {
        fullName: 'valid full name',
        username: 'validusername2',
        nim: '231502001110112',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'validemail2@gmail.com',
        password: 'validpassword'
      }
      await supertest(app).post('/v1/auth/register').send(newUser)

      const password = hashing('password')
      const admin = new User({
        fullName: 'admin',
        nim: '0000002',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'admin2@gmail.com',
        username: 'admin2',
        password,
        role: 'admin'
      })
      await admin.save()
    })

    test("should return 200 if id is ok and logged user's role correct", async () => {
      const token = (await supertest(app).post('/v1/auth/login').send({ username: 'admin2', password: 'password' }))
        .body.data
      const user = await findUserByField('username', newUser.username)
      if (user) {
        const res = await supertest(app).get(`/v1/user/${user._id}`).set('Authorization', `Bearer ${token}`)
        expect(res.body.status).toBe(200)
      }
    })

    test('should return 400 if id is not ok', async () => {
      const token = (await supertest(app).post('/v1/auth/login').send({ username: 'admin2', password: 'password' }))
        .body.data

      const userId = 'wronguserid'
      const res = await supertest(app).get(`/v1/user/${userId}`).set('Authorization', `Bearer ${token}`)
      expect(res.body.status).toBe(400)
    })

    test("should return 403 if logged user's role not correct", async () => {
      const token = (
        await supertest(app).post('/v1/auth/login').send({ username: newUser.username, password: newUser.password })
      ).body.data
      const user = await findUserByField('username', newUser.username)
      if (user) {
        const res = await supertest(app).get(`/v1/user/${user._id}`).set('Authorization', `Bearer ${token}`)
        expect(res.body.status).toBe(403)
      }
    })
  })
})
