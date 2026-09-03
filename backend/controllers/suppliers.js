const suppliersRouter = require('express').Router()
const Suppliers = require('../models/suppliers')
const SupplierPrices = require('../models/supplierPrices')

suppliersRouter.get('/', async (request, response) => {
  const suppliers = await Suppliers.getAll()
  response.json(suppliers)
})

suppliersRouter.post('/', async (request, response) => {
  const { name, deliveryFee, freeDeliveryThreshold } = request.body

  if (typeof name !== 'string' || !name.trim()) {
    return response.status(400).json({ error: 'name is required' })
  }
  if (deliveryFee !== undefined && (typeof deliveryFee !== 'number' || deliveryFee < 0)) {
    return response.status(400).json({ error: 'deliveryFee must be a non-negative number' })
  }
  if (
    freeDeliveryThreshold !== undefined &&
    freeDeliveryThreshold !== null &&
    (typeof freeDeliveryThreshold !== 'number' || freeDeliveryThreshold < 0)
  ) {
    return response.status(400).json({ error: 'freeDeliveryThreshold must be a non-negative number or null' })
  }

  const supplier = await Suppliers.create({ name: name.trim(), deliveryFee, freeDeliveryThreshold })
  response.status(201).json(supplier)
})

suppliersRouter.put('/:id', async (request, response) => {
  const updated = await Suppliers.update(request.params.id, request.body)
  if (!updated) {
    return response.status(404).json({ error: 'supplier not found' })
  }
  response.json(updated)
})

suppliersRouter.delete('/:id', async (request, response) => {
  await Suppliers.remove(request.params.id)
  response.status(204).end()
})

suppliersRouter.get('/prices/all', async (request, response) => {
  const prices = await SupplierPrices.getAll()
  response.json(prices)
})

suppliersRouter.put('/:supplierId/prices/:ingredientId', async (request, response) => {
  const { pricePerNaturalUnit } = request.body
  if (typeof pricePerNaturalUnit !== 'number' || pricePerNaturalUnit <= 0) {
    return response.status(400).json({ error: 'pricePerNaturalUnit must be a positive number' })
  }

  const price = await SupplierPrices.upsert({
    supplierId: Number(request.params.supplierId),
    ingredientId: Number(request.params.ingredientId),
    pricePerNaturalUnit
  })
  if (!price) {
    return response.status(404).json({ error: 'ingredient not found' })
  }
  response.json(price)
})

suppliersRouter.delete('/:supplierId/prices/:ingredientId', async (request, response) => {
  await SupplierPrices.remove(request.params.supplierId, request.params.ingredientId)
  response.status(204).end()
})

module.exports = suppliersRouter
