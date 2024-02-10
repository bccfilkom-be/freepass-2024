import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { app } from '../../app'
import { User } from '../../models/user.model'
import type { RegisterForm } from '../../types/auth.type'
import { hashing } from '../../utils/bcrypt'
import { findUserByField } from '../../services/user.service'
import { findPostByField, findPostById } from '../../services/post.service'
import { findCandidateByField } from '../../services/candidate.service'
import type { CreatePostForm, UpdatePostForm } from '../../types/post.type'

describe('postRoutes', () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoose.connection.close()
  })

  describe('post /v1/post/', () => {
    let newCandidate: RegisterForm
    let newUser: RegisterForm
    let token: string
    beforeAll(async () => {
      newCandidate = {
        fullName: 'valid full name',
        username: 'validusername',
        nim: '231502001110111',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'validemail@gmail.com',
        password: 'validpassword'
      }
      await supertest(app).post('/v1/auth/register').send(newCandidate).expect(201)

      newUser = {
        fullName: 'valid full name',
        username: 'validusername2',
        nim: '2315020011101112',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'validemail2@gmail.com',
        password: 'validpassword'
      }
      await supertest(app).post('/v1/auth/register').send(newUser).expect(201)

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

      token = (
        await supertest(app).post('/v1/auth/login').send({ username: 'admin', password: 'password' }).expect(200)
      ).body.data

      const candidate = await findUserByField('username', newCandidate.username)
      await supertest(app).post(`/v1/admin/${candidate?._id}`).set('Authorization', `Bearer ${token}`).expect(200)
    })

    let payload: CreatePostForm
    beforeEach(() => {
      payload = {
        caption: 'valid caption'
      }
    })

    test("should return 201 if request data is ok and logged user's role is correct", async () => {
      token = (
        await supertest(app)
          .post('/v1/auth/login')
          .send({ username: newCandidate.username, password: newCandidate.password })
          .expect(200)
      ).body.data
      const res = await supertest(app).post('/v1/post').set('Authorization', `Bearer ${token}`).send(payload)

      const user = await findUserByField('username', newCandidate.username)
      if (user) {
        const candidate = await findCandidateByField('user', user._id.toString())
        if (candidate) {
          const post = await findPostByField('candidate', candidate._id.toString())
          if (post) {
            expect(post).toBeDefined()
            expect(candidate.posts).toEqual([post._id])
            expect(res.body.status).toBe(201)
          }
        }
      }
    })

    test("should return 403 if logged user's role is not correct", async () => {
      token = (
        await supertest(app)
          .post('/v1/auth/login')
          .send({ username: newUser.username, password: newUser.password })
          .expect(200)
      ).body.data
      const res = await supertest(app).post('/v1/post').set('Authorization', `Bearer ${token}`).send(payload)

      const user = await findUserByField('username', newCandidate.username)
      if (user) {
        const candidate = await findCandidateByField('user', user._id.toString())
        if (candidate) {
          const post = await findPostByField('candidate', candidate.user.toString())
          if (post) {
            expect(post).not.toBeDefined()
            expect(candidate.posts).not.toContain(post._id.toString())
            expect(res.body.status).toBe(403)
          }
        }
      }
    })
  })

  describe('patch /v1/post/:id', () => {
    let newCandidate: RegisterForm
    let newUser: RegisterForm
    let postId: string
    let token: string
    beforeAll(async () => {
      newCandidate = {
        fullName: 'valid full name',
        username: 'validusername3',
        nim: '2315020011101113',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'validemail3@gmail.com',
        password: 'validpassword'
      }
      await supertest(app).post('/v1/auth/register').send(newCandidate).expect(201)

      newUser = {
        fullName: 'valid full name',
        username: 'validusername4',
        nim: '2315020011101114',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'validemail4@gmail.com',
        password: 'validpassword'
      }
      await supertest(app).post('/v1/auth/register').send(newUser).expect(201)

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

      token = (
        await supertest(app).post('/v1/auth/login').send({ username: 'admin2', password: 'password' }).expect(200)
      ).body.data

      const userCandidate = await findUserByField('username', newCandidate.username)
      if (userCandidate) {
        await supertest(app).post(`/v1/admin/${userCandidate._id}`).set('Authorization', `Bearer ${token}`).expect(200)
      }

      token = (
        await supertest(app)
          .post('/v1/auth/login')
          .send({ username: newCandidate.username, password: newCandidate.password })
          .expect(200)
      ).body.data
      const payload = {
        caption: 'valid caption'
      }
      await supertest(app).post('/v1/post').set('Authorization', `Bearer ${token}`).send(payload).expect(201)

      if (userCandidate) {
        const candidate = await findCandidateByField('user', userCandidate._id.toString())
        if (candidate) {
          const post = await findPostByField('candidate', candidate._id.toString())
          if (post) {
            postId = post._id.toString()
          }
        }
      }
    })

    let payload: UpdatePostForm
    beforeEach(() => {
      payload = {
        caption: 'new caption'
      }
    })

    test("should return 200 and updated data if request data is ok and logged user's role is correct", async () => {
      const res = await supertest(app).patch(`/v1/post/${postId}`).set('Authorization', `Bearer ${token}`).send(payload)
      expect(res.body.status).toBe(200)
      expect(res.body.data.caption).toEqual(payload.caption)

      const post = await findPostById(postId)
      if (post) expect(post.caption).toEqual(payload.caption)
    })

    test('should return 403 forbidden if token is wrong or empty', async () => {
      token = 'wrongtoken'
      const res = await supertest(app).patch(`/v1/post/${postId}`).set('Authorization', `Bearer ${token}`).send(payload)
      expect(res.body.status).toBe(403)
    })
  })

  describe('delete /v1/post/:id', () => {
    let newCandidate: RegisterForm
    let newUser: RegisterForm
    let postId: string
    let token: string
    beforeAll(async () => {
      newCandidate = {
        fullName: 'valid full name',
        username: 'validusername5',
        nim: '2315020011101115',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'validemail5@gmail.com',
        password: 'validpassword'
      }
      await supertest(app).post('/v1/auth/register').send(newCandidate).expect(201)

      newUser = {
        fullName: 'valid full name',
        username: 'validusername6',
        nim: '2315020011101116',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'validemail6@gmail.com',
        password: 'validpassword'
      }
      await supertest(app).post('/v1/auth/register').send(newUser).expect(201)

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

      token = (
        await supertest(app).post('/v1/auth/login').send({ username: 'admin3', password: 'password' }).expect(200)
      ).body.data

      const userCandidate = await findUserByField('username', newCandidate.username)
      if (userCandidate) {
        await supertest(app).post(`/v1/admin/${userCandidate._id}`).set('Authorization', `Bearer ${token}`).expect(200)
      }

      token = (
        await supertest(app)
          .post('/v1/auth/login')
          .send({ username: newCandidate.username, password: newCandidate.password })
          .expect(200)
      ).body.data
      const payload = {
        caption: 'valid caption'
      }
      await supertest(app).post('/v1/post').set('Authorization', `Bearer ${token}`).send(payload).expect(201)

      if (userCandidate) {
        const candidate = await findCandidateByField('user', userCandidate._id.toString())
        if (candidate) {
          const post = await findPostByField('candidate', candidate._id.toString())
          if (post) {
            postId = post._id.toString()
          }
        }
      }
    })

    test("should return 200 if id and logged user's role is correct", async () => {
      const res = await supertest(app).delete(`/v1/post/${postId}`).set('Authorization', `Bearer ${token}`)
      expect(res.body.status).toBe(200)

      const user = await findUserByField('username', newCandidate.username)
      if (user) {
        const candidate = await findCandidateByField('user', user._id.toString())
        if (candidate) {
          const post = await findPostByField('candidate', candidate._id.toString())
          if (post) {
            expect(post).not.toBeDefined()
            expect(candidate.posts).not.toEqual([post._id])
            expect(res.body.status).toBe(200)
          }
        }
      }
    })

    test('should return 403 forbidden if token is wrong or empty', async () => {
      token = 'wrongtoken'
      const res = await supertest(app).delete(`/v1/post/${postId}`).set('Authorization', `Bearer ${token}`)
      expect(res.body.status).toBe(403)
    })
  })

  describe('get /v1/post/:id', () => {
    let newCandidate: RegisterForm
    let newUser: RegisterForm
    let postId: string
    let token: string
    beforeAll(async () => {
      newCandidate = {
        fullName: 'valid full name',
        username: 'validusername7',
        nim: '2315020011101117',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'validemail7@gmail.com',
        password: 'validpassword'
      }
      await supertest(app).post('/v1/auth/register').send(newCandidate).expect(201)

      newUser = {
        fullName: 'valid full name',
        username: 'validusername8',
        nim: '2315020011101118',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'validemail8@gmail.com',
        password: 'validpassword'
      }
      await supertest(app).post('/v1/auth/register').send(newUser).expect(201)

      const password = hashing('password')
      const admin = new User({
        fullName: 'admin',
        nim: '0000004',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'admin4@gmail.com',
        username: 'admin4',
        password,
        role: 'admin'
      })
      await admin.save()

      token = (
        await supertest(app).post('/v1/auth/login').send({ username: 'admin4', password: 'password' }).expect(200)
      ).body.data

      const userCandidate = await findUserByField('username', newCandidate.username)
      if (userCandidate) {
        await supertest(app).post(`/v1/admin/${userCandidate._id}`).set('Authorization', `Bearer ${token}`).expect(200)
      }

      token = (
        await supertest(app)
          .post('/v1/auth/login')
          .send({ username: newCandidate.username, password: newCandidate.password })
          .expect(200)
      ).body.data
      const payload = {
        caption: 'valid caption'
      }
      await supertest(app).post('/v1/post').set('Authorization', `Bearer ${token}`).send(payload).expect(201)

      if (userCandidate) {
        const candidate = await findCandidateByField('user', userCandidate._id.toString())
        if (candidate) {
          const post = await findPostByField('candidate', candidate._id.toString())
          if (post) {
            postId = post._id.toString()
          }
        }
      }
    })

    test('should return 200 if id is correct', async () => {
      const res = await supertest(app).get(`/v1/post/${postId}`)
      expect(res.body.status).toBe(200)
    })

    test('should return 400 if id is not correct', async () => {
      postId = 'wrongid'
      const res = await supertest(app).get(`/v1/post/${postId}`)
      expect(res.body.status).toBe(400)
    })
  })

  describe('get /v1/post/', () => {
    let newCandidate: RegisterForm
    let newUser: RegisterForm
    beforeAll(async () => {
      newCandidate = {
        fullName: 'valid full name',
        username: 'validusername10',
        nim: '23150200111011110',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'validemail10@gmail.com',
        password: 'validpassword'
      }
      await supertest(app).post('/v1/auth/register').send(newCandidate).expect(201)

      newUser = {
        fullName: 'valid full name',
        username: 'validusername9',
        nim: '231502001110119',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'validemail9@gmail.com',
        password: 'validpassword'
      }
      await supertest(app).post('/v1/auth/register').send(newUser).expect(201)

      const password = hashing('password')
      const admin = new User({
        fullName: 'admin',
        nim: '0000005',
        faculty: 'valid faculty',
        major: 'valid major',
        email: 'admin5@gmail.com',
        username: 'admin5',
        password,
        role: 'admin'
      })
      await admin.save()

      let token = (
        await supertest(app).post('/v1/auth/login').send({ username: 'admin5', password: 'password' }).expect(200)
      ).body.data

      const userCandidate = await findUserByField('username', newCandidate.username)
      if (userCandidate) {
        await supertest(app).post(`/v1/admin/${userCandidate._id}`).set('Authorization', `Bearer ${token}`).expect(200)
      }

      token = (
        await supertest(app)
          .post('/v1/auth/login')
          .send({ username: newCandidate.username, password: newCandidate.password })
          .expect(200)
      ).body.data
      const payload = {
        caption: 'valid caption'
      }
      await supertest(app).post('/v1/post').set('Authorization', `Bearer ${token}`).send(payload).expect(201)
    })

    test("should return 200 if logged user's role is correct", async () => {
      const token = (
        await supertest(app).post('/v1/auth/login').send({ username: 'admin5', password: 'password' }).expect(200)
      ).body.data
      const res = await supertest(app).get('/v1/post').set('Authorization', `Bearer ${token}`)
      expect(res.body.status).toBe(200)
    })

    test("should return 403 if logged user's role is not correct", async () => {
      const token = (
        await supertest(app)
          .post('/v1/auth/login')
          .send({ username: newUser.username, password: newUser.password })
          .expect(200)
      ).body.data
      const res = await supertest(app).get('/v1/post').set('Authorization', `Bearer ${token}`)
      expect(res.body.status).toBe(403)
    })
  })
})
