import formatQuantity from '../utils/formatQuantity'

const euro = (value) => `${value.toFixed(2)} €`

const PriceComparison = ({ comparison }) => {
  const { perIngredientCheapest, singleSupplierRanking } = comparison
  const fulfillable = singleSupplierRanking.filter((s) => s.canFulfillAll)
  const incomplete = singleSupplierRanking.filter((s) => !s.canFulfillAll)

  if (perIngredientCheapest.items.length === 0 && fulfillable.length === 0 && incomplete.length === 0) {
    return null
  }

  return (
    <div className="price-comparison">
      <h3>Price comparison</h3>

      <h4>Cheapest per ingredient</h4>
      {perIngredientCheapest.items.length === 0 ? (
        <p className="hint">No supplier prices entered yet for anything on the purchase list.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Quantity</th>
                <th>Supplier</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {perIngredientCheapest.items.map((item) => (
                <tr key={item.ingredientId}>
                  <td>{item.name}</td>
                  <td>{formatQuantity(item.quantity, item.unit)}</td>
                  <td>{item.supplierName}</td>
                  <td>{euro(item.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul>
            {perIngredientCheapest.bySupplier.map((s) => (
              <li key={s.supplierId}>
                {s.supplierName}: {euro(s.subtotal)} items + {euro(s.deliveryFee)} delivery = {euro(s.total)}
              </li>
            ))}
          </ul>
          <p>
            <strong>Grand total: {euro(perIngredientCheapest.grandTotal)}</strong>{' '}
            ({euro(perIngredientCheapest.totalItemCost)} items + {euro(perIngredientCheapest.totalDeliveryCost)} delivery)
          </p>
        </>
      )}
      {perIngredientCheapest.unpriced.length > 0 && (
        <p className="hint">
          No price entered for: {perIngredientCheapest.unpriced.map((u) => u.name).join(', ')}.
        </p>
      )}

      <h4>Cheapest single supplier</h4>
      {fulfillable.length === 0 ? (
        <p className="hint">No single supplier has prices for everything on the purchase list yet.</p>
      ) : (
        <ol>
          {fulfillable.map((s) => (
            <li key={s.supplierId}>
              {s.supplierName}: {euro(s.subtotal)} items + {euro(s.deliveryFee)} delivery = {euro(s.total)}
            </li>
          ))}
        </ol>
      )}
      {incomplete.length > 0 && (
        <p className="hint">
          Missing prices at: {incomplete.map((s) => `${s.supplierName} (${s.missingIngredients.join(', ')})`).join('; ')}.
        </p>
      )}
    </div>
  )
}

export default PriceComparison
