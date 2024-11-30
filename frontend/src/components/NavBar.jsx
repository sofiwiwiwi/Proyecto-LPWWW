import React from "react";

const NavBar = ({ user, logout, isLoggedIn }) => {
  return (

    <nav class="navbar">
    <div class="navbar-container">
        <div class="navbar-brand">
            <img src="cardiogram.png" alt="Logo" width="30" height="30"/>
            <span>Centro Médico Galenos</span>
        </div>
        {isLoggedIn && 
        <div className="d-flex align-items-center">
          <span className="navbar-text me-3">
            Bienvenido, {user?.name || "Desconocido"}
          </span>
          <button onClick={logout}>
            Cerrar Sesión
          </button>
        </div>}
    </div>
</nav>
  );
};

export default NavBar;