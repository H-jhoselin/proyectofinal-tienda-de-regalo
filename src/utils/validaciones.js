import { hoyISO } from './formato'

export function validarOcasion(f) {
  const e = {}
  if (f.nombre.trim().length < 3) e.nombre = 'El nombre debe tener al menos 3 caracteres.'
  if (!f.icono.trim()) e.icono = 'Elige un ícono para la ocasión.'
  if (f.descripcion.length > 150) e.descripcion = 'Máximo 150 caracteres.'
  return e
}

export function validarRegalo(f) {
  const e = {}
  if (f.nombre.trim().length < 3) e.nombre = 'El nombre debe tener al menos 3 caracteres.'
  if (!(Number(f.precio) > 0)) e.precio = 'El precio debe ser mayor a 0.'
  const stock = Number(f.stock)
  if (f.stock === '' || !Number.isInteger(stock) || stock < 0) e.stock = 'El stock debe ser un número entero mayor o igual a 0.'
  if (!f.ocasionId) e.ocasionId = 'Selecciona una ocasión.'
  if (f.imagen.trim() && !/^https?:\/\//i.test(f.imagen.trim())) e.imagen = 'La imagen debe ser una URL que empiece con http:// o https://'
  if (f.descripcion.length > 200) e.descripcion = 'Máximo 200 caracteres.'
  return e
}

export function validarReserva(f, { stockDisponible = null, exigirFechaFutura = true } = {}) {
  const e = {}
  if (f.cliente.trim().length < 3) e.cliente = 'Ingresa el nombre completo (mínimo 3 caracteres).'
  if (!/^[0-9+\s-]{7,15}$/.test(f.telefono.trim())) e.telefono = 'Ingresa un teléfono válido (7 a 15 dígitos).'
  if (!f.fechaRecojo) e.fechaRecojo = 'Selecciona la fecha de recojo.'
  else if (exigirFechaFutura && f.fechaRecojo < hoyISO()) e.fechaRecojo = 'La fecha no puede ser anterior a hoy.'
  const cantidad = Number(f.cantidad)
  if (!Number.isInteger(cantidad) || cantidad < 1) e.cantidad = 'La cantidad debe ser al menos 1.'
  else if (stockDisponible !== null && cantidad > stockDisponible) e.cantidad = `Solo hay ${stockDisponible} unidad(es) disponibles.`
  if (f.dedicatoria.length > 200) e.dedicatoria = 'Máximo 200 caracteres.'
  return e
}
