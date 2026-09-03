const round2 = (value) => Math.round(value * 100) / 100

const deliveryFeeFor = (supplier, subtotal) => {
  if (supplier.freeDeliveryThreshold !== null && subtotal >= supplier.freeDeliveryThreshold) {
    return 0
  }
  return supplier.deliveryFee
}

// Builds two views of the same purchase list:
//  - perIngredientCheapest: pick the cheapest supplier independently for
//    each ingredient (can split the order across several suppliers, each
//    incurring its own delivery fee)
//  - singleSupplierRanking: rank suppliers who can fulfill every needed
//    ingredient by their total cost (items + one delivery fee)
const buildPriceComparison = (plan, supplierPrices, suppliers) => {
  const itemsToBuy = plan.lines.filter((line) => line.shortfall > 0)
  const suppliersById = new Map(suppliers.map((s) => [s.id, s]))

  const pricesByIngredient = new Map()
  supplierPrices.forEach((price) => {
    if (!pricesByIngredient.has(price.ingredientId)) {
      pricesByIngredient.set(price.ingredientId, [])
    }
    pricesByIngredient.get(price.ingredientId).push(price)
  })

  // --- Per-ingredient cheapest ---
  const items = []
  const unpriced = []

  itemsToBuy.forEach((line) => {
    const candidates = pricesByIngredient.get(line.ingredientId) || []
    if (candidates.length === 0) {
      unpriced.push({ ingredientId: line.ingredientId, name: line.name })
      return
    }
    const cheapest = candidates.reduce((best, price) => (price.pricePerUnit < best.pricePerUnit ? price : best))
    items.push({
      ingredientId: line.ingredientId,
      name: line.name,
      quantity: line.shortfall,
      unit: line.purchaseUnit,
      supplierId: cheapest.supplierId,
      supplierName: cheapest.supplierName,
      unitPrice: cheapest.pricePerUnit,
      cost: round2(cheapest.pricePerUnit * line.shortfall)
    })
  })

  const subtotalsBySupplier = new Map()
  items.forEach((item) => {
    subtotalsBySupplier.set(item.supplierId, (subtotalsBySupplier.get(item.supplierId) || 0) + item.cost)
  })

  const bySupplier = Array.from(subtotalsBySupplier.entries()).map(([supplierId, subtotal]) => {
    const supplier = suppliersById.get(supplierId)
    const deliveryFee = deliveryFeeFor(supplier, subtotal)
    return {
      supplierId,
      supplierName: supplier.name,
      subtotal: round2(subtotal),
      deliveryFee,
      total: round2(subtotal + deliveryFee)
    }
  })

  const totalItemCost = round2(items.reduce((sum, item) => sum + item.cost, 0))
  const totalDeliveryCost = round2(bySupplier.reduce((sum, s) => sum + s.deliveryFee, 0))

  const perIngredientCheapest = {
    items,
    bySupplier,
    unpriced,
    totalItemCost,
    totalDeliveryCost,
    grandTotal: round2(totalItemCost + totalDeliveryCost)
  }

  // --- Single-supplier ranking ---
  const singleSupplierRanking = suppliers
    .map((supplier) => {
      const missingIngredients = []
      const subtotal = itemsToBuy.reduce((sum, line) => {
        const price = (pricesByIngredient.get(line.ingredientId) || []).find((p) => p.supplierId === supplier.id)
        if (!price) {
          missingIngredients.push(line.name)
          return sum
        }
        return sum + price.pricePerUnit * line.shortfall
      }, 0)

      const canFulfillAll = missingIngredients.length === 0
      const deliveryFee = canFulfillAll ? deliveryFeeFor(supplier, subtotal) : 0

      return {
        supplierId: supplier.id,
        supplierName: supplier.name,
        canFulfillAll,
        missingIngredients,
        subtotal: round2(subtotal),
        deliveryFee,
        total: canFulfillAll ? round2(subtotal + deliveryFee) : null
      }
    })
    .sort((a, b) => {
      if (a.canFulfillAll !== b.canFulfillAll) return a.canFulfillAll ? -1 : 1
      if (a.canFulfillAll) return a.total - b.total
      return 0
    })

  return { perIngredientCheapest, singleSupplierRanking }
}

module.exports = { buildPriceComparison }
