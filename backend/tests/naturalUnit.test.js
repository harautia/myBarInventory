const { test, describe } = require('node:test')
const assert = require('node:assert')
const { naturalUnitFor, toStoredPrice, toNaturalPrice } = require('../utils/naturalUnit')

describe('naturalUnit', () => {
  test('grams convert to kilograms for price entry/display', () => {
    assert.strictEqual(naturalUnitFor('g'), 'kg')
    assert.strictEqual(toStoredPrice(6.5, 'g'), 0.0065) // 6.50 EUR/kg -> EUR/g
    assert.strictEqual(toNaturalPrice(0.0065, 'g'), 6.5)

    // Round-trip that hits floating-point noise (0.0059 * 1000 !== 5.9 exactly)
    // must still display as the clean value the user entered.
    assert.strictEqual(toStoredPrice(5.9, 'g'), 0.0059)
    assert.strictEqual(toNaturalPrice(0.0059, 'g'), 5.9)
  })

  test('non-gram units are unchanged', () => {
    for (const unit of ['l', 'piece', 'whole garlic']) {
      assert.strictEqual(naturalUnitFor(unit), unit)
      assert.strictEqual(toStoredPrice(3, unit), 3)
      assert.strictEqual(toNaturalPrice(3, unit), 3)
    }
  })
})
