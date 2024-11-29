# Proyecto-LP
## Contenidos:
- [Descripción](#descripción)
- [Backend](#backend)
- [Frontend](#frontend)

### Descripción
Este proyecto es la parte del backend del sistema de gestión del Centro Médico Galenos, desarrollado para facilitar la administración de agendas médicas, recaudación de pagos, y gestión de comisiones.
### Backend
#### Tecnologías Utilizadas:
  - Node.js 
  - GraphQL 
  - MongoDB 
  - Mongoose

#### Requisitos

  - Node.js (v14 o superior)
  - MongoDB (base de datos local, debe llamarse galenos)
  - NPM (instalado con Node.js)

#### Instalar dependencias
`npm install`

#### Configurar variables de entorno en archivo .env
```
MONGO_URI=mongodb://localhost:27017/galenos
PORT=4000
JWT_SECRET=8jJhjDpQ%W9IhG3
```
#### Iniciar el servidor
`npm run dev`
### Frontend