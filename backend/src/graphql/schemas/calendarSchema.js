const { gql } = require('apollo-server-express');

const calendarSchema = gql`
  type Calendar {
    id: ID!
    date: String!
    isHoliday: Boolean!
    description: String
  }

  input HolidayInput {
    date: String!
    description: String
  }

  type Query {
    getCalendar(startDate: String!, endDate: String!): [Calendar!]!
  }

  type Mutation {
    generateBaseCalendar(startDate: String!, endDate: String!): [Calendar!]!
    addHoliday(input: HolidayInput!): Calendar!
  }
`;

module.exports = calendarSchema;