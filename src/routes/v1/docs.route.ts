import express, { type Router } from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import { serve, setup } from 'swagger-ui-express'
import { swaggerDef } from '../../../docs/swaggerDef'

export const docsRouter: Router = express.Router()

const specs: object = swaggerJsdoc({
  swaggerDefinition: swaggerDef,
  apis: ['docs/*.yml', 'src/routes/v1/*.ts']
})

docsRouter.use('/', serve)
docsRouter.get(
  '/',
  setup(specs, {
    explorer: true
  })
)
