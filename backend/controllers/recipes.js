const recipesRouter = require('express').Router()
const Recipes = require('../models/recipes')
const Suppliers = require('../models/suppliers')
const SupplierPrices = require('../models/supplierPrices')
const { buildPurchasePlan } = require('../utils/purchasePlan')
const { buildPriceComparison } = require('../utils/priceComparison')

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
  const [suppliers, supplierPrices] = await Promise.all([Suppliers.getAll(), SupplierPrices.getAll()])
  const priceComparison = buildPriceComparison(plan, supplierPrices, suppliers)

  response.json({ ...plan, priceComparison })
})

module.exports = recipesRouter
