import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { User } from '../models/user.model'
import { newAdmin, newUser, newUserCandidate } from './fixtures/user.fixture'
import { app } from '../app'
import supertest from 'supertest'
import { Candidate } from '../models/candidate.model'
import { newCandidate } from './fixtures/candidate.fixture'
import { newPost } from './fixtures/post.fixture'
import { newComment } from './fixtures/comment.fixture'
import { Post } from '../models/post.model'
import { Comment } from '../models/comment.model'
import { Election } from '../models/election.model'
import { newElection } from './fixtures/election.fixture'
import { Vote } from '../models/vote.model'
import { newVote } from './fixtures/vote.fixture'

export let userToken: string
export let candidateToken: string
export let adminToken: string
export const setupTestDB = async () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })

  beforeEach(async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map(async (collection) => await collection.deleteMany())
    )

    const user = new User(newUser)
    await user.save()

    const userCandidate = new User(newUserCandidate)
    await userCandidate.save()

    const admin = new User(newAdmin)
    await admin.save()

    const candidate = new Candidate(newCandidate)
    await candidate.save()

    const post = new Post(newPost)
    await post.save()

    const comment = new Comment(newComment)
    await comment.save()

    const election = new Election(newElection)
    await election.save()

    const vote = new Vote(newVote)
    await vote.save()

    user.commentedPosts = user.commentedPosts.concat(newPost._id)
    user.comments = user.comments.concat(newComment._id)

    candidate.posts = candidate.posts.concat(newPost._id)

    post.comments = post.comments.concat(newComment._id)

    election.votes = election.votes.concat(vote._id)

    await user.save()
    await candidate.save()
    await post.save()

    userToken = (await supertest(app).post('/v1/auth/login').send({ username: newUser.username, password: 'password' }))
      .body.data
    candidateToken = (
      await supertest(app).post('/v1/auth/login').send({ username: newUserCandidate.username, password: 'password' })
    ).body.data
    adminToken = (
      await supertest(app).post('/v1/auth/login').send({ username: newAdmin.username, password: 'password' })
    ).body.data
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoose.connection.close()
  })
}
