// Lets suppliers' prices be entered/shown in the unit they're normally
// quoted in (e.g. euros per kg) while being stored per the ingredient's
// actual purchase unit (grams), which is what purchase quantities use.
const naturalUnitFor = (purchaseUnit) => (purchaseUnit === 'g' ? 'kg' : purchaseUnit)

const naturalUnitFactor = (purchaseUnit) => (purchaseUnit === 'g' ? 1000 : 1)

const toStoredPrice = (pricePerNaturalUnit, purchaseUnit) =>
  Math.round((pricePerNaturalUnit / naturalUnitFactor(purchaseUnit)) * 1000000) / 1000000

const toNaturalPrice = (pricePerUnit, purchaseUnit) =>
  Math.round(pricePerUnit * naturalUnitFactor(purchaseUnit) * 10000) / 10000

module.exports = { naturalUnitFor, naturalUnitFactor, toStoredPrice, toNaturalPrice }
