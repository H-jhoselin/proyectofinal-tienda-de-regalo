export const ESTADOS = [
  { valor: 'pendiente', texto: 'Pendiente', clase: 'bg-amber-100 text-amber-800' },
  { valor: 'confirmada', texto: 'Confirmada', clase: 'bg-blue-100 text-blue-800' },
  { valor: 'entregada', texto: 'Entregada', clase: 'bg-green-100 text-green-800' },
  { valor: 'cancelada', texto: 'Cancelada', clase: 'bg-gray-200 text-gray-700' },
]

export function infoEstado(valor) {
  return ESTADOS.find((e) => e.valor === valor) || { valor, texto: valor, clase: 'bg-gray-100 text-gray-700' }
}

// Una reserva ocupa stock mientras no esté cancelada
export function ocupaStock(reserva) {
  return reserva.estado !== 'cancelada'
}

// Al eliminar, solo se devuelve el stock si el regalo aún no se entregó
export function devuelveStockAlEliminar(reserva) {
  return reserva.estado === 'pendiente' || reserva.estado === 'confirmada'
}
