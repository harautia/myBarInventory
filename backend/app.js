const express = require('express')
const cookieParser = require('cookie-parser')
const middleware = require('./utils/middleware')
const { authRouter } = require('./controllers/auth')
const ingredientsRouter = require('./controllers/ingredients')
const recipesRouter = require('./controllers/recipes')
const adminRouter = require('./controllers/admin')

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(express.static('dist'))
app.use(middleware.requestLogger)

app.use('/api', authRouter)
app.use('/api/ingredients', middleware.requireAuth, ingredientsRouter)
app.use('/api/recipes', middleware.requireAuth, recipesRouter)
// /api/admin is intentionally not behind requireAuth: it's gated by its own
// SEED_TOKEN secret and driven by curl for ops (no browser session involved),
// see controllers/admin.js.
app.use('/api/admin', adminRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
