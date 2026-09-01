const db = require('../db/db')

const toDto = (row) => ({
  id: row.id,
  name: row.name,
  unit: row.unit,
  unitType: row.unit_type,
  currentStock: Number(row.current_stock)
})

const getAll = async () => {
  const rows = await db('ingredients').select().orderBy('name')
  return rows.map(toDto)
}

const getById = async (id) => {
  const row = await db('ingredients').where({ id }).first()
  return row ? toDto(row) : null
}

const updateStock = async (id, currentStock) => {
  const [row] = await db('ingredients')
    .where({ id })
    .update({ current_stock: currentStock, updated_at: db.fn.now() })
    .returning('*')
  return row ? toDto(row) : null
}

module.exports = { getAll, getById, updateStock }
