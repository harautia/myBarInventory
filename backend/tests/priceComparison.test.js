const { test, describe } = require('node:test')
const assert = require('node:assert')
const { buildPriceComparison } = require('../utils/priceComparison')

// A minimal purchase plan: two ingredients need buying.
const plan = {
  lines: [
    { ingredientId: 1, name: 'butter', purchaseUnit: 'g', shortfall: 100 },
    { ingredientId: 2, name: 'onion', purchaseUnit: 'piece', shortfall: 2 },
    { ingredientId: 3, name: 'nothing-needed', purchaseUnit: 'g', shortfall: 0 }
  ]
}

const suppliers = [
  { id: 1, name: 'Kespro', deliveryFee: 20, freeDeliveryThreshold: 100 },
  { id: 2, name: 'Meira Nova', deliveryFee: 10, freeDeliveryThreshold: null }
]

describe('buildPriceComparison', () => {
  test('per-ingredient cheapest picks the lowest price per ingredient and sums delivery per supplier used', () => {
    const supplierPrices = [
      { supplierId: 1, supplierName: 'Kespro', ingredientId: 1, ingredientName: 'butter', unit: 'g', pricePerUnit: 0.01 },
      { supplierId: 2, supplierName: 'Meira Nova', ingredientId: 1, ingredientName: 'butter', unit: 'g', pricePerUnit: 0.008 },
      { supplierId: 1, supplierName: 'Kespro', ingredientId: 2, ingredientName: 'onion', unit: 'piece', pricePerUnit: 0.5 }
    ]

    const { perIngredientCheapest } = buildPriceComparison(plan, supplierPrices, suppliers)

    const butterItem = perIngredientCheapest.items.find((i) => i.name === 'butter')
    assert.strictEqual(butterItem.supplierId, 2) // Meira Nova is cheaper (0.008 < 0.01)
    assert.strictEqual(butterItem.cost, 0.8) // 100 g * 0.008

    const onionItem = perIngredientCheapest.items.find((i) => i.name === 'onion')
    assert.strictEqual(onionItem.supplierId, 1)
    assert.strictEqual(onionItem.cost, 1) // 2 * 0.5

    // Kespro subtotal 1.00 is under their 100 threshold -> pays delivery fee 20
    const kespro = perIngredientCheapest.bySupplier.find((s) => s.supplierId === 1)
    assert.strictEqual(kespro.subtotal, 1)
    assert.strictEqual(kespro.deliveryFee, 20)

    // Meira Nova has no free-delivery threshold -> always pays their fee
    const meira = perIngredientCheapest.bySupplier.find((s) => s.supplierId === 2)
    assert.strictEqual(meira.subtotal, 0.8)
    assert.strictEqual(meira.deliveryFee, 10)

    assert.strictEqual(perIngredientCheapest.totalItemCost, 1.8)
    assert.strictEqual(perIngredientCheapest.grandTotal, 31.8) // 1.8 items + 20 + 10 delivery
    assert.strictEqual(perIngredientCheapest.unpriced.length, 0)
  })

  test('ingredients with no supplier price are reported as unpriced, not silently dropped', () => {
    const { perIngredientCheapest } = buildPriceComparison(plan, [], suppliers)
    assert.strictEqual(perIngredientCheapest.items.length, 0)
    assert.strictEqual(perIngredientCheapest.unpriced.length, 2)
    assert.deepStrictEqual(
      perIngredientCheapest.unpriced.map((u) => u.name).sort(),
      ['butter', 'onion']
    )
  })

  test('free delivery threshold waives the fee once subtotal reaches it', () => {
    const supplierPrices = [
      { supplierId: 1, supplierName: 'Kespro', ingredientId: 1, ingredientName: 'butter', unit: 'g', pricePerUnit: 2 },
      { supplierId: 1, supplierName: 'Kespro', ingredientId: 2, ingredientName: 'onion', unit: 'piece', pricePerUnit: 0.5 }
    ]
    const { perIngredientCheapest } = buildPriceComparison(plan, supplierPrices, suppliers)
    const kespro = perIngredientCheapest.bySupplier.find((s) => s.supplierId === 1)
    assert.strictEqual(kespro.subtotal, 201) // 100*2 + 2*0.5, over the 100 threshold
    assert.strictEqual(kespro.deliveryFee, 0)
  })

  test('single-supplier ranking only ranks suppliers that can fulfill every needed ingredient', () => {
    const supplierPrices = [
      { supplierId: 1, supplierName: 'Kespro', ingredientId: 1, ingredientName: 'butter', unit: 'g', pricePerUnit: 0.01 },
      { supplierId: 1, supplierName: 'Kespro', ingredientId: 2, ingredientName: 'onion', unit: 'piece', pricePerUnit: 0.5 },
      { supplierId: 2, supplierName: 'Meira Nova', ingredientId: 1, ingredientName: 'butter', unit: 'g', pricePerUnit: 0.005 }
      // Meira Nova has no price for onion -> can't fulfill the whole order alone
    ]

    const { singleSupplierRanking } = buildPriceComparison(plan, supplierPrices, suppliers)

    const kespro = singleSupplierRanking.find((s) => s.supplierId === 1)
    const meira = singleSupplierRanking.find((s) => s.supplierId === 2)

    assert.strictEqual(kespro.canFulfillAll, true)
    assert.strictEqual(kespro.subtotal, 2) // 100*0.01 + 2*0.5
    assert.strictEqual(kespro.deliveryFee, 20) // under 100 threshold
    assert.strictEqual(kespro.total, 22)

    assert.strictEqual(meira.canFulfillAll, false)
    assert.deepStrictEqual(meira.missingIngredients, ['onion'])
    assert.strictEqual(meira.total, null)

    // fulfillable suppliers are ranked first
    assert.strictEqual(singleSupplierRanking[0].supplierId, 1)
  })
})
