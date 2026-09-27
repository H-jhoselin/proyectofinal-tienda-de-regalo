import { MONEDA } from '@/config'

export function moneda(valor) {
  return `${MONEDA} ${Number(valor || 0).toFixed(2)}`
}

// Recibe 'AAAA-MM-DD' o una fecha ISO completa
export function fecha(valor) {
  if (!valor) return '—'
  const d = new Date(valor.length === 10 ? `${valor}T00:00:00` : valor)
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Fecha local de hoy en formato 'AAAA-MM-DD' (para inputs type="date")
export function hoyISO() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

// json-server usa expresiones regulares en los filtros *_like
export function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function debounce(fn, ms = 300) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

export function mensajeError(e) {
  if (e?.response) return `Error del servidor (${e.response.status}).`
  if (e?.request) return 'No se pudo conectar con el servidor. Verifica que json-server esté corriendo (npm run serve).'
  return e?.message || 'Ocurrió un error inesperado.'
}
