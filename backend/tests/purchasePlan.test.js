const { test, describe } = require('node:test')
const assert = require('node:assert')
const { buildPurchasePlan } = require('../utils/purchasePlan')

const recipe = {
  id: 1,
  yieldCount: 10,
  ingredients: [
    { ingredientId: 1, name: 'butter', unit: 'g', unitType: 'continuous', quantityPerBatch: 100, currentStock: 0 },
    { ingredientId: 2, name: 'egg', unit: 'unit', unitType: 'discrete', quantityPerBatch: 1, currentStock: 0 },
    { ingredientId: 3, name: 'salt', unit: 'g', unitType: 'continuous', quantityPerBatch: 22.5, currentStock: 0 },
    {
      ingredientId: 4,
      name: 'garlic clove',
      unit: 'piece',
      unitType: 'discrete',
      quantityPerBatch: 1,
      currentStock: 0,
      purchasePackSize: 10,
      purchaseUnit: 'whole garlic'
    }
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
    assert.strictEqual(plan.purchaseList.length, 4)
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

  test('gram shortfalls round up to the nearest 10 g so purchases never fall short', () => {
    const zeroStock = buildPurchasePlan(withStockFor('salt', 0), 10)
    const saltZero = zeroStock.lines.find((l) => l.name === 'salt')
    assert.strictEqual(saltZero.needed, 22.5)
    assert.strictEqual(saltZero.neededRounded, undefined) // needed itself isn't rounded, only the shortfall is
    assert.strictEqual(saltZero.rawShortfall, 22.5)
    assert.strictEqual(saltZero.shortfall, 30)

    // 22.5 needed, 15 in stock -> 7.5 g raw shortfall, rounds up to 10 g
    const partialStock = buildPurchasePlan(withStockFor('salt', 15), 10)
    const saltPartial = partialStock.lines.find((l) => l.name === 'salt')
    assert.strictEqual(saltPartial.rawShortfall, 7.5)
    assert.strictEqual(saltPartial.shortfall, 10)

    // stock already covers the precise need -> no shortfall, no rounding applied
    const fullStock = buildPurchasePlan(withStockFor('salt', 30), 10)
    const saltFull = fullStock.lines.find((l) => l.name === 'salt')
    assert.strictEqual(saltFull.shortfall, 0)
    assert.strictEqual(saltFull.rawShortfall, undefined)
  })

  test('a 12 g raw shortfall rounds up to 20 g, never down', () => {
    // butter: 100 g needed for 1 batch, 88 g in stock -> 12 g raw shortfall
    const plan = buildPurchasePlan(withStockFor('butter', 88), 10)
    const butter = plan.lines.find((l) => l.name === 'butter')
    assert.strictEqual(butter.rawShortfall, 12)
    assert.strictEqual(butter.shortfall, 20)
  })

  test('garlic cloves are purchased as whole garlics (10 cloves per whole)', () => {
    // 11 batches -> 11 cloves needed, none in stock -> buy 2 whole garlics
    const elevenBatches = buildPurchasePlan(withStockFor('garlic clove', 0), 110)
    const garlicMany = elevenBatches.lines.find((l) => l.name === 'garlic clove')
    assert.strictEqual(garlicMany.needed, 11)
    assert.strictEqual(garlicMany.rawShortfall, 11)
    assert.strictEqual(garlicMany.shortfall, 2)
    assert.strictEqual(garlicMany.purchaseUnit, 'whole garlic')
    assert.strictEqual(
      elevenBatches.purchaseList.find((l) => l.name === 'garlic clove').unit,
      'whole garlic'
    )

    // same 11 needed, 5 already in stock -> 6 raw shortfall -> still just 1 whole garlic
    const withPartialStock = buildPurchasePlan(withStockFor('garlic clove', 5), 110)
    const garlicPartial = withPartialStock.lines.find((l) => l.name === 'garlic clove')
    assert.strictEqual(garlicPartial.rawShortfall, 6)
    assert.strictEqual(garlicPartial.shortfall, 1)
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
