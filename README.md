# Proyecto-LP - Centro Médico Galenos
## Contenidos:
- [Descripción](#descripción)
- [Consideraciones](#consideraciones)
- [Backend](#backend)
- [Frontend](#frontend)

### Integrantes
- Diego Acevedo --- 202073532-8
- Florencia Ramírez --- 202073522-0
- Sofía Riquelme --- 202073615-4
- Gabriel Vergara --- 202073616-2

### Descripción
Este proyecto es del sistema de gestión del Centro Médico Galenos, desarrollado para facilitar la administración de agendas médicas, recaudación de pagos, y gestión de comisiones.
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
4. Ver pacientes en espera de cada médico
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
  - MongoDB 
  - NPM (instalado con Node.js)

#### Instalar dependencias
`npm install`

#### Configurar variables de entorno en archivo .env
El archivo `.env` debe estar en la carpeta `backend`. La base de datos se encuentra en la nube, y se accede con la URI de este archivo. Es **muy importante** que este archivo se llame `.env`. 
```
MONGO_URI=mongodb+srv://admin:jPw9tC*0MhSvQjD@galenos.mm0in.mongodb.net/galenos?retryWrites=true&w=majority&appName=Galenos
PORT=4000
JWT_SECRET=8jJhjDpQ%W9IhG3
```
#### Iniciar el servidor
`npm start`
En caso de errores, asegurarse de tener `dotenv`instalado (se debiese instalar al hacer `npm install`pero por si acaso)

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
  - MongoDB (ver sección [Backend](#backend) para configuración de variables de entorno)
  - NPM (instalado con Node.js)

#### Instalar dependencias
`npm install`

#### Iniciar aplicación (asegurarse de correr el backend antes)
`npm run dev`
