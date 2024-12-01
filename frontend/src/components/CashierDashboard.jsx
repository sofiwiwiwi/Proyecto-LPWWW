import React, { useState } from "react";
import { gql, useQuery, useMutation, useLazyQuery } from "@apollo/client";

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
      doctorName
      totalRevenue
      commissionPercentage
      commissionAmount

    }
  }
`;

const GET_REVENUE_REPORT = gql`
  query GetRevenueReport($startDate: String!, $endDate: String!, $doctorId: ID) {
    getRevenueReport(startDate: $startDate, endDate: $endDate, doctorId: $doctorId) {
      doctorId
      doctorName
      totalRevenue
      totalPatients
    }
  }
`;

const CashierDashboard = () => {
  const { loading: loadingDoctors, error: errorDoctors, data: doctorsData } = useQuery(GET_DOCTORS);
  const [fetchCommissionStatement, { loading: loadingStatement, data: statementData }] = useLazyQuery(GET_COMMISSION_STATEMENT);
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
    if (!selectedDoctor || !amountPaid || !paymentMethod) {
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

    fetchCommissionStatement({
      variables: {
        startDate,
        endDate,
        doctorId: selectedDoctor || null,
      },
    });
  };

  const setTodayAsPaymentDate = () => {
    setPaymentDate(new Date().toISOString().split("T")[0]);
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
        doctorId: selectedDoctor || null,
      },
    });
  };

  if (loadingDoctors) return <p>Cargando lista de médicos...</p>;
  if (errorDoctors) return <p>Error al cargar los médicos: {errorDoctors.message}</p>;

  return (
    <div className="container">
      <h2>Panel del Cajero</h2>

      <h3>Seleccionar Médico</h3>
      <select
        value={selectedDoctor || ""}
        onChange={(e) => setSelectedDoctor(e.target.value)}
      >
        <option value="">Seleccione un médico</option>
        {doctorsData.getDoctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.name} - {doctor.specialty}
          </option>
        ))}
      </select>

      <h3>Registrar Pago</h3>
      <label>
        Fecha de Pago:
        <input
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
        />
        <button onClick={setTodayAsPaymentDate}>Hoy</button>
      </label>
      <label>
        Monto Pagado:
        <input
          type="number"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
        />
      </label>
      <label>
        Método de Pago:
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="">Seleccione un método</option>
          <option value="Cash">Efectivo</option>
          <option value="Document">Documento</option>
          <option value="Card">Tarjeta</option>
          <option value="Isapre">Isapre</option>
          <option value="FONASA">FONASA</option>
        </select>
      </label>
      <label>
        Referencia (opcional):
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />
      </label>
      <button onClick={handleRegisterPayment}>Registrar Pago</button>

      <h3>Generar Estado de Comisión</h3>
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
      <label>
        Médico (opcional):
        <select
          value={selectedDoctor || ""}
          onChange={(e) => setSelectedDoctor(e.target.value)}
        >
          <option value="">Todos los médicos</option>
          {doctorsData.getDoctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} - {doctor.specialty}
            </option>
          ))}
        </select>
      </label>
      <button onClick={handleFetchStatement}>
        Generar Estado
      </button>

      {loadingStatement && <p>Cargando estado de comisión...</p>}
      {statementData && statementData.getCommissionStatement.length > 0 ? (
        <div>
          {statementData.getCommissionStatement.map((statement, index) => (
            <div key={index}>
              <h4>Estado de Comisión - {statement.doctorName}</h4>
              <p><strong>Total Ingresos:</strong> ${statement.totalRevenue.toFixed(2)}</p>
              <p><strong>Tasa de Comisión:</strong> {statement.commissionPercentage}%</p>
              <p><strong>Monto de Comisión:</strong> ${statement.commissionAmount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      ) : (
        statementData && <p>No se encontraron datos en el rango de fechas seleccionado.</p>
      )}

      <h3>Informe de Recaudación</h3>
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
      <label>
        Médico (opcional):
        <select
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
        >
          <option value="">Todos los médicos</option>
          {doctorsData.getDoctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} - {doctor.specialty}
            </option>
          ))}
        </select>
      </label>
      <button onClick={handleFetchRevenueReport}>Generar Informe</button>

      {loadingRevenue && <p>Cargando informe de recaudación...</p>}
      {revenueData && revenueData.getRevenueReport && (
        <div>
          <h4>Recaudación</h4>
          <ul>
            {revenueData.getRevenueReport.map((doctor) => (
              <li key={doctor.doctorId}>
                <strong>{doctor.doctorName}</strong>
                <p>Total Pacientes: {doctor.totalPatients}</p>
                <p>Total Recaudado: ${doctor.totalRevenue.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CashierDashboard;