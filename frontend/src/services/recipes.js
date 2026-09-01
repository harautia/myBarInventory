import axios from 'axios'

const baseUrl = '/api/recipes'

const getRecipe = (id) => axios.get(`${baseUrl}/${id}`).then((response) => response.data)

const getPurchasePlan = (id, pieCount) =>
  axios.post(`${baseUrl}/${id}/purchase-plan`, { pieCount }).then((response) => response.data)

export default { getRecipe, getPurchasePlan }
