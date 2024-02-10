import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { app } from '../../app'
import { User } from '../../models/user.model'
import type { RegisterForm } from '../../types/auth.type'
import { checkPassword, hashing } from '../../utils/bcrypt'
import { findUserByField } from '../../services/user.service'
import { findCandidateByField } from '../../services/candidate.service'
import { findElectionById, getAllElections } from '../../services/election.service'
import { findVoteById } from '../../services/vote.service'

describe('voteRoutes', () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoose.connection.close()
  })

  describe('post /v1/election/:id', () => {
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

      const user = await findUserByField('username', newCandidate.username)
      await supertest(app).post(`/v1/admin/${user?._id}`).set('Authorization', `Bearer ${token}`).expect(200)
      await supertest(app).post('/v1/admin/election').set('Authorization', `Bearer ${token}`).send({
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      })
    })

    test("should return 200 if id and request data is ok also logged user's role is correct", async () => {
      token = (
        await supertest(app)
          .post('/v1/auth/login')
          .send({ username: newUser.username, password: newUser.password })
          .expect(200)
      ).body.data

      const userCandidate = await findUserByField('username', newCandidate.username)
      if (userCandidate) {
        const candidate = await findCandidateByField('user', userCandidate._id.toString())
        if (candidate) {
          const elections = await getAllElections()
          if (elections) {
            const newElection = elections.at(0)
            if (newElection) {
              const res = await supertest(app)
                .post(`/v1/vote/${newElection._id.toString()}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ candidate: candidate._id.toString() })
              expect(res.body.status).toBe(201)

              const election = await findElectionById(newElection._id.toString())
              if (election) {
                const votes = election.votes
                expect(votes).toHaveLength(1)

                const newVote = votes.at(0)
                if (newVote) {
                  const vote = await findVoteById(newVote._id.toString())
                  if (vote) {
                    expect(vote.candidate._id.toString()).toBe(candidate._id.toString())

                    const user = await findUserByField('username', newUser.username)
                    if (user) {
                      const isVoted = checkPassword(user._id.toString(), vote.hashedUserId)
                      expect(isVoted).toBeTruthy()
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    test('should return 400 if user has already vote', async () => {
      token = (
        await supertest(app)
          .post('/v1/auth/login')
          .send({ username: newUser.username, password: newUser.password })
          .expect(200)
      ).body.data

      const userCandidate = await findUserByField('username', newCandidate.username)
      if (userCandidate) {
        const candidate = await findCandidateByField('user', userCandidate._id.toString())
        if (candidate) {
          const elections = await getAllElections()
          if (elections) {
            const newElection = elections.at(0)
            if (newElection) {
              const res = await supertest(app)
                .post(`/v1/vote/${newElection._id.toString()}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ candidateId: candidate._id.toString() })
              expect(res.body.status).toBe(400)

              const election = await findElectionById(newElection._id.toString())
              if (election) {
                const votes = election.votes
                expect(votes).toHaveLength(1)
              }
            }
          }
        }
      }
    })
  })
})
