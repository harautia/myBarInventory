exports.up = (knex) =>
  knex.schema.createTable('recipe_ingredients', (table) => {
    table.increments('id').primary()
    table.integer('recipe_id').notNullable().references('id').inTable('recipes').onDelete('CASCADE')
    table.integer('ingredient_id').notNullable().references('id').inTable('ingredients').onDelete('RESTRICT')
    table.decimal('quantity_per_batch', 10, 2).notNullable()
    table.unique(['recipe_id', 'ingredient_id'])
    table.check('quantity_per_batch > 0')
  })

exports.down = (knex) => knex.schema.dropTable('recipe_ingredients')
