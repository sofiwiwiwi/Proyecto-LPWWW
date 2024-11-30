import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";  // Añadimos BrowserRouter como Router
import App from "./App";
import ApolloProviderWrapper from "./apolloClient";
import { AuthProvider } from "./authContext";
import Login from "./components/Login";
import Register from "./components/Register";
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProviderWrapper>
    <AuthProvider>
      <Router> {/* Aquí agregamos BrowserRouter */}
        <Routes>
          {/* Definimos las rutas principales */}
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  </ApolloProviderWrapper>
);
