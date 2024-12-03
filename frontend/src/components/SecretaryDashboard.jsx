import React, { useState } from "react";
import { gql, useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { useAuth } from "../authContext";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import './SecretaryDashboard.css';

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
        <h3>Panel de la Secretaria</h3>
        
        <Row>
          {/* Canal 1: Lista de Médicos */}
          <Col xs={12} sm={6} md={4} lg={3} className="mb-4">
            <h5>Seleccione un Médico</h5>
            <ul className="list-unstyled">
              {doctorsData.getDoctors.map((doctor) => (
                <li
                  key={doctor.id}
                  className={`mb-2 p-2 ${selectedDoctor === doctor.id ? 'text-white rounded' : ''}`}
                  style={{backgroundColor: selectedDoctor === doctor.id ? '#16324f' : 'transparent',
                    cursor: 'pointer' }}
                >
                  <strong>{doctor.name}</strong> - {doctor.specialty}
                  <button
                    className={`btn mt-2 ${selectedDoctor === doctor.id ? 'btn-light' : 'btn-primary'}`}
                    onClick={() => handleSelectDoctor(doctor.id)}
                    style={{
                      backgroundColor: selectedDoctor === doctor.id ? 'green' : '#18435a', // Establecer color según si está seleccionado
                      color: 'white', // Texto blanco
                      border: 'none', // Sin borde
                      padding: '0.375rem 0.75rem', // Ajuste de tamaño
                      cursor: 'pointer',
                    }}
                  >
                    Seleccionar
                  </button>
                </li>
              ))}
            </ul>
          </Col>
  
          {/* Canal 2: Agregar Disponibilidad */}
          <Col xs={12} sm={6} md={4} lg={3} className="mb-4">
            {selectedDoctor && (
              <>
                <h5>Agregar Disponibilidad</h5>
                <button className="btn-custom" onClick={addNewSlot}>
                  Agregar Nuevo Horario
                </button>
                {availability.map((slot, index) => (
                  <div key={index} className="mt-2">
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
                <button className="btn-custom-lapis" onClick={handleAddAvailability}>Guardar Disponibilidad</button>
              </>
            )}
          </Col>
  
          {/* Canal 3: Generar Agenda */}
          <Col xs={12} sm={6} md={4} lg={3} className="mb-4">
            {selectedDoctor && (
              <>
                <h5>Generar Agenda</h5>
                <form onSubmit={handleGenerateAgenda}>
                  <div className="mb-3">
                    <label>Fecha de Inicio</label>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label>Fecha de Fin</label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                  <button className="btn-custom" type="submit">Generar Agenda</button>
                </form>
              </>
            )}
          </Col>
  
          {/* Canal 4: Consultar Agenda */}
         
          {/* Canal 5: Ver Pacientes en Espera */}
          <Col xs={12} sm={6} md={4} lg={3} className="mt-3">
            {selectedDoctor && (
              <>
                <h5>Ver Pacientes en Espera</h5>
                <button className="btn-custom" onClick={handleFetchPatients}>Ver Pacientes</button>
                <div>
                  {patientsData && (
                    <div>
                      <h6>Pacientes en espera para {selectedDoctor}</h6>
                      <ul>
                        {patientsData.getWaitingPatients.map((patient, index) => (
                          <li key={index}>
                            {patient.name} - {patient.issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </Col>
        </Row>
        <Row>
        {/* Columna para el formulario */}
          <Col xs={12} md={4} className="mb-4">
            <h3>Consultar Agenda</h3>

            {/* Fecha de inicio */}
            <Form.Group className="mb-3">
              <Form.Label>Fecha de inicio:</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>

            {/* Fecha de término */}
            <Form.Group className="mb-3">
              <Form.Label>Fecha de término:</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>

            {/* Botón para consultar agenda */}
            <Button
              variant="primary"
              onClick={handleFetchAgenda}
              className="btn-custom"
            >
              Consultar Agenda
            </Button>

            {/* Cargando */}
            {loadingAgenda && <p>Cargando agenda...</p>}
          </Col>

          {/* Columna para la lista de la agenda */}
          <Col xs={12} md={8} className="mb-4">
            {/* Mostrar la agenda */}
            {agendaData && agendaData.getAgenda && (
              <div className="d-flex flex-column">
                <h4>Agenda</h4>
                <ul className="list-unstyled">
                  {agendaData.getAgenda.map((day) => (
                    <li key={day.id} className="mb-4">
                      <strong>{new Date(parseInt(day.date)).toLocaleDateString("es-ES")}</strong>
                      <ul className="list-unstyled">
                        {day.timeSlots.map((slot, index) => (
                          <li key={index}>
                            {slot.startTime} - {slot.endTime}{" "}
                            {slot.isReserved ? (
                              slot.isAttended ? (
                                <span>(Ya entendida)</span>
                              ) : (
                                <Button
                                  className="logout-button"
                                  variant="danger"
                                  onClick={() =>
                                    handleCancelReservation(
                                      selectedDoctor,
                                      day.date,
                                      slot.startTime,
                                      slot.endTime
                                    )
                                  }
                                >
                                  Eliminar reserva
                                </Button>
                              )
                            ) : (
                              <Button
                                className="logout-button"
                                variant="danger"
                                onClick={() =>
                                  handleRemoveTimeSlot(day.id, slot.startTime, slot.endTime)
                                }
                              >
                                Eliminar horario
                              </Button>
                            )}
                          </li>
                        ))}
                      </ul>

                      {/* Botón para añadir horario */}
                      <Button
                        variant="light"
                        onClick={() => handleAddTimeSlot(day.id, "10:00", "10:30")}
                      >
                        Añadir Horario (10:00-10:30)
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
  
};

export default SecretaryDashboard;