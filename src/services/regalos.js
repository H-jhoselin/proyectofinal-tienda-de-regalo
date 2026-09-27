import { api } from './api'
import { escaparRegex } from '@/utils/formato'

export const regalosService = {
  // Buscador por nombre (nombre_like) y filtro por ocasión (ocasionId)
  async listar({ busqueda = '', ocasionId = '' } = {}) {
    const params = { _sort: 'nombre', _order: 'asc' }
    if (busqueda.trim()) params.nombre_like = escaparRegex(busqueda.trim())
    if (ocasionId) params.ocasionId = ocasionId
    const { data } = await api.get('/regalos', { params })
    return data
  },

  async obtener(id) {
    const { data } = await api.get(`/regalos/${id}`)
    return data
  },

  async crear(regalo) {
    const { data } = await api.post('/regalos', regalo)
    return data
  },

  async actualizar(id, regalo) {
    const { data } = await api.put(`/regalos/${id}`, regalo)
    return data
  },

  async actualizarStock(id, stock) {
    const { data } = await api.patch(`/regalos/${id}`, { stock })
    return data
  },

  async eliminar(id) {
    await api.delete(`/regalos/${id}`)
  },
}
