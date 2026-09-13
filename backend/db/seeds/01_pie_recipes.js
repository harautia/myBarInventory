// Source: myBarInventory/recipies/metpie.txt (Finnish butter-crust meat
// pie recipe, voitaikina dough + rice/ground-meat filling, egg-washed;
// yields one oven tray cut into 16 pieces).
// Water (6 dl) is part of the recipe but isn't purchased from the
// wholesaler, so it's intentionally left out of tracked ingredients.
// Volume/spoon measures converted to grams:
//   wheat flour: 2 dl * 60 g/dl = 120 g
//   baking powder: 2 tsp * 4 g/tsp = 8 g
//   rice: 1.5 dl * 85 g/dl = 127.5 g (same dl->g factor as the previous
//     recipe's "puuroriisiä")
//   salt: 0.5 tsp * 5 g/tsp = 2.5 g (same factor as the previous recipe)
//   white pepper: 0.25 tsp * 3 g/tsp = 0.75 g (same factor as the
//     previous recipe's black pepper)
//   paprika powder: 2 tsp * 2.4 g/tsp = 4.8 g (same factor as the
//     previous recipe)
const INGREDIENTS = [
  { name: 'butter', unit: 'g', unit_type: 'continuous', quantity_per_batch: 250 },
  { name: 'wheat flour', unit: 'g', unit_type: 'continuous', quantity_per_batch: 120 },
  { name: 'baking powder', unit: 'g', unit_type: 'continuous', quantity_per_batch: 8 },
  { name: 'quark', unit: 'g', unit_type: 'continuous', quantity_per_batch: 125 },
  { name: 'rice', unit: 'g', unit_type: 'continuous', quantity_per_batch: 127.5 },
  { name: 'onion', unit: 'piece', unit_type: 'discrete', quantity_per_batch: 1 },
  { name: 'ground meat', unit: 'g', unit_type: 'continuous', quantity_per_batch: 400 },
  { name: 'salt', unit: 'g', unit_type: 'continuous', quantity_per_batch: 2.5 },
  { name: 'white pepper', unit: 'g', unit_type: 'continuous', quantity_per_batch: 0.75 },
  { name: 'paprika powder', unit: 'g', unit_type: 'continuous', quantity_per_batch: 4.8 },
  { name: 'egg', unit: 'piece', unit_type: 'discrete', quantity_per_batch: 1 }
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
    INGREDIENTS.map(({ name, unit, unit_type, purchase_pack_size, purchase_unit }) => ({
      name,
      unit,
      unit_type,
      current_stock: 0,
      purchase_pack_size: purchase_pack_size || 1,
      purchase_unit: purchase_unit || null
    }))
  )

  const [recipe] = await knex('recipes')
    .insert({ name: 'Butter-Crust Meat Pies (Voitaikinapiirakat)', yield_count: 16 })
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
