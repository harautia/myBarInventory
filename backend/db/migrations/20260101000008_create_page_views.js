exports.up = (knex) =>
  knex.schema.createTable('page_views', (table) => {
    table.increments('id').primary()
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now())
  })

exports.down = (knex) => knex.schema.dropTable('page_views')
