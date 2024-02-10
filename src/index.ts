import mongoose from 'mongoose'
import { app } from './app'
import { logger } from './utils/logger'
import { config } from './utils/config'

mongoose.set('strictQuery', false)
logger.info('Connecting to ', config.mongodbUri)

mongoose
  .connect(config.mongodbUri)
  .then(() => {
    logger.info('Connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB: ', error.message)
  })

app.listen(config.port, '0.0.0.0', () => {
  logger.info(`Server is listening on port ${config.port}`)
})
