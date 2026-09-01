const recipesRouter = require('express').Router()
const Recipes = require('../models/recipes')
const { buildPurchasePlan } = require('../utils/purchasePlan')

recipesRouter.get('/', async (request, response) => {
  const recipes = await Recipes.getAll()
  response.json(recipes)
})

recipesRouter.get('/:id', async (request, response) => {
  const recipe = await Recipes.getById(request.params.id)
  if (!recipe) {
    return response.status(404).json({ error: 'recipe not found' })
  }
  response.json(recipe)
})

recipesRouter.post('/:id/purchase-plan', async (request, response) => {
  const { pieCount } = request.body

  if (!Number.isInteger(pieCount) || pieCount <= 0) {
    return response.status(400).json({ error: 'pieCount must be a positive integer' })
  }

  const recipe = await Recipes.getById(request.params.id)
  if (!recipe) {
    return response.status(404).json({ error: 'recipe not found' })
  }

  response.json(buildPurchasePlan(recipe, pieCount))
})

module.exports = recipesRouter
