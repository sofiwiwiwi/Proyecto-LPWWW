import React, { useState, useEffect } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { useAuth } from "./authContext";
import { Routes, Route } from "react-router-dom"; // No es necesario BrowserRouter aquí
import Login from "./components/Login";
import Register from "./components/Register";
import PatientDashboard from "./components/PatientDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import SecretaryDashboard from "./components/SecretaryDashboard";
import CashierDashboard from "./components/CashierDashboard";
import NavBar from "./components/NavBar";
import 'bootstrap/dist/css/bootstrap.min.css';

const GET_DOCTOR_BY_USER_ID = gql`
  query GetDoctorByUserId($userId: ID!) {
    getDoctorByUserId(userId: $userId) {
      id
      name
      specialty
    }
  }
`;

const App = () => {
  const { token, user, logout } = useAuth();
  const [doctorId, setDoctorId] = useState(null);
  const [fetchDoctor, { data, loading, error }] = useLazyQuery(GET_DOCTOR_BY_USER_ID);

  useEffect(() => {
    if (user?.role === "Médico") {
      fetchDoctor({ variables: { userId: user.id } });
    }
  }, [user, fetchDoctor]);

  useEffect(() => {
    if (data?.getDoctorByUserId) {
      setDoctorId(data.getDoctorByUserId.id);
    }
  }, [data]);

  if (!token) {
    return (
      <div>
        <NavBar user={user} logout={logout} isLoggedIn={!!token} />
        <h1>Centro Médico Galenos</h1>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    );
  }

  if (user.role === "Médico" && loading) {
    return <p>Cargando información del médico...</p>;
  }

  if (user.role === "Médico" && error) {
    return <p>Error al cargar la información del médico: {error.message}</p>;
  }

  return (
    <div>
      <NavBar user={user} logout={logout} isLoggedIn={!!token} />
      <h1>Centro Médico Galenos</h1>
      {user.role === "Paciente" && <PatientDashboard patientId={user.id} />}
      {user.role === "Médico" && doctorId && <DoctorDashboard doctorId={doctorId} />}
      {user.role === "Secretaria" && <SecretaryDashboard/>}
      {user.role === "Cajero" && <CashierDashboard/>}
    </div>
  );
};

export default App;
