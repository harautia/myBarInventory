const { test, describe } = require('node:test')
const assert = require('node:assert')
const { buildPurchasePlan } = require('../utils/purchasePlan')

const recipe = {
  id: 1,
  yieldCount: 10,
  ingredients: [
    { ingredientId: 1, name: 'butter', unit: 'g', unitType: 'continuous', quantityPerBatch: 100, currentStock: 0 },
    { ingredientId: 2, name: 'egg', unit: 'unit', unitType: 'discrete', quantityPerBatch: 1, currentStock: 0 },
    { ingredientId: 3, name: 'salt', unit: 'g', unitType: 'continuous', quantityPerBatch: 22.5, currentStock: 0 }
  ]
}

const withStockFor = (name, stock) => ({
  ...recipe,
  ingredients: recipe.ingredients.map((ingredient) =>
    ingredient.name === name ? { ...ingredient, currentStock: stock } : ingredient
  )
})

const withStock = (stock) => withStockFor('egg', stock)

describe('buildPurchasePlan', () => {
  test('one full batch with no stock needs the raw recipe amounts', () => {
    const plan = buildPurchasePlan(withStock(0), 10)
    const butter = plan.lines.find((l) => l.name === 'butter')
    const egg = plan.lines.find((l) => l.name === 'egg')

    assert.strictEqual(butter.needed, 100)
    assert.strictEqual(butter.shortfall, 100)
    assert.strictEqual(butter.neededRounded, undefined) // already a multiple of 10, no rounding note needed
    assert.strictEqual(egg.needed, 1)
    assert.strictEqual(egg.neededRounded, undefined) // already whole, no rounding note needed
    assert.strictEqual(egg.shortfall, 1)
    assert.strictEqual(plan.purchaseList.length, 3)
  })

  test('2.5 batches rounds discrete eggs up, never leaves a negative shortfall', () => {
    const zeroStock = buildPurchasePlan(withStock(0), 25)
    const eggZero = zeroStock.lines.find((l) => l.name === 'egg')
    assert.strictEqual(eggZero.needed, 2.5)
    assert.strictEqual(eggZero.neededRounded, 3)
    assert.strictEqual(eggZero.shortfall, 3)

    const oneStock = buildPurchasePlan(withStock(1), 25)
    assert.strictEqual(oneStock.lines.find((l) => l.name === 'egg').shortfall, 2)

    const threeStock = buildPurchasePlan(withStock(3), 25)
    const eggThree = threeStock.lines.find((l) => l.name === 'egg')
    assert.strictEqual(eggThree.shortfall, 0)
  })

  test('gram quantities round up to the nearest 10 g', () => {
    const zeroStock = buildPurchasePlan(withStockFor('salt', 0), 10)
    const saltZero = zeroStock.lines.find((l) => l.name === 'salt')
    assert.strictEqual(saltZero.needed, 22.5)
    assert.strictEqual(saltZero.neededRounded, 30)
    assert.strictEqual(saltZero.shortfall, 30)

    const partialStock = buildPurchasePlan(withStockFor('salt', 25), 10)
    assert.strictEqual(partialStock.lines.find((l) => l.name === 'salt').shortfall, 5)

    const fullStock = buildPurchasePlan(withStockFor('salt', 30), 10)
    assert.strictEqual(fullStock.lines.find((l) => l.name === 'salt').shortfall, 0)
  })

  test('sufficient stock everywhere yields an empty purchase list', () => {
    const plan = buildPurchasePlan(
      {
        ...recipe,
        ingredients: recipe.ingredients.map((i) => ({ ...i, currentStock: 1000 }))
      },
      10
    )
    assert.deepStrictEqual(plan.purchaseList, [])
  })
})
