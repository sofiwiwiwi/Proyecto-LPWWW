const Doctor = require('../../models/Doctor');

const doctorResolver = {
  Query: {
    getDoctors: async () => {
      return await Doctor.find();
    },
    getDoctor: async (_, { id }) => {
      return await Doctor.findById(id);
    },
    getDoctorPayments: async (_, { doctorId }) => {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) throw new Error("El médico no fue encontrado.");
      return doctor.payments;
    },
      getDoctorByUserId: async (_, { userId }) => {
        const doctor = await Doctor.findOne({ user: userId }); // Find the doctor by userId
        if (!doctor) {
          throw new Error("No se encontró un médico asociado a este usuario.");
        }
        return doctor;
      },
  },
  Mutation: {
    createDoctor: async (_, { input }) => {
      const { name, specialty } = input;

      const doctor = new Doctor({
        name,
        specialty,
        availability: [],
      });

      await doctor.save();
      return doctor;
    },
    addAvailability: async (_, { doctorId, availability }) => {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        throw new Error("El médico no fue encontrado.");
      }

      doctor.availability.push(...availability);
      await doctor.save();

      return doctor;
    },
    registerPayment: async (_, { input }) => {
      const { doctorId, amountPaid, paymentMethod, reference } = input;

      const doctor = await Doctor.findById(doctorId);
      if (!doctor) throw new Error("El médico no fue encontrado.");

      const payment = {
        paymentDate: new Date(),
        amountPaid,
        paymentMethod,
        reference,
      };
      doctor.payments.push(payment);

      await doctor.save();
      return doctor;
    },
  },
};

module.exports = doctorResolver;