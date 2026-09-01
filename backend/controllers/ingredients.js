const ingredientsRouter = require('express').Router()
const Ingredients = require('../models/ingredients')

ingredientsRouter.get('/', async (request, response) => {
  const ingredients = await Ingredients.getAll()
  response.json(ingredients)
})

ingredientsRouter.put('/:id/stock', async (request, response) => {
  const { currentStock } = request.body

  if (typeof currentStock !== 'number' || Number.isNaN(currentStock) || currentStock < 0) {
    return response.status(400).json({ error: 'currentStock must be a non-negative number' })
  }

  const updated = await Ingredients.updateStock(request.params.id, currentStock)
  if (!updated) {
    return response.status(404).json({ error: 'ingredient not found' })
  }

  response.json(updated)
})

module.exports = ingredientsRouter
