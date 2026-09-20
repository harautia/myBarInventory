const { test, describe, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const db = require('../db/db')

const api = supertest(app)

after(() => db.destroy())

describe('page views', () => {
  test('recording a page view returns a numeric count', async () => {
    const response = await api.post('/api/page-views').expect(200)

    assert.strictEqual(typeof response.body.count, 'number')
  })

  test('each recorded view increases the count by 1', async () => {
    const first = await api.post('/api/page-views').expect(200)
    const second = await api.post('/api/page-views').expect(200)

    assert.strictEqual(second.body.count, first.body.count + 1)
  })
})
