const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080,
    // Permite recargar rutas como /catalogo o /admin/regalos (history mode)
    historyApiFallback: true,
    // Necesario en GitHub Codespaces, que sirve la app desde un dominio propio
    allowedHosts: 'all',
    client: { webSocketURL: 'auto://0.0.0.0:0/ws' },
    // /api/* se redirige a json-server, así el navegador nunca llama a localhost:3000 directamente
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        pathRewrite: { '^/api': '' },
      },
    },
  },
})
