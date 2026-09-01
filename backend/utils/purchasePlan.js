// 5 decimals to preserve quantities like 0.19125 kg (rice) without loss.
const round = (value) => Math.round(value * 100000) / 100000

// Gram quantities are rounded up to the nearest 10 g, since that's a more
// realistic purchasing increment than a precise fractional gram amount.
const roundUpToTen = (value) => Math.ceil(value / 10) * 10

const buildPurchasePlan = (recipe, pieCount) => {
  const batches = pieCount / recipe.yieldCount

  const lines = recipe.ingredients.map((ingredient) => {
    const needed = round(ingredient.quantityPerBatch * batches)
    const isDiscrete = ingredient.unitType === 'discrete'
    const neededRounded = isDiscrete
      ? Math.ceil(needed)
      : ingredient.unit === 'g'
        ? roundUpToTen(needed)
        : needed
    const shortfall = Math.max(0, round(neededRounded - ingredient.currentStock))

    return {
      ingredientId: ingredient.ingredientId,
      name: ingredient.name,
      unit: ingredient.unit,
      unitType: ingredient.unitType,
      needed,
      ...(neededRounded !== needed ? { neededRounded } : {}),
      currentStock: ingredient.currentStock,
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
