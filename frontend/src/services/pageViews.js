import api from './api'

const record = () => api.post('/page-views').then((response) => response.data)

export default { record }
