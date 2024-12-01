import React from "react";

const NavBar = ({ user, logout, isLoggedIn }) => {
  return (

    <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <img src="cardiogram.png" alt="Logo" width="32" height="32" />
        <span>Centro Médico Galenos</span>
      </div>
      {isLoggedIn &&
        <div className="d-flex align-items-center">
          <span className="navbar-text">
            Bienvenido, {user?.name || "Desconocido"}
          </span>
          <button class="logout-button" onClick={logout}>
            <span className="logout-text">Cerrar Sesión</span>
            <span className="logout-icon">X</span>
          </button>
        </div>}
    </div>
  </nav>
  );
};

export default NavBar;