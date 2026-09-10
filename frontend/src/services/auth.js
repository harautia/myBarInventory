import api from './api'

const login = (password) => api.post('/login', { password }).then((response) => response.data)

const logout = () => api.post('/logout').then((response) => response.data)

const getSession = () => api.get('/session').then((response) => response.data)

export default { login, logout, getSession }
