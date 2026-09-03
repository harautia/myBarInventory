const db = require('../db/db')
const { naturalUnitFor, toStoredPrice, toNaturalPrice } = require('../utils/naturalUnit')

const toDto = (row) => {
  const unit = row.purchaseUnit || row.unit
  return {
    supplierId: row.supplierId,
    supplierName: row.supplierName,
    ingredientId: row.ingredientId,
    ingredientName: row.ingredientName,
    unit,
    pricePerUnit: Number(row.pricePerUnit),
    naturalUnit: naturalUnitFor(unit),
    pricePerNaturalUnit: toNaturalPrice(Number(row.pricePerUnit), unit)
  }
}

const getAll = async () => {
  const rows = await db('supplier_prices')
    .join('suppliers', 'suppliers.id', 'supplier_prices.supplier_id')
    .join('ingredients', 'ingredients.id', 'supplier_prices.ingredient_id')
    .select(
      'supplier_prices.supplier_id as supplierId',
      'suppliers.name as supplierName',
      'supplier_prices.ingredient_id as ingredientId',
      'ingredients.name as ingredientName',
      'ingredients.unit as unit',
      'ingredients.purchase_unit as purchaseUnit',
      'supplier_prices.price_per_unit as pricePerUnit'
    )
  return rows.map(toDto)
}

const upsert = async ({ supplierId, ingredientId, pricePerNaturalUnit }) => {
  const ingredient = await db('ingredients').where({ id: ingredientId }).first()
  if (!ingredient) return null

  const purchaseUnit = ingredient.purchase_unit || ingredient.unit
  const pricePerUnit = toStoredPrice(pricePerNaturalUnit, purchaseUnit)

  await db('supplier_prices')
    .insert({ supplier_id: supplierId, ingredient_id: ingredientId, price_per_unit: pricePerUnit })
    .onConflict(['supplier_id', 'ingredient_id'])
    .merge({ price_per_unit: pricePerUnit, updated_at: db.fn.now() })

  const [row] = await db('supplier_prices')
    .join('suppliers', 'suppliers.id', 'supplier_prices.supplier_id')
    .join('ingredients', 'ingredients.id', 'supplier_prices.ingredient_id')
    .where({ 'supplier_prices.supplier_id': supplierId, 'supplier_prices.ingredient_id': ingredientId })
    .select(
      'supplier_prices.supplier_id as supplierId',
      'suppliers.name as supplierName',
      'supplier_prices.ingredient_id as ingredientId',
      'ingredients.name as ingredientName',
      'ingredients.unit as unit',
      'ingredients.purchase_unit as purchaseUnit',
      'supplier_prices.price_per_unit as pricePerUnit'
    )
  return toDto(row)
}

const remove = async (supplierId, ingredientId) =>
  db('supplier_prices').where({ supplier_id: supplierId, ingredient_id: ingredientId }).del()

module.exports = { getAll, upsert, remove }
