// 5 decimals to preserve quantities like 0.19125 kg (rice) without loss.
const round = (value) => Math.round(value * 100000) / 100000

// Gram shortfalls are rounded up to the nearest 10 g (e.g. 12 g -> 20 g),
// so the actual purchase amount is a realistic increment and stock never
// falls short -- any excess just becomes extra stock for next time.
const roundUpToTen = (value) => Math.ceil(value / 10) * 10

const buildPurchasePlan = (recipe, pieCount) => {
  const batches = pieCount / recipe.yieldCount

  const lines = recipe.ingredients.map((ingredient) => {
    const needed = round(ingredient.quantityPerBatch * batches)
    const isDiscrete = ingredient.unitType === 'discrete'
    const neededRounded = isDiscrete ? Math.ceil(needed) : needed
    const rawShortfall = Math.max(0, round(neededRounded - ingredient.currentStock))

    // Ingredients purchased under a different unit than they're tracked in
    // (e.g. garlic cloves bought as whole garlics, 10 cloves per whole) buy
    // whole packs; plain gram ingredients round the shortfall up to the
    // nearest 10 g; everything else is purchased as the precise shortfall.
    const purchaseUnit = ingredient.purchaseUnit || ingredient.unit
    const packSize = ingredient.purchasePackSize || 1
    let shortfall = rawShortfall
    if (rawShortfall > 0) {
      if (purchaseUnit !== ingredient.unit) {
        shortfall = Math.ceil(rawShortfall / packSize)
      } else if (ingredient.unit === 'g') {
        shortfall = roundUpToTen(rawShortfall)
      }
    }

    return {
      ingredientId: ingredient.ingredientId,
      name: ingredient.name,
      unit: ingredient.unit,
      unitType: ingredient.unitType,
      needed,
      ...(neededRounded !== needed ? { neededRounded } : {}),
      currentStock: ingredient.currentStock,
      ...(rawShortfall > 0 ? { rawShortfall } : {}),
      shortfall,
      purchaseUnit
    }
  })

  const purchaseList = lines
    .filter((line) => line.shortfall > 0)
    .map((line) => ({ ingredientId: line.ingredientId, name: line.name, unit: line.purchaseUnit, amount: line.shortfall }))

  return {
    recipeId: recipe.id,
    pieCount,
    batches,
    lines,
    purchaseList
  }
}

module.exports = { buildPurchasePlan }
