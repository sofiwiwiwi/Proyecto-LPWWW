import React, { useState, useEffect } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { useAuth } from "./authContext";
import Login from "./components/Login";
import Register from "./components/Register";
import PatientDashboard from "./components/PatientDashboard";
import DoctorDashboard from "./components/DoctorDashboard";

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
        <h1>Bienvenido</h1>
        <Login />
        <Register />
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
      <h1>Centro Médico Galenos</h1>
      <button onClick={logout}>Cerrar Sesión</button>
      {user.role === "Paciente" && <PatientDashboard />}
      {user.role === "Médico" && doctorId && <DoctorDashboard doctorId={doctorId} />}
    </div>
  );
};

export default App;