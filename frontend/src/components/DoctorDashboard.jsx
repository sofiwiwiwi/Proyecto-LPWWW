import React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";

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

const MARK_PATIENT_ATTENDED = gql`
  mutation MarkPatientAttended($input: MarkAttendedInput!) {
    markPatientAttended(input: $input) {
      id
      doctorId
      date
      timeSlots {
        startTime
        endTime
        isReserved
      }
    }
  }
`

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

  const [markPatientAttended] = useMutation(MARK_PATIENT_ATTENDED);

  const handleMarkAttended = async (appointment) => {
    try {
      const formattedDate = new Date(Number(appointment.date)).toISOString().split("T")[0]
      await markPatientAttended({
        variables: {
          input: {
            doctorId,
            date: formattedDate,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
          },
        },
      });
      alert("Se marcó el paciente como atendido correctamente");+
      console.log("Se marco el paciente")
    } catch (error) {
      console.error("Error marcando paciente:", error);
      alert("Error marcando paciente como atendido", error);
    }
  }
  
  if (loading) return <p>Cargando pacientes en espera...</p>;
  if (error) return <p>Error al cargar pacientes: {error.message}</p>;

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 text-white">
      <div className="container p-4 shadow-lg rounded">
        <h2 className="text-center mb-4">Panel del Médico</h2>

        <h3>Pacientes en Espera</h3>
        {data.getWaitingPatients.length > 0 ? (
          <ul className="list-group">
            {data.getWaitingPatients.map((appointment) => (
              <li key={`${appointment.patientId}-${appointment.date}-${appointment.startTime}`} className="list-group-item d-flex justify-content-between align-items-center">
                <strong>Paciente:</strong> {appointment.patientName} <br />
                <strong>Fecha:</strong> {formatDate(appointment.date)} <br />
                <strong>Hora:</strong> {appointment.startTime} - {appointment.endTime} <br />
                <button className="btn btn-success" onClick={() => handleMarkAttended(appointment)}>
                  Marcar como atendido
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay pacientes en espera.</p>
        )}
      </div>
    </div>
  );
};
export default DoctorDashboard;