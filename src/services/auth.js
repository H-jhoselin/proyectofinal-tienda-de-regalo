import { api } from './api'

export const authService = {
  // json-server no tiene autenticación real: se busca el usuario por correo y contraseña
  async login(email, password) {
    const { data } = await api.get('/usuarios', {
      params: { email: email.trim().toLowerCase(), password },
    })
    return data[0] || null
  },
}
