import React, { useState } from "react";
import { gql, useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { Row, Col, Button, Form } from "react-bootstrap";
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

const REGISTER_PAYMENT = gql`
  mutation RegisterPayment($input: PaymentInput!) {
    registerPayment(input: $input) {
      id
      name
      payments {
        paymentDate
        amountPaid
        paymentMethod
        reference
      }
    }
  }
`;

const GET_COMMISSION_STATEMENT = gql`
  query GetCommissionStatement($startDate: String!, $endDate: String!, $doctorId: ID) {
    getCommissionStatement(startDate: $startDate, endDate: $endDate, doctorId: $doctorId) {
      doctorId
      doctorName
      totalRevenue
      commissionPercentage
      commissionAmount
    }
  }
`;

const GET_GENERAL_REPORT = gql`
  query GetGeneralReport($startDate: String!, $endDate: String!) {
    getGeneralReport(startDate: $startDate, endDate: $endDate) {
      doctorReports {
        doctorId
        doctorName
        totalPatients
        totalRevenue
      }
      totalPatients
      totalRevenue
    }
  }
`;

const GET_REVENUE_REPORT = gql`
  query GetRevenueReport($startDate: String!, $endDate: String!) {
    getRevenueReport(startDate: $startDate, endDate: $endDate) {
      doctorId
      doctorName
      totalPatients
      totalRevenue
    }
  }
`;

const CashierDashboard = () => {
  const { loading: loadingDoctors, error: errorDoctors, data: doctorsData } = useQuery(GET_DOCTORS);
  const [fetchCommissionStatement, { loading: loadingStatement, data: statementData }] = useLazyQuery(GET_COMMISSION_STATEMENT);
  const [fetchGeneralReport, { loading: loadingGeneral, data: generalData }] = useLazyQuery(GET_GENERAL_REPORT);
  const [fetchRevenueReport, { loading: loadingRevenue, data: revenueData }] = useLazyQuery(GET_REVENUE_REPORT);
  const [registerPayment] = useMutation(REGISTER_PAYMENT);

  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [reference, setReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleRegisterPayment = async () => {
    if (!selectedDoctor || !amountPaid || !paymentMethod || !paymentDate) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    try {
      await registerPayment({
        variables: {
          input: {
            doctorId: selectedDoctor,
            amountPaid: parseFloat(amountPaid),
            paymentMethod,
            reference,
            paymentDate,
          },
        },
      });
      alert("Pago registrado exitosamente.");
      setAmountPaid("");
      setPaymentMethod("");
      setReference("");
    } catch (err) {
      alert("Error al registrar el pago: " + err.message);
    }
  };

  const handleFetchStatement = () => {
    if (!startDate || !endDate) {
      alert("Por favor seleccione un rango de fechas.");
      return;
    }

    if (selectedDoctor) {
      fetchCommissionStatement({
        variables: {
          startDate,
          endDate,
          doctorId: selectedDoctor,
        },
      });
    } else {
      fetchGeneralReport({
        variables: {
          startDate,
          endDate,
        },
      });
    }
  };

  const handleFetchRevenueReport = () => {
    if (!startDate || !endDate) {
      alert("Por favor seleccione un rango de fechas.");
      return;
    }

    fetchRevenueReport({
      variables: {
        startDate,
        endDate,
      },
    });
  };

  const setTodayAsPaymentDate = () => {
    setPaymentDate(new Date().toISOString().split("T")[0]);
  };

  if (loadingDoctors) return <p>Cargando lista de médicos...</p>;
  if (errorDoctors) return <p>Error al cargar los médicos: {errorDoctors.message}</p>;

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 text-white">
      <div className="container p-4 shadow-lg rounded">
        <h2>Panel del Cajero</h2>

        <Row>
          {/* Canal 1: Seleccionar Médico */}
          <Col xs={12} sm={6} md={4} lg={3} className="mb-4">
            <h5>Seleccionar Médico</h5>
            <Form.Select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="mb-3"
            >
              <option value="">Todos los médicos</option>
              {doctorsData?.getDoctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialty}
                </option>
              ))}
            </Form.Select>
          </Col>

          {/* Canal 2: Registrar Pago */}
          <Col xs={12} sm={6} md={4} lg={3} className="mb-4">
            <h5>Registrar Pago</h5>
            <Form.Group className="mb-3">
              <Form.Label>Fecha de Pago</Form.Label>
              <Form.Control
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
              <Button className="btn-custom" variant="secondary" onClick={() => setPaymentDate(new Date().toISOString().split("T")[0])}>
                Hoy
              </Button>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Monto Pagado</Form.Label>
              <Form.Control
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Método de Pago</Form.Label>
              <Form.Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="">Seleccione un método</option>
                <option value="Cash">Efectivo</option>
                <option value="Card">Tarjeta</option>
                <option value="Isapre">Isapre</option>
                <option value="FONASA">FONASA</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Referencia (opcional)</Form.Label>
              <Form.Control
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="primary"
              onClick={handleRegisterPayment}
              className="btn-custom"
            >
              Registrar Pago
            </Button>
          </Col>

          {/* Canal 3: Consultar Reporte de Recaudación */}
          <Col xs={12} sm={6} md={4} lg={3} className="mb-4">
            <h3>Generar Estado de Comisión</h3>

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

            {/* Botón para generar estado de comisión */}
            <Button variant="primary" onClick={handleFetchStatement} className="btn-custom">
              Generar Estado
            </Button>

            {/* Cargando estado de comisión */}
            {loadingStatement && <p>Cargando estado de comisión...</p>}

            {/* Mostrar estado de comisión */}
            {statementData && (
              <div>
                {statementData.getCommissionStatement?.map((statement) => (
                  <div key={statement.doctorId} className="mb-4">
                    <h4>Estado de Comisión - {statement.doctorName}</h4>
                    <p><strong>Total Ingresos:</strong> ${statement.totalRevenue.toFixed(2)}</p>
                    <p><strong>Tasa de Comisión:</strong> {statement.commissionPercentage}%</p>
                    <p><strong>Monto de Comisión:</strong> ${statement.commissionAmount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Cargando informe general */}
            {loadingGeneral && <p>Cargando informe general...</p>}

            {/* Mostrar informe general */}
            {generalData && generalData.getGeneralReport && (
              <div>
                <h3>Informe General</h3>
                <p><strong>Total Pacientes:</strong> {generalData.getGeneralReport.totalPatients}</p>
                <p><strong>Total Recaudado:</strong> ${generalData.getGeneralReport.totalRevenue.toFixed(2)}</p>
                <h4>Detalles por Médico:</h4>
                {generalData.getGeneralReport.doctorReports.map((report) => (
                  <div key={report.doctorId} className="mb-3">
                    <p><strong>Médico:</strong> {report.doctorName}</p>
                    <p>Total Pacientes: {report.totalPatients}</p>
                    <p>Total Recaudado: ${report.totalRevenue.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </Col>

          <Col xs={12} sm={6} md={4} lg={3} className="mb-4">
            <h3>Informe de Recaudación</h3>

            <Form.Group className="mb-3">
              <Form.Label>Fecha de inicio:</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Fecha de término:</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Médico (opcional):</Form.Label>
              <Form.Control
                as="select"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
              >
                <option value="">Todos los médicos</option>
                {doctorsData.getDoctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Button
              variant="primary"
              onClick={handleFetchRevenueReport}
              className="btn-custom"
            >
              Generar Informe
            </Button>

            {loadingRevenue && <p>Cargando informe de recaudación...</p>}

            {revenueData && (
              <div>
                <h4>Recaudación</h4>
                <ul>
                  {revenueData.getRevenueReport.map((report) => (
                    <li key={report.doctorId}>
                      <strong>{report.doctorName}</strong>
                      <p>Total Pacientes: {report.totalPatients}</p>
                      <p>Total Recaudado: ${report.totalRevenue.toFixed(2)}</p>
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

export default CashierDashboard;