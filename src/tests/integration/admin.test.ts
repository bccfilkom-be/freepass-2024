import supertest from 'supertest'
import { app } from '../../app'
import { adminToken, setupTestDB, userToken } from '../setupTestDB'
import { findUserByField, findUserById } from '../../services/user.service'
import { findCandidateByField, findCandidateById } from '../../services/candidate.service'
import { findPostById } from '../../services/post.service'
import { findCommentById } from '../../services/comment.service'
import type { CreateElectionForm } from '../../types/election.type'
import type { UserDocument } from '../../types/user.type'
import { newUser, newUserCandidate } from '../fixtures/user.fixture'
import { newPost } from '../fixtures/post.fixture'
import { newComment } from '../fixtures/comment.fixture'
import { newCandidate } from '../fixtures/candidate.fixture'
import { stringtoDate } from '../../utils/date'

describe('Admin routes', () => {
  void setupTestDB()

  describe('POST /v1/admin/:userId', () => {
    test("should return 200 if id and logged user's role is correct", async () => {
      const userId = newUser._id.toString()
      const res = await supertest(app)
        .post(`/v1/admin/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      const user: UserDocument | null | undefined = await findUserByField('username', newUser.username)
      const candidate = await findCandidateByField('user', newUser._id.toString())

      expect(res.body.status).toBe(200)
      expect(user?.role).toEqual('candidate')
      expect(candidate).toBeDefined()
    })

    test('should return 400 if id is wrong', async () => {
      const userId = 'wrongid'
      const res = await supertest(app)
        .post(`/v1/admin/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400)

      const user = await findUserByField('username', newUser.username)
      const candidate = await findCandidateByField('user', newUser._id.toString())

      expect(res.body.status).toBe(400)
      expect(user?.role).toEqual('user')
      expect(candidate).toBeNull()
    })

    test("should return 403 if logged user's role is wrong", async () => {
      const userId = newUser._id.toString()
      const res = await supertest(app)
        .post(`/v1/admin/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403)

      const user = await findUserByField('username', newUser.username)
      const candidate = await findCandidateByField('user', newUser._id.toString())

      expect(res.body.status).toBe(403)
      expect(user?.role).toEqual('user')
      expect(candidate).toBeNull()
    })
  })

  describe('DELETE /v1/admin/user/:userId', () => {
    test("should return 200 if id is ok and logged user's role is correct (delete user)", async () => {
      const res = await supertest(app)
        .delete(`/v1/admin/user/${newUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
      const checkUser = await findUserById(newUser._id.toString())
      const checkPost = await findPostById(newPost._id.toString())
      const checkComment = await findCommentById(newComment._id.toString())

      expect(res.body.status).toBe(200)
      expect(checkUser).toBe(null)
      expect(checkPost?.comments).toHaveLength(0)
      expect(checkComment).toBe(null)
    })

    test("should return 200 if id is ok and logged user's role is correct (delete user who is candidate)", async () => {
      const res = await supertest(app)
        .delete(`/v1/admin/user/${newUserCandidate._id.toString()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
      const checkUser = await findUserById(newUserCandidate._id.toString())
      const checkCandidate = await findCandidateById(newCandidate._id.toString())
      const checkPost = await findPostById(newPost._id.toString())
      const checkComment = await findCommentById(newComment._id.toString())
      const checkCommentedUser = await findUserById(newComment.user._id.toString())

      expect(res.body.status).toBe(200)
      expect(checkUser).toBe(null)
      expect(checkCandidate).toBe(null)
      expect(checkPost).toBe(null)
      expect(checkComment).toBe(null)
      expect(checkCommentedUser?.comments).toHaveLength(0)
    })
  })

  describe('DELETE /v1/admin/candidate/:candidateId', () => {
    test("should return 200 if id is ok and logged user's role is correct", async () => {
      const res = await supertest(app)
        .delete(`/v1/admin/candidate/${newCandidate._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
      const checkUser = await findUserById(newUserCandidate._id.toString())
      const checkCandidate = await findCandidateById(newCandidate._id.toString())
      const checkPost = await findPostById(newPost._id.toString())
      const checkComment = await findCommentById(newComment._id.toString())
      const checkCommentedUser = await findUserById(newComment.user._id.toString())

      expect(res.body.status).toBe(200)
      expect(checkUser?.role).toEqual('user')
      expect(checkCandidate).toBe(null)
      expect(checkPost).toBe(null)
      expect(checkComment).toBe(null)
      expect(checkCommentedUser?.comments).toHaveLength(0)
    })
  })

  describe('DELETE /v1/admin/post/:postId', () => {
    test("should return 200 if id is ok and logged user's role is correct", async () => {
      const res = await supertest(app)
        .delete(`/v1/admin/post/${newPost._id.toString()}`)
        .set('Authorization', `Bearer ${adminToken}`)
      const checkCandidate = await findCandidateById(newCandidate._id.toString())
      const checkPost = await findPostById(newPost._id.toString())
      const checkComment = await findCommentById(newComment._id.toString())
      const checkCommentedUser = await findUserById(newComment.user._id.toString())
      expect(res.body.status).toBe(200)
      expect(checkPost).toBe(null)
      expect(checkCandidate?.posts).toHaveLength(0)
      expect(checkComment).toBe(null)
      expect(checkCommentedUser?.comments).toHaveLength(0)
      expect(checkCommentedUser?.commentedPosts).toHaveLength(0)
    })
  })

  describe('DELETE /v1/admin/comment/:commentId', () => {
    test("should return 200 if id is ok and logged user's role is correct", async () => {
      const res = await supertest(app)
        .delete(`/v1/admin/comment/${newComment._id.toString()}`)
        .set('Authorization', `Bearer ${adminToken}`)
      const checkPost = await findPostById(newPost._id.toString())
      const checkComment = await findCommentById(newComment._id.toString())
      const checkCommentedUser = await findUserById(newComment.user._id.toString())

      expect(res.body.status).toBe(200)
      expect(checkPost?.comments).toHaveLength(0)
      expect(checkComment).toBe(null)
      expect(checkCommentedUser?.comments).toHaveLength(0)
      expect(checkCommentedUser?.commentedPosts).toHaveLength(0)
    })
  })

  describe('POST /v1/admin/election', () => {
    test("should return 201 if request is ok and logged user's role is correct", async () => {
      const payload: CreateElectionForm = {
        startDate: stringtoDate('2024-01-01'),
        endDate: stringtoDate('2024-12-31')
      }
      const res = await supertest(app)
        .post('/v1/admin/election')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)

      expect(res.body.status).toBe(201)
    })

    test('should return 400 if request is not ok', async () => {
      const payload: CreateElectionForm = {
        startDate: stringtoDate('2024-01-00'),
        endDate: stringtoDate('2024-12-31')
      }
      const res = await supertest(app)
        .post('/v1/admin/election')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)

      expect(res.body.status).toBe(400)
    })
  })
})
