import api from './api'

const baseUrl = '/ingredients'

const getAll = () => api.get(baseUrl).then((response) => response.data)

const updateStock = (id, currentStock) =>
  api.put(`${baseUrl}/${id}/stock`, { currentStock }).then((response) => response.data)

export default { getAll, updateStock }
