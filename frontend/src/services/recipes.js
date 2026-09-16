import api from './api'

const baseUrl = '/recipes'

const getAll = () => api.get(baseUrl).then((response) => response.data)

const getRecipe = (id) => api.get(`${baseUrl}/${id}`).then((response) => response.data)

const getCombinedPurchasePlan = (items) =>
  api.post(`${baseUrl}/purchase-plan`, { items }).then((response) => response.data)

export default { getAll, getRecipe, getCombinedPurchasePlan }
