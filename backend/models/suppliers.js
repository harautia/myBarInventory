const db = require('../db/db')

const toDto = (row) => ({
  id: row.id,
  name: row.name,
  deliveryFee: Number(row.delivery_fee),
  freeDeliveryThreshold: row.free_delivery_threshold === null ? null : Number(row.free_delivery_threshold)
})

const getAll = async () => {
  const rows = await db('suppliers').select().orderBy('name')
  return rows.map(toDto)
}

const getById = async (id) => {
  const row = await db('suppliers').where({ id }).first()
  return row ? toDto(row) : null
}

const create = async ({ name, deliveryFee, freeDeliveryThreshold }) => {
  const [row] = await db('suppliers')
    .insert({
      name,
      delivery_fee: deliveryFee ?? 0,
      free_delivery_threshold: freeDeliveryThreshold ?? null
    })
    .returning('*')
  return toDto(row)
}

const update = async (id, { name, deliveryFee, freeDeliveryThreshold }) => {
  const [row] = await db('suppliers')
    .where({ id })
    .update({
      ...(name !== undefined ? { name } : {}),
      ...(deliveryFee !== undefined ? { delivery_fee: deliveryFee } : {}),
      ...(freeDeliveryThreshold !== undefined ? { free_delivery_threshold: freeDeliveryThreshold } : {}),
      updated_at: db.fn.now()
    })
    .returning('*')
  return row ? toDto(row) : null
}

const remove = async (id) => db('suppliers').where({ id }).del()

module.exports = { getAll, getById, create, update, remove }
