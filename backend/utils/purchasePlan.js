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
    const shortfall = ingredient.unit === 'g' && rawShortfall > 0
      ? roundUpToTen(rawShortfall)
      : rawShortfall

    return {
      ingredientId: ingredient.ingredientId,
      name: ingredient.name,
      unit: ingredient.unit,
      unitType: ingredient.unitType,
      needed,
      ...(neededRounded !== needed ? { neededRounded } : {}),
      currentStock: ingredient.currentStock,
      ...(shortfall !== rawShortfall ? { rawShortfall } : {}),
      shortfall
    }
  })

  const purchaseList = lines
    .filter((line) => line.shortfall > 0)
    .map((line) => ({ ingredientId: line.ingredientId, name: line.name, unit: line.unit, amount: line.shortfall }))

  return {
    recipeId: recipe.id,
    pieCount,
    batches,
    lines,
    purchaseList
  }
}

module.exports = { buildPurchasePlan }
