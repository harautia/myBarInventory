// Supports ingredients that are purchased in a pack under a different
// name than they're tracked in -- e.g. garlic cloves are tracked and used
// individually, but bought as whole garlics (1 whole garlic = 10 cloves).
exports.up = (knex) =>
  knex.schema.alterTable('ingredients', (table) => {
    table.decimal('purchase_pack_size', 12, 5).notNullable().defaultTo(1)
    table.text('purchase_unit')
  })

exports.down = (knex) =>
  knex.schema.alterTable('ingredients', (table) => {
    table.dropColumn('purchase_pack_size')
    table.dropColumn('purchase_unit')
  })
