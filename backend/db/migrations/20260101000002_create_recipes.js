exports.up = (knex) =>
  knex.schema.createTable('recipes', (table) => {
    table.increments('id').primary()
    table.text('name').notNullable().unique()
    table.integer('yield_count').notNullable()
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now())
    table.check('yield_count > 0')
  })

exports.down = (knex) => knex.schema.dropTable('recipes')
