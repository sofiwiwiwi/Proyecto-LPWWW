import React, { useState } from "react";
import { gql, useQuery, useLazyQuery, useMutation } from "@apollo/client";
import "bootstrap/dist/css/bootstrap.min.css";

const GET_DOCTORS = gql`
  query GetDoctors {
    getDoctors {
      id
      name
      specialty
    }
  }
`;

const GET_AGENDA = gql`
  query GetAgenda($doctorId: ID!, $startDate: String!, $endDate: String!) {
    getAgenda(doctorId: $doctorId, startDate: $startDate, endDate: $endDate) {
      date
      timeSlots {
        startTime
        endTime
        isReserved
      }
    }
  }
`;

const GET_PATIENT_APPOINTMENTS = gql`
  query GetPatientAppointments($patientId: ID!) {
    getPatientAppointments(patientId: $patientId) {
      date
      startTime
      endTime
      doctorId
      doctorName
    }
  }
`;

const BOOK_TIME_SLOT = gql`
  mutation BookTimeSlot($input: BookTimeSlotInput!) {
    bookTimeSlot(input: $input) {
      id
      date
      timeSlots {
        startTime
        endTime
        isReserved
      }
    }
  }
`;

const CANCEL_TIME_SLOT = gql`
  mutation CancelTimeSlot($input: CancelTimeSlotInput!) {
    cancelTimeSlot(input: $input) {
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
`;

const formatDate = (date) => {
  const parsedDate = new Date(Number(date));
  if (isNaN(parsedDate.getTime())) {
    return "Fecha inválida";
  }
  return parsedDate.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const PatientDashboard = ({ patientId }) => {
  const { loading, error, data } = useQuery(GET_DOCTORS);
  const [fetchAgenda, { loading: agendaLoading, data: agendaData, refetch: refetchAgenda }] = useLazyQuery(GET_AGENDA);
  const [bookTimeSlot] = useMutation(BOOK_TIME_SLOT);
  const [cancelTimeSlot] = useMutation(CANCEL_TIME_SLOT);

  const [showModal, setShowModal] = useState(false);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-01-07");

  const handleSelectDoctor = (doctorId) => {
    setSelectedDoctor(doctorId);
    fetchAgenda({
      variables: {
        doctorId,
        startDate,
        endDate,
      },
    });
  };

  const handleBookTimeSlot = async (date, startTime, endTime) => {
    try {
      const formattedDate = new Date(Number(date)).toISOString().split("T")[0];
      await bookTimeSlot({
        variables: {
          input: {
            doctorId: selectedDoctor,
            date: formattedDate,
            startTime,
            endTime,
          },
        },
      });

      alert("Hora reservada exitosamente.");

      if (agendaData) {
        const updatedAgenda = {
          ...agendaData,
          getAgenda: agendaData.getAgenda.map((day) => {
            if (day.date === date) {
              return {
                ...day,
                timeSlots: day.timeSlots.map((slot) =>
                  slot.startTime === startTime && slot.endTime === endTime
                    ? { ...slot, isReserved: true }
                    : slot
                ),
              };
            }
            return day;
          }),
        };
        fetchAgenda({
          variables: { doctorId: selectedDoctor, startDate, endDate }
        })
      }
    } catch (err) {
      alert(`Error al reservar: ${err.message}`);
    }
  };

  const [fetchPatientAppointments, { loading: appointmentsLoading, data: appointmentsData }] = useLazyQuery(GET_PATIENT_APPOINTMENTS, {
    onCompleted: (data) => {
      setPatientAppointments(data.getPatientAppointments);
    },
  });

  const handleShowAppointments = () => {
    fetchPatientAppointments({ variables: { patientId } });
    setShowModal(true);
  };

  const handleCancelReservation = async (appointment) => {
    try {
      const formattedDate = new Date(Number(appointment.date)).toISOString().split("T")[0];
      await cancelTimeSlot({
        variables: {
          input: {
            doctorId: appointment.doctorId,
            date: formattedDate,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
          },
        },
      });

      // Update local appointments state
      setPatientAppointments((prevAppointments) =>
        prevAppointments.filter(
          (appt) =>
            !(
              appt.date === appointment.date &&
              appt.startTime === appointment.startTime &&
              appt.endTime === appointment.endTime &&
              appt.doctorId === appointment.doctorId
            )
        )
      );
      alert("Se canceló su hora correctamente");
    } catch (error) {
      console.error("Error cancelando hora:", error);
      alert("Error cancelando hora", error);
    }
  };

  if (loading) return <p>Cargando doctores...</p>;
  if (error) return <p>Error al cargar doctores: {error.message}</p>;

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 text-white">
      <div className="container p-4 shadow-lg rounded">
        <h2 className="text-center mb-4">Panel del Paciente</h2>

        <button className="btn btn-light" onClick={handleShowAppointments}>
          Ver horas reservadas
        </button>
        {showModal && (
          <div className="modal show d-block">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Mis horas reservadas</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)} />
                </div>
                <div className="modal-body">
                  {appointmentsLoading ? (
                    <p>Cargando horas reservadas...</p>
                  ) : (
                    <ul className="list-group">
                      {patientAppointments.length > 0 ? (
                        patientAppointments.map((appointment, index) => (
                          <li key={index} className="list-group-item">
                            <strong>Fecha:</strong> {formatDate(appointment.date)} <br />
                            <strong>Hora:</strong> {appointment.startTime} - {appointment.endTime} <br />
                            <strong>Médico:</strong> {appointment.doctorName || "N/A"}
                            <div >
                              <button className="btn btn-danger" onClick={() => handleCancelReservation(appointment)}>Cancelar hora</button>
                            </div>
                          </li>
                        ))
                      ) : (
                        <p>No tienes horas reservadas.</p>
                      )}
                    </ul>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <h3 className="text-center mb-3">Lista de Doctores</h3>
        <ul className="list-group">
          {data.getDoctors.map((doctor) => (
            <li key={doctor.id} className="list-group-item d-flex justify-content-between align-items-center">
              <strong>{doctor.name}</strong> - {doctor.specialty}
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleSelectDoctor(doctor.id)}
              >
                Ver Agenda
              </button>
            </li>
          ))}
        </ul>

        {agendaLoading && <p>Cargando agenda...</p>}
        {agendaData && agendaData.getAgenda && (
          <div className="mt-4">
            <h3 className="text-center mb-3">Agenda del Doctor</h3>
            <ul className="list-group">
              {agendaData.getAgenda.map((day) => (
                <li key={day.date} className="list-group-item">
                  <strong>{formatDate(day.date)}</strong>
                  <ul className="list-group mt-2">
                    {day.timeSlots.map((slot, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        {slot.startTime} - {slot.endTime}{" "}
                        {slot.isReserved ? (
                          <span className="badge bg-danger">Reservado</span>
                        ) : (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleBookTimeSlot(day.date, slot.startTime, slot.endTime)}
                          >
                            Reservar
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;