const { test, describe } = require('node:test')
const assert = require('node:assert')
const { buildPurchasePlan } = require('../utils/purchasePlan')

const recipe = {
  id: 1,
  yieldCount: 10,
  ingredients: [
    { ingredientId: 1, name: 'butter', unit: 'g', unitType: 'continuous', quantityPerBatch: 100, currentStock: 0 },
    { ingredientId: 2, name: 'egg', unit: 'unit', unitType: 'discrete', quantityPerBatch: 1, currentStock: 0 }
  ]
}

const withStock = (stock) => ({
  ...recipe,
  ingredients: recipe.ingredients.map((ingredient) =>
    ingredient.name === 'egg' ? { ...ingredient, currentStock: stock } : ingredient
  )
})

describe('buildPurchasePlan', () => {
  test('one full batch with no stock needs the raw recipe amounts', () => {
    const plan = buildPurchasePlan(withStock(0), 10)
    const butter = plan.lines.find((l) => l.name === 'butter')
    const egg = plan.lines.find((l) => l.name === 'egg')

    assert.strictEqual(butter.needed, 100)
    assert.strictEqual(butter.shortfall, 100)
    assert.strictEqual(egg.needed, 1)
    assert.strictEqual(egg.neededRounded, 1)
    assert.strictEqual(egg.shortfall, 1)
    assert.strictEqual(plan.purchaseList.length, 2)
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
