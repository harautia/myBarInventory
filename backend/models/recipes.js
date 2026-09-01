const db = require('../db/db')

const getAll = async () => {
  const rows = await db('recipes').select().orderBy('name')
  return rows.map((row) => ({ id: row.id, name: row.name, yieldCount: row.yield_count }))
}

const getById = async (id) => {
  const recipe = await db('recipes').where({ id }).first()
  if (!recipe) return null

  const lines = await db('recipe_ingredients')
    .join('ingredients', 'ingredients.id', 'recipe_ingredients.ingredient_id')
    .where('recipe_ingredients.recipe_id', id)
    .select(
      'ingredients.id as ingredientId',
      'ingredients.name as name',
      'ingredients.unit as unit',
      'ingredients.unit_type as unitType',
      'ingredients.current_stock as currentStock',
      'recipe_ingredients.quantity_per_batch as quantityPerBatch'
    )

  return {
    id: recipe.id,
    name: recipe.name,
    yieldCount: recipe.yield_count,
    ingredients: lines.map((line) => ({
      ingredientId: line.ingredientId,
      name: line.name,
      unit: line.unit,
      unitType: line.unitType,
      currentStock: Number(line.currentStock),
      quantityPerBatch: Number(line.quantityPerBatch)
    }))
  }
}

module.exports = { getAll, getById }
