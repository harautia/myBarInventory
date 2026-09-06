const adminRouter = require('express').Router()
const db = require('../db/db')

// Render's free tier has no Shell access, so there's no way to run
// `npm run seed` by hand after a deploy. This gives an equivalent path
// over HTTP, gated by a secret set only in the hosting environment
// (SEED_TOKEN) -- if that env var isn't set, the endpoint always
// refuses, so it's inert by default in local dev.
adminRouter.post('/seed', async (request, response) => {
  const token = request.get('x-seed-token')
  if (!process.env.SEED_TOKEN || token !== process.env.SEED_TOKEN) {
    return response.status(403).json({ error: 'invalid or missing seed token' })
  }

  const [seedFiles] = await db.seed.run()
  response.json({ seeded: seedFiles })
})

module.exports = adminRouter
