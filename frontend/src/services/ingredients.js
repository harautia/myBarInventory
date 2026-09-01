import axios from 'axios'

const baseUrl = '/api/ingredients'

const getAll = () => axios.get(baseUrl).then((response) => response.data)

const updateStock = (id, currentStock) =>
  axios.put(`${baseUrl}/${id}/stock`, { currentStock }).then((response) => response.data)

export default { getAll, updateStock }
