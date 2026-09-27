import { api } from './api'
import { escaparRegex } from '@/utils/formato'

export const ocasionesService = {
  async listar({ busqueda = '' } = {}) {
    const params = { _sort: 'nombre', _order: 'asc' }
    if (busqueda.trim()) params.nombre_like = escaparRegex(busqueda.trim())
    const { data } = await api.get('/ocasiones', { params })
    return data
  },

  async obtener(id) {
    const { data } = await api.get(`/ocasiones/${id}`)
    return data
  },

  async crear(ocasion) {
    const { data } = await api.post('/ocasiones', ocasion)
    return data
  },

  async actualizar(id, ocasion) {
    const { data } = await api.put(`/ocasiones/${id}`, ocasion)
    return data
  },

  async eliminar(id) {
    await api.delete(`/ocasiones/${id}`)
  },
}
