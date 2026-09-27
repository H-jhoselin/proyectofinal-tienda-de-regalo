import { reactive } from 'vue'
import { authService } from '@/services/auth'

const CLAVE = 'parati_sesion'

function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE))
  } catch {
    return null
  }
}

const estado = reactive({ usuario: leerSesion() })

export const sesion = {
  get usuario() {
    return estado.usuario
  },

  get autenticado() {
    return !!estado.usuario
  },

  async iniciar(email, password) {
    const usuario = await authService.login(email, password)
    if (!usuario) throw new Error('Correo o contraseña incorrectos.')
    // eslint-disable-next-line no-unused-vars
    const { password: _omitida, ...datos } = usuario
    estado.usuario = datos
    localStorage.setItem(CLAVE, JSON.stringify(datos))
  },

  cerrar() {
    estado.usuario = null
    localStorage.removeItem(CLAVE)
  },
}
