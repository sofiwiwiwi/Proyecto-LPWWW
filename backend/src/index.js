const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const connectDatabase = require('./config/database');
const authSchema = require('./graphql/schemas/authSchema');
const doctorSchema = require('./graphql/schemas/doctorSchema');
const authResolver = require('./graphql/resolvers/authResolver');
const doctorResolver = require('./graphql/resolvers/doctorResolver');
const calendarSchema = require('./graphql/schemas/calendarSchema');
const calendarResolver = require('./graphql/resolvers/calendarResolver');
const agendaSchema = require('./graphql/schemas/agendaSchema');
const agendaResolver = require('./graphql/resolvers/agendaResolver');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();

require('dotenv').config();
console.log("MONGO_URI:", process.env.MONGO_URI);
connectDatabase();

app.use((req, _, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded ? User.findById(decoded.id) : null;
    } catch (err) {
      console.error("Token no válido.");
    }
  }
  next();
});

const server = new ApolloServer({
  typeDefs: [authSchema, doctorSchema, calendarSchema, agendaSchema],
  resolvers: [authResolver, doctorResolver, calendarResolver, agendaResolver],
  context: ({ req }) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET); 
        return { user }; 
      } catch (err) {
        console.error("Invalid token:", err.message);
      }
    }
    return {};
  },
});

server.start().then(() => {
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}${server.graphqlPath}`);
  });
});