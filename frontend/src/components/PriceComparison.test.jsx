import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import PriceComparison from './PriceComparison'

const comparison = {
  perIngredientCheapest: {
    items: [
      { ingredientId: 9, name: 'ground meat', quantity: 4500, unit: 'g', supplierId: 2, supplierName: 'Meira Nova', unitPrice: 0.0059, cost: 26.55 }
    ],
    bySupplier: [{ supplierId: 2, supplierName: 'Meira Nova', subtotal: 26.55, deliveryFee: 15, total: 41.55 }],
    unpriced: [{ ingredientId: 1, name: 'milk' }],
    totalItemCost: 26.55,
    totalDeliveryCost: 15,
    grandTotal: 41.55
  },
  singleSupplierRanking: [
    { supplierId: 1, supplierName: 'Kespro', canFulfillAll: true, missingIngredients: [], subtotal: 30, deliveryFee: 0, total: 30 },
    { supplierId: 2, supplierName: 'Meira Nova', canFulfillAll: false, missingIngredients: ['milk'], subtotal: 26.55, deliveryFee: 0, total: null }
  ]
}

describe('PriceComparison', () => {
  test('shows the per-ingredient cheapest breakdown, grand total, and single-supplier ranking', () => {
    render(<PriceComparison comparison={comparison} />)

    expect(screen.getByText(/ground meat/)).toBeInTheDocument()
    expect(screen.getByText(/4\.5 kg/)).toBeInTheDocument()
    expect(screen.getByText(/26\.55 € items \+ 15\.00 € delivery = 41\.55 €/)).toBeInTheDocument()
    expect(screen.getByText(/Grand total: 41\.55 €/)).toBeInTheDocument()
    expect(screen.getByText(/No price entered for: milk/)).toBeInTheDocument()

    // single-supplier ranking: only Kespro can fulfill everything
    expect(screen.getByText(/Kespro: 30\.00 € items \+ 0\.00 € delivery = 30\.00 €/)).toBeInTheDocument()
    expect(screen.getByText(/Missing prices at: Meira Nova \(milk\)/)).toBeInTheDocument()
  })

  test('renders nothing when there is no data to compare', () => {
    const empty = {
      perIngredientCheapest: { items: [], bySupplier: [], unpriced: [], totalItemCost: 0, totalDeliveryCost: 0, grandTotal: 0 },
      singleSupplierRanking: []
    }
    const { container } = render(<PriceComparison comparison={empty} />)
    expect(container).toBeEmptyDOMElement()
  })
})
