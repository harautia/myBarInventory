const jwt = require('jsonwebtoken')
const logger = require('./logger')
const config = require('./config')
const { SESSION_COOKIE } = require('../controllers/auth')

const requireAuth = (request, response, next) => {
  const token = request.cookies?.[SESSION_COOKIE]
  if (!token) return response.status(401).json({ error: 'not authenticated' })

  try {
    jwt.verify(token, config.SESSION_SECRET)
    next()
  } catch {
    response.status(401).json({ error: 'not authenticated' })
  }
}

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

module.exports = {
  requireAuth,
  requestLogger,
  unknownEndpoint,
  errorHandler
}
