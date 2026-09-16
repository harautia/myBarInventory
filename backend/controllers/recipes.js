const recipesRouter = require('express').Router()
const Recipes = require('../models/recipes')
const { buildPurchasePlan, buildCombinedPurchasePlan } = require('../utils/purchasePlan')

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

  const plan = buildPurchasePlan(recipe, pieCount)
  response.json(plan)
})

// Combined plan across several recipes at once (e.g. meat + vegan pies in
// the same order), so shared base-dough stock is only counted once instead
// of each recipe's plan assuming the full stock for itself.
recipesRouter.post('/purchase-plan', async (request, response) => {
  const { items } = request.body

  if (!Array.isArray(items) || items.length === 0) {
    return response.status(400).json({ error: 'items must be a non-empty array of { recipeId, pieCount }' })
  }

  const invalid = items.some((item) => !item.recipeId || !Number.isInteger(item.pieCount) || item.pieCount < 0)
  if (invalid) {
    return response.status(400).json({ error: 'each item needs a recipeId and a non-negative integer pieCount' })
  }

  if (!items.some((item) => item.pieCount > 0)) {
    return response.status(400).json({ error: 'at least one pieCount must be greater than zero' })
  }

  const recipes = await Promise.all(items.map((item) => Recipes.getById(item.recipeId)))
  if (recipes.some((recipe) => !recipe)) {
    return response.status(404).json({ error: 'recipe not found' })
  }

  const plan = buildCombinedPurchasePlan(items.map((item, index) => ({ recipe: recipes[index], pieCount: item.pieCount })))
  response.json(plan)
})

module.exports = recipesRouter
