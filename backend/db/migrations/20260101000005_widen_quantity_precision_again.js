// Rice in kg needs 5 decimal places (0.19125 kg = 2.25 dl * 85 g/dl);
// the numeric(10,3) columns from the previous migration would round that.
exports.up = async (knex) => {
  await knex.raw('ALTER TABLE ingredients ALTER COLUMN current_stock TYPE numeric(12,5)')
  await knex.raw('ALTER TABLE recipe_ingredients ALTER COLUMN quantity_per_batch TYPE numeric(12,5)')
}

exports.down = async (knex) => {
  await knex.raw('ALTER TABLE ingredients ALTER COLUMN current_stock TYPE numeric(10,3)')
  await knex.raw('ALTER TABLE recipe_ingredients ALTER COLUMN quantity_per_batch TYPE numeric(10,3)')
}
