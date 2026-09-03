exports.up = (knex) =>
  knex.schema
    .createTable('suppliers', (table) => {
      table.increments('id').primary()
      table.text('name').notNullable().unique()
      table.decimal('delivery_fee', 10, 2).notNullable().defaultTo(0)
      table.decimal('free_delivery_threshold', 10, 2)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now())
      table.check('delivery_fee >= 0')
      table.check('free_delivery_threshold is null or free_delivery_threshold >= 0')
    })
    .createTable('supplier_prices', (table) => {
      table.increments('id').primary()
      table.integer('supplier_id').notNullable().references('id').inTable('suppliers').onDelete('CASCADE')
      table.integer('ingredient_id').notNullable().references('id').inTable('ingredients').onDelete('CASCADE')
      // Price per the ingredient's purchase_unit (e.g. per 'g', per 'whole garlic').
      table.decimal('price_per_unit', 12, 6).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now())
      table.unique(['supplier_id', 'ingredient_id'])
      table.check('price_per_unit > 0')
    })

exports.down = (knex) => knex.schema.dropTable('supplier_prices').dropTable('suppliers')
