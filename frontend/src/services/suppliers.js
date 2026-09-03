import axios from 'axios'

const baseUrl = '/api/suppliers'

const getAll = () => axios.get(baseUrl).then((response) => response.data)

const create = (supplier) => axios.post(baseUrl, supplier).then((response) => response.data)

const update = (id, supplier) => axios.put(`${baseUrl}/${id}`, supplier).then((response) => response.data)

const remove = (id) => axios.delete(`${baseUrl}/${id}`)

const getAllPrices = () => axios.get(`${baseUrl}/prices/all`).then((response) => response.data)

const setPrice = (supplierId, ingredientId, pricePerNaturalUnit) =>
  axios
    .put(`${baseUrl}/${supplierId}/prices/${ingredientId}`, { pricePerNaturalUnit })
    .then((response) => response.data)

const removePrice = (supplierId, ingredientId) => axios.delete(`${baseUrl}/${supplierId}/prices/${ingredientId}`)

export default { getAll, create, update, remove, getAllPrices, setPrice, removePrice }
