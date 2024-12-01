import React, { useState } from "react";
import { gql, useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { useAuth } from "../authContext";

const GET_DOCTORS = gql`
  query GetDoctors {
    getDoctors {
      id
      name
      specialty
    }
  }
`;

const GET_DOCTOR_AGENDAS = gql`
  query GetDoctorAgendas($doctorId: ID!, $startDate: String!, $endDate: String!) {
    getAgenda(doctorId: $doctorId, startDate: $startDate, endDate: $endDate) {
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

const ADD_AVAILABILITY = gql`
  mutation AddAvailability($doctorId: ID!, $availability: [AvailabilityInput!]!) {
    addAvailability(doctorId: $doctorId, availability: $availability) {
      id
      name
      availability {
        day
        startTime
        endTime
      }
    }
  }
`;

const GENERATE_AGENDA = gql`
  mutation GenerateAgenda($doctorId: ID!, $startDate: String!, $endDate: String!) {
    generateAgenda(doctorId: $doctorId, startDate: $startDate, endDate: $endDate) {
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

const ADD_TIME_SLOT = gql`
  mutation AddTimeSlot($agendaId: ID!, $timeSlot: TimeSlotInput!) {
    addTimeSlot(agendaId: $agendaId, timeSlot: $timeSlot) {
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

const REMOVE_TIME_SLOT = gql`
  mutation RemoveTimeSlot($agendaId: ID!, $timeSlot: TimeSlotInput!) {
    removeTimeSlot(agendaId: $agendaId, timeSlot: $timeSlot) {
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

const SecretaryDashboard = () => {
  const { user } = useAuth();
  const { loading: loadingDoctors, error: errorDoctors, data: doctorsData } = useQuery(GET_DOCTORS);
  const [fetchAgenda, { loading: loadingAgenda, data: agendaData }] = useLazyQuery(GET_DOCTOR_AGENDAS);
  const [addAvailability] = useMutation(ADD_AVAILABILITY);
  const [generateAgenda] = useMutation(GENERATE_AGENDA);
  const [addTimeSlot] = useMutation(ADD_TIME_SLOT);
  const [removeTimeSlot] = useMutation(REMOVE_TIME_SLOT);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-01-07");

  const handleSelectDoctor = (id) => {
    setSelectedDoctor(id);
  };

  const handleAddAvailability = async () => {
    try {
      await addAvailability({
        variables: {
          doctorId: selectedDoctor,
          availability,
        },
      });
      alert("Disponibilidad añadida exitosamente.");
    } catch (err) {
      alert("Error al añadir disponibilidad: " + err.message);
    }
  };

  const handleGenerateAgenda = async () => {
    try {
      await generateAgenda({
        variables: {
          doctorId: selectedDoctor,
          startDate,
          endDate,
        },
      });
      alert("Agenda generada exitosamente.");
    } catch (err) {
      alert("Error al generar la agenda: " + err.message);
    }
  };

  const handleFetchAgenda = () => {
    fetchAgenda({
      variables: {
        doctorId: selectedDoctor,
        startDate,
        endDate,
      },
    });
  };

  const handleAddTimeSlot = async (agendaId, startTime, endTime) => {
    try {
      await addTimeSlot({
        variables: {
          agendaId,
          timeSlot: { startTime, endTime },
        },
      });
      alert("Horario añadido exitosamente.");
      handleFetchAgenda();
    } catch (err) {
      alert("Error al añadir horario: " + err.message);
    }
  };

  const handleRemoveTimeSlot = async (agendaId, startTime, endTime) => {
    try {
      await removeTimeSlot({
        variables: {
          agendaId,
          timeSlot: { startTime, endTime },
        },
      });
      alert("Horario eliminado exitosamente.");
      handleFetchAgenda();
    } catch (err) {
      alert("Error al eliminar horario: " + err.message);
    }
  };

  const addNewSlot = () => {
    setAvailability([...availability, { day: "", startTime: "", endTime: "" }]);
  };

  if (loadingDoctors) return <p>Cargando lista de médicos...</p>;
  if (errorDoctors) return <p>Error al cargar los médicos: {errorDoctors.message}</p>;

  return (
    <div className="container">
      <h2>Panel de la Secretaria: {user?.name}</h2>
      <h3>Lista de Médicos</h3>
      <ul>
        {doctorsData.getDoctors.map((doctor) => (
          <li key={doctor.id}>
            <strong>{doctor.name}</strong> - {doctor.specialty}
            <button onClick={() => handleSelectDoctor(doctor.id)}>
              Seleccionar
            </button>
          </li>
        ))}
      </ul>

      {selectedDoctor && (
        <>
          <div>
            <h3>Agregar Disponibilidad</h3>
            <button onClick={addNewSlot}>Agregar Nuevo Horario</button>
            {availability.map((slot, index) => (
              <div key={index}>
                <select
                  value={slot.day}
                  onChange={(e) =>
                    setAvailability(
                      availability.map((s, i) =>
                        i === index ? { ...s, day: e.target.value } : s
                      )
                    )
                  }
                >
                  <option value="">Seleccione un día</option>
                  <option value="Lunes">Lunes</option>
                  <option value="Martes">Martes</option>
                  <option value="Miércoles">Miércoles</option>
                  <option value="Jueves">Jueves</option>
                  <option value="Viernes">Viernes</option>
                  <option value="Sábado">Sábado</option>
                  <option value="Domingo">Domingo</option>
                </select>
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) =>
                    setAvailability(
                      availability.map((s, i) =>
                        i === index ? { ...s, startTime: e.target.value } : s
                      )
                    )
                  }
                />
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) =>
                    setAvailability(
                      availability.map((s, i) =>
                        i === index ? { ...s, endTime: e.target.value } : s
                      )
                    )
                  }
                />
              </div>
            ))}
            <button onClick={handleAddAvailability}>Guardar Disponibilidad</button>
          </div>

          <div>
            <h3>Generar Agenda</h3>
            <label>
              Fecha de inicio:
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              Fecha de término:
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
            <button onClick={handleGenerateAgenda}>Generar Agenda</button>
          </div>

          <div>
            <h3>Consultar Agenda</h3>
            <button onClick={handleFetchAgenda}>Consultar Agenda</button>
            {loadingAgenda && <p>Cargando agenda...</p>}
            {agendaData && agendaData.getAgenda && (
              <ul>
                {agendaData.getAgenda.map((day) => (
                  <li key={day.id}>
                    <strong>{new Date(parseInt(day.date)).toLocaleDateString("es-ES")}</strong>
                    <ul>
                      {day.timeSlots.map((slot, index) => (
                        <li key={index}>
                          {slot.startTime} - {slot.endTime}{" "}
                          {slot.isReserved ? (
                            <span>(Reservado)</span>
                          ) : (
                            <button
                              onClick={() =>
                                handleRemoveTimeSlot(day.id, slot.startTime, slot.endTime)
                              }
                            >
                              Eliminar
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleAddTimeSlot(day.id, "10:00", "10:30")}
                    >
                      Añadir Horario (10:00-10:30)
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SecretaryDashboard;