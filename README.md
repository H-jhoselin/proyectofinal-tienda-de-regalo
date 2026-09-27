# 🎁 PARA TI — Tienda de regalos

Práctica 2 · Vue 3. Catálogo de regalos por ocasión con reservas en línea y panel de administración.

[![Abrir en GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/H-jhoselin/proyectofinal-tienda-de-regalo)

## Iniciar el proyecto

```bash
npm install
npm run serve
```

- Frontend: http://localhost:8080
- API (json-server): http://localhost:3000

Usuario de prueba para el panel de administración: `admin@parati.com` / `admin123`

### Sin instalar nada (GitHub Codespaces)

Botón **Code → Codespaces → Create codespace on main** (o el botón de arriba). El entorno instala las dependencias, ejecuta `npm run serve` y abre la página automáticamente.

## Funcionalidades

- **Público:** catálogo con buscador por nombre y filtro por ocasión; formulario de reserva.
- **Administración (ruta protegida `/admin`):** CRUD de Ocasiones, Regalos y Reservas, con buscadores y filtros.

## Tecnologías

Vue 3 · Vue CLI · Vue Router · Axios · Tailwind CSS · json-server

## Entidades

```
Ocasión (1) ──< Regalo (1) ──< Reserva
```
