import { api } from './api'
import { regalosService } from './regalos'
import { escaparRegex } from '@/utils/formato'
import { ocupaStock, devuelveStockAlEliminar } from '@/utils/estados'

export const reservasService = {
  // Buscador por cliente (cliente_like) y filtro por estado / regalo.
  // _expand=regalo trae el regalo relacionado en cada reserva.
  async listar({ busqueda = '', estado = '', regaloId = '' } = {}) {
    const params = { _expand: 'regalo', _sort: 'id', _order: 'desc' }
    if (busqueda.trim()) params.cliente_like = escaparRegex(busqueda.trim())
    if (estado) params.estado = estado
    if (regaloId) params.regaloId = regaloId
    const { data } = await api.get('/reservas', { params })
    return data
  },

  async obtener(id) {
    const { data } = await api.get(`/reservas/${id}`)
    return data
  },

  // Crea la reserva y descuenta el stock del regalo
  async crear(reserva) {
    if (ocupaStock(reserva)) {
      const regalo = await regalosService.obtener(reserva.regaloId)
      if (reserva.cantidad > regalo.stock) {
        throw new Error(`Solo hay ${regalo.stock} unidad(es) disponibles de "${regalo.nombre}".`)
      }
      await regalosService.actualizarStock(regalo.id, regalo.stock - reserva.cantidad)
    }
    const { data } = await api.post('/reservas', { ...reserva, creadaEn: new Date().toISOString() })
    return data
  },

  // Actualiza la reserva ajustando el stock según cantidad, regalo y estado
  async actualizar(id, reserva) {
    const anterior = await this.obtener(id)
    const devolver = ocupaStock(anterior) ? anterior.cantidad : 0
    const tomar = ocupaStock(reserva) ? reserva.cantidad : 0

    if (Number(anterior.regaloId) === Number(reserva.regaloId)) {
      const regalo = await regalosService.obtener(reserva.regaloId)
      const disponible = regalo.stock + devolver
      if (tomar > disponible) throw new Error(`Solo hay ${disponible} unidad(es) disponibles de "${regalo.nombre}".`)
      if (devolver !== tomar) await regalosService.actualizarStock(regalo.id, disponible - tomar)
    } else {
      const nuevo = await regalosService.obtener(reserva.regaloId)
      if (tomar > nuevo.stock) throw new Error(`Solo hay ${nuevo.stock} unidad(es) disponibles de "${nuevo.nombre}".`)
      if (devolver) {
        const previo = await regalosService.obtener(anterior.regaloId).catch(() => null)
        if (previo) await regalosService.actualizarStock(previo.id, previo.stock + devolver)
      }
      if (tomar) await regalosService.actualizarStock(nuevo.id, nuevo.stock - tomar)
    }

    const { data } = await api.put(`/reservas/${id}`, { ...anterior, ...reserva, id: anterior.id })
    return data
  },

  // Elimina la reserva y devuelve el stock si todavía no fue entregada
  async eliminar(reserva) {
    if (devuelveStockAlEliminar(reserva)) {
      const regalo = await regalosService.obtener(reserva.regaloId).catch(() => null)
      if (regalo) await regalosService.actualizarStock(regalo.id, regalo.stock + reserva.cantidad)
    }
    await api.delete(`/reservas/${reserva.id}`)
  },
}
