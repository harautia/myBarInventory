// Source: https://www.kinuskikissa.fi/lihapiirakat-uunissa (yeast-dough
// oven-baked meat pies, yields 20). Ingredients used at more than one
// recipe step (salt in the dough/rice/filling, butter in the
// dough/filling/topping) are combined into a single total quantity.
const INGREDIENTS = [
  { name: 'milk', unit: 'l', unit_type: 'continuous', quantity_per_batch: 0.5 },
  { name: 'fresh yeast', unit: 'g', unit_type: 'continuous', quantity_per_batch: 25 },
  { name: 'salt', unit: 'tsp', unit_type: 'continuous', quantity_per_batch: 4.5 },
  { name: 'sugar', unit: 'tbsp', unit_type: 'continuous', quantity_per_batch: 1.5 },
  { name: 'butter', unit: 'g', unit_type: 'continuous', quantity_per_batch: 125 },
  { name: 'bread flour', unit: 'l', unit_type: 'continuous', quantity_per_batch: 1.1 },
  { name: 'water', unit: 'l', unit_type: 'continuous', quantity_per_batch: 0.65 },
  { name: 'rice', unit: 'l', unit_type: 'continuous', quantity_per_batch: 0.225 },
  { name: 'onion', unit: 'piece', unit_type: 'discrete', quantity_per_batch: 1 },
  { name: 'ground meat', unit: 'g', unit_type: 'continuous', quantity_per_batch: 450 },
  { name: 'garlic clove', unit: 'piece', unit_type: 'discrete', quantity_per_batch: 1 },
  { name: 'black pepper', unit: 'tsp', unit_type: 'continuous', quantity_per_batch: 1.5 },
  { name: 'paprika powder', unit: 'tsp', unit_type: 'continuous', quantity_per_batch: 1.5 }
]

exports.seed = async (knex) => {
  await knex('recipe_ingredients').del()
  await knex('recipes').del()
  await knex('ingredients').del()

  // Reset serial sequences so re-seeding always reproduces the same ids
  // (the frontend hardcodes recipe id 1 for this single-recipe v1).
  await knex.raw('ALTER SEQUENCE ingredients_id_seq RESTART WITH 1')
  await knex.raw('ALTER SEQUENCE recipes_id_seq RESTART WITH 1')
  await knex.raw('ALTER SEQUENCE recipe_ingredients_id_seq RESTART WITH 1')

  await knex('ingredients').insert(
    INGREDIENTS.map(({ name, unit, unit_type }) => ({ name, unit, unit_type, current_stock: 0 }))
  )

  const [recipe] = await knex('recipes')
    .insert({ name: 'Oven-Baked Meat Pies (Lihapiirakat)', yield_count: 20 })
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
