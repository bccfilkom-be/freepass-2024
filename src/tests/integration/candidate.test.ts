import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { app } from '../../app'
import { User } from '../../models/user.model'
import type { RegisterForm } from '../../types/auth.type'
import { hashing } from '../../utils/bcrypt'
import { findUserByField } from '../../services/user.service'
import { findCandidateByField } from '../../services/candidate.service'

describe('candidateRoutes', () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoose.connection.close()
  })

  describe('get /v1/candidate', () => {
    let newUser: RegisterForm
    let token: string
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

      token = (await supertest(app).post('/v1/auth/login').send({ username: 'admin2', password: 'password' })).body.data
      const user = await findUserByField('username', newUser.username)
      if (user) await supertest(app).post(`/v1/admin/${user._id}`).set('Authorization', `Bearer ${token}`)
    })

    test("should return 200 if logged user's role correct", async () => {
      const res = await supertest(app).get('/v1/candidate').set('Authorization', `Bearer ${token}`)
      expect(res.body.status).toBe(200)
    })

    test("should return 403 if logged user's role not correct", async () => {
      const token = (
        await supertest(app).post('/v1/auth/login').send({ username: newUser.username, password: newUser.password })
      ).body.data
      const res = await supertest(app).get('/v1/candidate').set('Authorization', `Bearer ${token}`)
      expect(res.body.status).toBe(403)
    })
  })

  describe('get /v1/candidate/:id', () => {
    let newUser: RegisterForm
    let token: string
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

      token = (await supertest(app).post('/v1/auth/login').send({ username: 'admin', password: 'password' })).body.data
    })

    test("should return 200 if id is ok and logged user's role correct", async () => {
      const user = await findUserByField('username', newUser.username)
      if (user) {
        await supertest(app).post(`/v1/admin/${user._id.toString()}`).set('Authorization', `Bearer ${token}`)
        const candidate = await findCandidateByField('user', user._id.toString())
        if (candidate) {
          const res = await supertest(app)
            .get(`/v1/candidate/${candidate._id.toString()}`)
            .set('Authorization', `Bearer ${token}`)
          expect(res.body.status).toBe(200)
        }
      }
    })

    test('should return 400 if id is not ok', async () => {
      const userId = 'wronguserid'
      const res = await supertest(app).get(`/v1/candidate/${userId}`).set('Authorization', `Bearer ${token}`)
      expect(res.body.status).toBe(400)
    })

    test("should return 403 if logged user's role not correct", async () => {
      const token = (
        await supertest(app).post('/v1/auth/login').send({ username: newUser.username, password: newUser.password })
      ).body.data
      const user = await findUserByField('username', newUser.username)
      if (user) {
        await supertest(app).post(`/v1/admin/${user._id}`).set('Authorization', `Bearer ${token}`)
        const res = await supertest(app).get(`/v1/candidate/${user._id}`).set('Authorization', `Bearer ${token}`)
        expect(res.body.status).toBe(403)
      }
    })
  })

  describe('get /v1/candidate/:id/post', () => {
    let newUser: RegisterForm
    let token: string
    let candidateId: string
    beforeAll(async () => {
      newUser = {
        fullName: 'valid full name',
        username: 'validusernam3',
        nim: '231502001110113',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'validemai3@gmail.com',
        password: 'validpassword'
      }
      await supertest(app).post('/v1/auth/register').send(newUser)

      const password = hashing('password')
      const admin = new User({
        fullName: 'admin',
        nim: '0000003',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'admin3@gmail.com',
        username: 'admin3',
        password,
        role: 'admin'
      })
      await admin.save()

      token = (await supertest(app).post('/v1/auth/login').send({ username: 'admin', password: 'password' })).body.data
      const user = await findUserByField('username', newUser.username)
      if (user) {
        await supertest(app).post(`/v1/admin/${user._id}`).set('Authorization', `Bearer ${token}`)
        token = (
          await supertest(app).post('/v1/auth/login').send({ username: newUser.username, password: newUser.password })
        ).body.data
        const payload = {
          caption: 'valid caption'
        }
        await supertest(app).post('/v1/post').set('Authorization', `Bearer ${token}`).send(payload)
        const candidate = await findCandidateByField('user', user._id.toString())
        if (candidate) candidateId = candidate._id.toString()
      }
      token = (await supertest(app).post('/v1/auth/login').send({ username: 'admin', password: 'password' })).body.data
    })

    test("should return 200 if id is ok and logged user's role correct", async () => {
      const res = await supertest(app).get(`/v1/candidate/${candidateId}/post`).set('Authorization', `Bearer ${token}`)
      expect(res.body.status).toBe(200)
    })

    test('should return 400 if id is not ok', async () => {
      const candidateId = 'wrongcandidateid'
      const res = await supertest(app).get(`/v1/candidate/${candidateId}/post`).set('Authorization', `Bearer ${token}`)
      expect(res.body.status).toBe(400)
    })

    test("should return 403 if logged user's role not correct", async () => {
      const token = (
        await supertest(app).post('/v1/auth/login').send({ username: newUser.username, password: newUser.password })
      ).body.data
      const res = await supertest(app).get(`/v1/candidate/${candidateId}/post`).set('Authorization', `Bearer ${token}`)
      expect(res.body.status).toBe(403)
    })
  })
})
