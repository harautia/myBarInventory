const crypto = require('node:crypto')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')

const authRouter = require('express').Router()

const SESSION_COOKIE = 'session'
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax'
}
const cookieOptions = { ...baseCookieOptions, maxAge: SESSION_MAX_AGE_MS }

const passwordMatches = (candidate) => {
  const expected = Buffer.from(config.OWNER_PASSWORD || '')
  const given = Buffer.from(candidate || '')
  if (expected.length !== given.length) return false
  return crypto.timingSafeEqual(expected, given)
}

authRouter.post('/login', (request, response) => {
  const { password } = request.body

  if (!config.OWNER_PASSWORD || !passwordMatches(password)) {
    return response.status(401).json({ error: 'invalid password' })
  }

  const token = jwt.sign({ owner: true }, config.SESSION_SECRET, { expiresIn: '30d' })
  response.cookie(SESSION_COOKIE, token, cookieOptions)
  response.json({ ok: true })
})

authRouter.post('/logout', (request, response) => {
  response.clearCookie(SESSION_COOKIE, baseCookieOptions)
  response.json({ ok: true })
})

authRouter.get('/session', (request, response) => {
  const token = request.cookies?.[SESSION_COOKIE]
  if (!token) return response.json({ authenticated: false })

  try {
    jwt.verify(token, config.SESSION_SECRET)
    response.json({ authenticated: true })
  } catch {
    response.json({ authenticated: false })
  }
})

module.exports = { authRouter, SESSION_COOKIE }
