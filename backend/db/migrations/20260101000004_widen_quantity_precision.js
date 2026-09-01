// Liters need 3 decimal places (e.g. 0.225 l = 2.25 dl); the original
// NUMERIC(10,2) columns would silently round that to 0.23.
exports.up = async (knex) => {
  await knex.raw('ALTER TABLE ingredients ALTER COLUMN current_stock TYPE numeric(10,3)')
  await knex.raw('ALTER TABLE recipe_ingredients ALTER COLUMN quantity_per_batch TYPE numeric(10,3)')
}

exports.down = async (knex) => {
  await knex.raw('ALTER TABLE ingredients ALTER COLUMN current_stock TYPE numeric(10,2)')
  await knex.raw('ALTER TABLE recipe_ingredients ALTER COLUMN quantity_per_batch TYPE numeric(10,2)')
}
