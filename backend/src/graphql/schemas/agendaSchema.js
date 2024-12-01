const { gql } = require('apollo-server-express');

const agendaSchema = gql`
  type TimeSlot {
    startTime: String!
    endTime: String!
    isReserved: Boolean!
    patientId: ID
  }

  type Agenda {
    id: ID!
    doctorId: ID!
    date: String!
    timeSlots: [TimeSlot!]!
  }
  
  type RevenueReport {
    doctorId: ID!
    doctorName: String!
    totalPatients: Int!
    totalRevenue: Float!
  }
  
  type CommissionStatement {
    doctorId: ID!
    doctorName: String!
    totalRevenue: Float!
    commissionPercentage: Float!
    commissionAmount: Float!
  } 

  type WaitingPatient {
    patientId: ID!
    patientName: String!
    startTime: String!
    endTime: String!
    date: String!
  }

  type Appointment {
    date: String!
    startTime: String!
    endTime: String!
    doctorId: ID!
    doctorName: String!
  }
  
  type GeneralReport {
    totalRevenue: Float!
    totalPatients: Int!
    doctorReports: [RevenueReport!]!
  }

  input TimeSlotInput {
    startTime: String!
    endTime: String!
  }

  input BookTimeSlotInput {
    doctorId: ID!
    date: String!
    startTime: String!
    endTime: String!
  }

  input CancelTimeSlotInput {
    doctorId: ID!
    date: String!
    startTime: String!
    endTime: String!
  }
  
  input MarkAttendedInput {
    doctorId: ID!
    date: String!
    startTime: String!
    endTime: String!
  }

  type Query {
    getAgenda(doctorId: ID!, startDate: String!, endDate: String!): [Agenda!]!
    getWaitingPatients(doctorId: ID!): [WaitingPatient!]!
    getRevenueReport(startDate: String!, endDate: String!, doctorId: ID): [RevenueReport!]!
    getCommissionStatement(startDate: String!, endDate: String!, doctorId: ID): [CommissionStatement!]!
    getGeneralReport(startDate: String!, endDate: String!): GeneralReport!
    getPatientAppointments(patientId: ID!): [Appointment!]!
  }

  type Mutation {
    generateAgenda(doctorId: ID!, startDate: String!, endDate: String!): [Agenda!]!
    addTimeSlot(agendaId: ID!, timeSlot: TimeSlotInput!): Agenda!
    removeTimeSlot(agendaId: ID!, timeSlot: TimeSlotInput!): Agenda!
    updateAgendaDate(agendaId: ID!, timeSlots: [TimeSlotInput!]!): Agenda!
    bookTimeSlot(input: BookTimeSlotInput!): Agenda!
    cancelTimeSlot(input: CancelTimeSlotInput!): Agenda!
    markPatientAttended(input: MarkAttendedInput!): Agenda!
  }
`;

module.exports = agendaSchema;