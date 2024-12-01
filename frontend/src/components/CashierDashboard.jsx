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
    <div className="container">
      <h2>Panel del Cajero</h2>

      <h3>Seleccionar Médico</h3>
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
      <button onClick={handleFetchStatement}>Generar Estado</button>

      {loadingStatement && <p>Cargando estado de comisión...</p>}
      {statementData && (
        <div>
          {statementData.getCommissionStatement?.map((statement) => (
            <div key={statement.doctorId}>
              <h4>Estado de Comisión - {statement.doctorName}</h4>
              <p><strong>Total Ingresos:</strong> ${statement.totalRevenue.toFixed(2)}</p>
              <p><strong>Tasa de Comisión:</strong> {statement.commissionPercentage}%</p>
              <p><strong>Monto de Comisión:</strong> ${statement.commissionAmount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {loadingGeneral && <p>Cargando informe general...</p>}
      {generalData && generalData.getGeneralReport && (
        <div>
          <h3>Informe General</h3>
          <p><strong>Total Pacientes:</strong> {generalData.getGeneralReport.totalPatients}</p>
          <p><strong>Total Recaudado:</strong> ${generalData.getGeneralReport.totalRevenue.toFixed(2)}</p>
          <h4>Detalles por Médico:</h4>
          {generalData.getGeneralReport.doctorReports.map((report) => (
            <div key={report.doctorId}>
              <p><strong>Médico:</strong> {report.doctorName}</p>
              <p>Total Pacientes: {report.totalPatients}</p>
              <p>Total Recaudado: ${report.totalRevenue.toFixed(2)}</p>
            </div>
          ))}
        </div>
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
    </div>
  );
};

export default CashierDashboard;