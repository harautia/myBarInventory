const INGREDIENTS = [
  { name: 'butter', unit: 'g', unit_type: 'continuous', quantity_per_batch: 100 },
  { name: 'flour', unit: 'dl', unit_type: 'continuous', quantity_per_batch: 5 },
  { name: 'meat', unit: 'g', unit_type: 'continuous', quantity_per_batch: 200 },
  { name: 'salt', unit: 'g', unit_type: 'continuous', quantity_per_batch: 10 },
  { name: 'pepper', unit: 'g', unit_type: 'continuous', quantity_per_batch: 5 },
  { name: 'sour cream', unit: 'dl', unit_type: 'continuous', quantity_per_batch: 1 },
  { name: 'egg', unit: 'unit', unit_type: 'discrete', quantity_per_batch: 1 }
]

exports.seed = async (knex) => {
  await knex('recipe_ingredients').del()
  await knex('recipes').del()
  await knex('ingredients').del()

  await knex('ingredients').insert(
    INGREDIENTS.map(({ name, unit, unit_type }) => ({ name, unit, unit_type, current_stock: 0 }))
  )

  const [recipe] = await knex('recipes')
    .insert({ name: 'Classic Meat Pie', yield_count: 10 })
    .returning('id')

  const ingredientRows = await knex('ingredients').select('id', 'name')
  const idByName = Object.fromEntries(ingredientRows.map((row) => [row.name, row.id]))

  await knex('recipe_ingredients').insert(
    INGREDIENTS.map(({ name, quantity_per_batch }) => ({
      recipe_id: recipe.id,
      ingredient_id: idByName[name],
      quantity_per_batch
    }))
  )
}
