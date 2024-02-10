import express, { type Router } from 'express'
import { docsRouter } from './docs.route'
import { authRouter } from './auth.route'
import { userRouter } from './user.route'
import { adminRouter } from './admin.route'
import { postRouter } from './post.route'
import { candidateRouter } from './candidate.route'
import { voteRouter } from './vote.route'

export const router: Router = express.Router()

interface Route {
  path: string
  route: Router
}

const defaultRoutes: Route[] = [
  {
    path: '/docs',
    route: docsRouter
  },
  {
    path: '/auth',
    route: authRouter
  },
  {
    path: '/user',
    route: userRouter
  },
  {
    path: '/admin',
    route: adminRouter
  },
  {
    path: '/post',
    route: postRouter
  },
  {
    path: '/candidate',
    route: candidateRouter
  },
  {
    path: '/vote',
    route: voteRouter
  }
]

defaultRoutes.forEach((route: Route) => {
  router.use(route.path, route.route)
})
