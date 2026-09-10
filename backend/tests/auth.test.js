process.env.OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'test-owner-password'
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-session-secret'

const { test, describe, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const db = require('../db/db')

const api = supertest(app)

after(() => db.destroy())

describe('authentication', () => {
  test('protected routes reject requests with no session cookie', async () => {
    await api.get('/api/ingredients').expect(401)
  })

  test('login rejects the wrong password', async () => {
    await api.post('/api/login').send({ password: 'wrong' }).expect(401)
  })

  test('login accepts the correct password and sets a session cookie', async () => {
    const response = await api
      .post('/api/login')
      .send({ password: process.env.OWNER_PASSWORD })
      .expect(200)

    assert.ok(response.headers['set-cookie'], 'expected a Set-Cookie header')
  })

  test('a valid session cookie unlocks protected routes', async () => {
    const login = await api
      .post('/api/login')
      .send({ password: process.env.OWNER_PASSWORD })
      .expect(200)

    const cookie = login.headers['set-cookie']

    await api.get('/api/ingredients').set('Cookie', cookie).expect(200)
  })

  test('logout revokes access again', async () => {
    const login = await api
      .post('/api/login')
      .send({ password: process.env.OWNER_PASSWORD })
      .expect(200)

    const loginCookie = login.headers['set-cookie']
    await api.get('/api/ingredients').set('Cookie', loginCookie).expect(200)

    const logout = await api.post('/api/logout').set('Cookie', loginCookie).expect(200)
    const logoutCookie = logout.headers['set-cookie']

    await api.get('/api/ingredients').set('Cookie', logoutCookie).expect(401)
  })
})
