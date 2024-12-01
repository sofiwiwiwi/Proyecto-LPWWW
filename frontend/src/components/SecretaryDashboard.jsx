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
        isAttended
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

const SecretaryDashboard = () => {
  const { user } = useAuth();
  const { loading: loadingDoctors, error: errorDoctors, data: doctorsData } = useQuery(GET_DOCTORS);
  const [fetchAgenda, { loading: loadingAgenda, data: agendaData }] = useLazyQuery(GET_DOCTOR_AGENDAS);
  const [fetchPatients, { loading: loadingPatients, data: patientsData }] = useLazyQuery(GET_WAITING_PATIENTS);
  const [addAvailability] = useMutation(ADD_AVAILABILITY);
  const [generateAgenda] = useMutation(GENERATE_AGENDA);
  const [addTimeSlot] = useMutation(ADD_TIME_SLOT);
  const [removeTimeSlot] = useMutation(REMOVE_TIME_SLOT);
  const [cancelTimeSlot] = useMutation(CANCEL_TIME_SLOT);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const handleFetchPatients = () => {
    fetchPatients({
      variables: {
        doctorId: selectedDoctor,
      },
    });
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

  const handleCancelReservation = async (selectedDoctor, day, startTime, endTime) => {
    try {
      const formattedDate = new Date(Number(day)).toISOString().split("T")[0];
      await cancelTimeSlot({
        variables: {
          input: {
            doctorId: selectedDoctor,
            date: formattedDate,
            startTime: startTime,
            endTime: endTime,
          },
        },
      });
      alert("Reserva cancelada existosamente.")
    }
    catch (error) {
      console.error("Error cancelando hora:", error);
      alert("Error al cancelar la reserva");
    }
  };

  if (loadingDoctors) return <p>Cargando lista de médicos...</p>;
  if (errorDoctors) return <p>Error al cargar los médicos: {errorDoctors.message}</p>;

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 text-white">
    <div className="container p-4 shadow-lg rounded">
      <h2>Panel de la Secretaria: {user?.name}</h2>
      <h3>Lista de Médicos</h3>
      <ul>
        {doctorsData.getDoctors.map((doctor) => (
          <li key={doctor.id}>
            <strong>{doctor.name}</strong> - {doctor.specialty}
            <button className="btn btn-primary" onClick={() => handleSelectDoctor(doctor.id)}>
              Seleccionar
            </button>
          </li>
        ))}
      </ul>

      {selectedDoctor && (
        <>
          <div>
            <h3>Agregar Disponibilidad</h3>
            <button className="btn btn-primary" onClick={addNewSlot}>Agregar Nuevo Horario</button>
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
            <button className="btn btn-success" onClick={handleAddAvailability}>Guardar Disponibilidad</button>
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
            <button className="btn btn-primary"onClick={handleGenerateAgenda}>Generar Agenda</button>
          </div>

          <div>
            <h3>Consultar Agenda</h3>
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
            <button className="btn btn-primary" onClick={handleFetchAgenda}>Consultar Agenda</button>
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
                              slot.isAttended ? (
                                <span>(Ya entendida)</span>
                              ) : (
                                <button
                                  className="btn btn-danger"
                                  onClick={() =>
                                    handleCancelReservation(selectedDoctor, day.date, slot.startTime, slot.endTime)
                                  }
                                >
                                  Eliminar reserva
                                </button>
                              )
                            ) : (
                              <button
                                className="btn btn-danger"
                                onClick={() =>
                                  handleRemoveTimeSlot(day.id, slot.startTime, slot.endTime)
                                }
                              >
                                Eliminar horario
                              </button>
                            )}
                        </li>
                      ))}
                    </ul>
                    <button
                      className="btn btn-light"
                      onClick={() => handleAddTimeSlot(day.id, "10:00", "10:30")}
                    >
                      Añadir Horario (10:00-10:30)
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3>Pacientes en espera</h3>
            <button className="btn btn-primary" onClick={handleFetchPatients}>Pacientes en espera</button>
              {loadingPatients && <p>Cargando pacientes...</p>}
              {patientsData?.getWaitingPatients.length > 0 ? (
                <ul className="list-group">
                  {patientsData.getWaitingPatients.map((appointment) => (
                    <li key={`${appointment.patientId}-${appointment.date}-${appointment.startTime}`}>
                      <span><strong>Paciente:</strong> {appointment.patientName}</span>
                      <span><strong> - Fecha:</strong> {new Date(Number(appointment.date)).toLocaleDateString('es-ES')}</span>
                      <span>
                        <strong> - Hora:</strong> {appointment.startTime} - {appointment.endTime}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay pacientes en espera.</p>
              )}
          </div>
        </>
      )}
    </div>
    </div>
  );
};

export default SecretaryDashboard;