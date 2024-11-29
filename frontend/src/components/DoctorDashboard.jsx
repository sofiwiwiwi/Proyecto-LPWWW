import React from "react";
import { gql, useQuery } from "@apollo/client";

const GET_WAITING_PATIENTS = gql`
  query GetWaitingPatients($doctorId: ID!) {
    getWaitingPatients(doctorId: $doctorId) {
      patientId
      patientName
      startTime
      endTime
      date
    }
  }
`;

const formatDate = (timestamp) => {
  const date = new Date(Number(timestamp)); 

  if (isNaN(date.getTime())) {
    return "Fecha inválida";
  }

  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const DoctorDashboard = ({ doctorId }) => {
  const { loading, error, data } = useQuery(GET_WAITING_PATIENTS, {
    variables: { doctorId },
  });
  console.log("Doctor ID:", doctorId);
  console.log("Query data:", data);
  if (loading) return <p>Cargando pacientes en espera...</p>;
  if (error) return <p>Error al cargar pacientes: {error.message}</p>;

  return (
    <div>
      <h2>Panel del Médico</h2>
      <h3>Pacientes en Espera</h3>
      {data.getWaitingPatients.length > 0 ? (
        <ul>
          {data.getWaitingPatients.map((appointment) => (
            <li key={appointment.patientId}>
              <strong>Paciente:</strong> {appointment.patientName} <br />
              <strong>Fecha:</strong> {formatDate(appointment.date)} <br />
              <strong>Hora:</strong> {appointment.startTime} - {appointment.endTime} <br />
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay pacientes en espera.</p>
      )}
    </div>
  );
};
export default DoctorDashboard;