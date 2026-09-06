const express = require('express')
const middleware = require('./utils/middleware')
const ingredientsRouter = require('./controllers/ingredients')
const recipesRouter = require('./controllers/recipes')

const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(middleware.requestLogger)

app.use('/api/ingredients', ingredientsRouter)
app.use('/api/recipes', recipesRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
