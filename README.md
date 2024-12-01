# Proyecto-LP - Centro Médico Galenos
## Contenidos:
- [Descripción](#descripción)
- [Consideraciones](#consideraciones)
- [Backend](#backend)
- [Frontend](#frontend)

### Descripción
Este proyecto es la parte del backend del sistema de gestión del Centro Médico Galenos, desarrollado para facilitar la administración de agendas médicas, recaudación de pagos, y gestión de comisiones.
#### Funcionalidades
##### Paciente
El paciente puede:
1. Seleccionar médico
2. Reservar una hora
3. Cancelar una hora
4. Visualizar horas reservadas
##### Médico
El médico puede
1. Ver pacientes en espera
2. Marcar pacientes como atendidos
##### Secretaria
La secretaria puede
1. Agregar disponibilidad de cada médico
2. Generar agenda de cada médico en base a un calendario creado anteriormente con feriados
3. Consultrar agenda de cada médico y editar su disponibilidad
##### Cajero
El cajero puede
1. Registrar pagos
2. Generar estado de comisión de cada médico
3. Generar reporte de recaudación general o por cada médico

### Consideraciones
Para probar cualquiera de las funcionalidades, hay usuarios creados previamente para facilitar este proceso. De todas formas si lo prefiere, puede crear sus propios usuarios.
Los usuarios ya creados son:
- Dr. Juan Carlos Bodoque (jbodoque@galenos.cl) - Médico
- Dr. Ernesto Vivanco (evivanco@galenos.cl) - Médico
- Ivonne Barra (ibarra@galenos.cl) - Secretaria
- Leonardo Farkas (lfarkas@galenos.cl) - Cajero
- Dwayne "The Rock" Johnson (laroca@lpwww.cl) - Paciente

Todos estos usuarios tienen la constraseña "hola123"

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
El archivo `.env` debe estar en la carpeta `backend`
```
MONGO_URI=mongodb://localhost:27017/galenos
PORT=4000
JWT_SECRET=8jJhjDpQ%W9IhG3
```
#### Iniciar el servidor
`npm run dev`

#### Importante:
En la carpeta de documentación se pueden ver las queries disponibles
### Frontend
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

#### Iniciar aplicación (asegurarse de correr el backend antes)
`npm run dev`