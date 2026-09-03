import { useEffect, useState } from 'react'
import supplierService from '../services/suppliers'
import ingredientService from '../services/ingredients'

const priceKey = (supplierId, ingredientId) => `${supplierId}-${ingredientId}`

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [prices, setPrices] = useState({})
  const [priceDrafts, setPriceDrafts] = useState({})
  const [newSupplier, setNewSupplier] = useState({ name: '', deliveryFee: '', freeDeliveryThreshold: '' })

  const loadAll = () => {
    Promise.all([supplierService.getAll(), ingredientService.getAll(), supplierService.getAllPrices()]).then(
      ([suppliersData, ingredientsData, pricesData]) => {
        setSuppliers(suppliersData)
        setIngredients(ingredientsData)
        const byKey = {}
        pricesData.forEach((price) => {
          byKey[priceKey(price.supplierId, price.ingredientId)] = price
        })
        setPrices(byKey)
      }
    )
  }

  useEffect(() => {
    loadAll()
  }, [])

  const handleAddSupplier = async (event) => {
    event.preventDefault()
    if (!newSupplier.name.trim()) return

    await supplierService.create({
      name: newSupplier.name.trim(),
      deliveryFee: newSupplier.deliveryFee === '' ? 0 : Number(newSupplier.deliveryFee),
      freeDeliveryThreshold: newSupplier.freeDeliveryThreshold === '' ? null : Number(newSupplier.freeDeliveryThreshold)
    })
    setNewSupplier({ name: '', deliveryFee: '', freeDeliveryThreshold: '' })
    loadAll()
  }

  const handleDeleteSupplier = async (id) => {
    await supplierService.remove(id)
    loadAll()
  }

  const handlePriceChange = (supplierId, ingredientId, value) => {
    setPriceDrafts({ ...priceDrafts, [priceKey(supplierId, ingredientId)]: value })
  }

  const handlePriceSave = async (supplierId, ingredientId) => {
    const key = priceKey(supplierId, ingredientId)
    const value = Number(priceDrafts[key])
    if (Number.isNaN(value) || value <= 0) return

    await supplierService.setPrice(supplierId, ingredientId, value)
    const rest = { ...priceDrafts }
    delete rest[key]
    setPriceDrafts(rest)
    loadAll()
  }

  return (
    <div>
      <h2>Suppliers</h2>

      <table>
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Delivery fee</th>
            <th>Free delivery over</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td>{supplier.name}</td>
              <td>{supplier.deliveryFee} €</td>
              <td>{supplier.freeDeliveryThreshold === null ? '—' : `${supplier.freeDeliveryThreshold} €`}</td>
              <td>
                <button type="button" onClick={() => handleDeleteSupplier(supplier.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={handleAddSupplier}>
        <input
          placeholder="Supplier name"
          value={newSupplier.name}
          onChange={({ target }) => setNewSupplier({ ...newSupplier, name: target.value })}
        />
        <input
          type="number"
          min="0"
          placeholder="Delivery fee €"
          value={newSupplier.deliveryFee}
          onChange={({ target }) => setNewSupplier({ ...newSupplier, deliveryFee: target.value })}
        />
        <input
          type="number"
          min="0"
          placeholder="Free delivery over € (optional)"
          value={newSupplier.freeDeliveryThreshold}
          onChange={({ target }) => setNewSupplier({ ...newSupplier, freeDeliveryThreshold: target.value })}
        />
        <button type="submit">Add supplier</button>
      </form>

      <h3>Prices</h3>
      {suppliers.length === 0 ? (
        <p className="hint">Add a supplier above to start entering prices.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Ingredient</th>
              {suppliers.map((supplier) => (
                <th key={supplier.id}>{supplier.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient) => (
              <tr key={ingredient.id}>
                <td>
                  {ingredient.name} (€/{ingredient.naturalUnit})
                </td>
                {suppliers.map((supplier) => {
                  const key = priceKey(supplier.id, ingredient.id)
                  const existing = prices[key]
                  return (
                    <td key={supplier.id}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={priceDrafts[key] ?? existing?.pricePerNaturalUnit ?? ''}
                        onChange={({ target }) => handlePriceChange(supplier.id, ingredient.id, target.value)}
                      />
                      <button type="button" onClick={() => handlePriceSave(supplier.id, ingredient.id)}>
                        Save
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default SuppliersPage
