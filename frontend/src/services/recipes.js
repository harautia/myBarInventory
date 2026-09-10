import api from './api'

const baseUrl = '/recipes'

const getRecipe = (id) => api.get(`${baseUrl}/${id}`).then((response) => response.data)

const getPurchasePlan = (id, pieCount) =>
  api.post(`${baseUrl}/${id}/purchase-plan`, { pieCount }).then((response) => response.data)

export default { getRecipe, getPurchasePlan }
