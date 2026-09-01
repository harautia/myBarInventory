exports.up = (knex) =>
  knex.schema.createTable('ingredients', (table) => {
    table.increments('id').primary()
    table.text('name').notNullable().unique()
    table.text('unit').notNullable()
    table.text('unit_type').notNullable()
    table.decimal('current_stock', 10, 2).notNullable().defaultTo(0)
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now())
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now())
    table.check("unit_type in ('continuous', 'discrete')")
    table.check('current_stock >= 0')
  })

exports.down = (knex) => knex.schema.dropTable('ingredients')
