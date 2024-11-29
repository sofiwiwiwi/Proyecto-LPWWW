const { gql } = require('apollo-server-express');

const doctorSchema = gql`
  type Availability {
    day: String!
    startTime: String!
    endTime: String!
  }

  type Doctor {
    id: ID!
    name: String!
    specialty: String!
    availability: [Availability!]!
    payments: [Payment!]!
  }
  
  type Payment {
    paymentDate: String!
    amountPaid: Float!
    paymentMethod: String!
    reference: String
    }

  input AvailabilityInput {
    day: String!
    startTime: String!
    endTime: String!
  }

  input DoctorInput {
    name: String!
    specialty: String!
  }

  input PaymentInput {
    doctorId: ID!
    amountPaid: Float!
    paymentMethod: String!
    reference: String
  }

  type Query {
    getDoctors: [Doctor!]!
    getDoctor(id: ID!): Doctor
    getDoctorPayments(doctorId: ID!): [Payment!]!
    getDoctorByUserId(userId: ID!): Doctor
  }

  type Mutation {
    createDoctor(input: DoctorInput!): Doctor!
    addAvailability(doctorId: ID!, availability: [AvailabilityInput!]!): Doctor!
    registerPayment(input: PaymentInput!): Doctor!
    getDoctorPayments(doctorId: ID!): [Payment!]!
  }
`;

module.exports = doctorSchema;