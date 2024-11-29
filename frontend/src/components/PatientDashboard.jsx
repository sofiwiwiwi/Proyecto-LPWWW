import React, { useState } from "react";
import { gql, useQuery, useLazyQuery, useMutation } from "@apollo/client";

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

const formatDate = (date) => {
  // Handle UNIX timestamp format
  const parsedDate = new Date(Number(date));
  console.log("Raw date value:", date);
  console.log("Parsed date:", parsedDate);

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

const PatientDashboard = () => {
  const { loading, error, data } = useQuery(GET_DOCTORS);
  const [fetchAgenda, { loading: agendaLoading, data: agendaData }] = useLazyQuery(GET_AGENDA);
  const [bookTimeSlot] = useMutation(BOOK_TIME_SLOT);

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
      // Format the date as a string for the backend
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
      fetchAgenda({ variables: { doctorId: selectedDoctor, startDate, endDate } }); // Refresh agenda
    } catch (err) {
      alert(`Error al reservar: ${err.message}`);
    }
  };

  if (loading) return <p>Cargando doctores...</p>;
  if (error) return <p>Error al cargar doctores: {error.message}</p>;

  return (
    <div>
      <h2>Panel del Paciente</h2>
      <h3>Lista de Doctores</h3>
      <ul>
        {data.getDoctors.map((doctor) => (
          <li key={doctor.id}>
            <strong>{doctor.name}</strong> - {doctor.specialty}
            <button onClick={() => handleSelectDoctor(doctor.id)}>Ver Agenda</button>
          </li>
        ))}
      </ul>

      {agendaLoading && <p>Cargando agenda...</p>}
      {agendaData && agendaData.getAgenda && (
        <div>
          <h3>Agenda del Doctor</h3>
          <ul>
            {agendaData.getAgenda.map((day) => (
              <li key={day.date}>
                <strong>{formatDate(day.date)}</strong>
                <ul>
                  {day.timeSlots.map((slot, index) => (
                    <li key={index}>
                      {slot.startTime} - {slot.endTime}{" "}
                      {slot.isReserved ? (
                        <span>(Reservado)</span>
                      ) : (
                        <button
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
  );
};

export default PatientDashboard;