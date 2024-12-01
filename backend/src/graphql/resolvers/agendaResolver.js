const Agenda = require('../../models/Agenda');
const Calendar = require('../../models/Calendar');
const Doctor = require('../../models/Doctor');
const User = require("../../models/User"); 

const COMMISSION_PERCENTAGE = 30;

const convertToValidDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid Date: ${dateString}`);
  }
  return date;
};

const agendaResolver = {
  Query: {
    getAgenda: async (_, { doctorId, startDate, endDate }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);

      return await Agenda.find({
        doctorId,
        date: { $gte: start, $lte: end },
      }).sort({ date: 1 });
    },
    getWaitingPatients: async (_, { doctorId }) => {
      const agendas = await Agenda.find({ doctorId }); 

      const waitingPatients = [];

      for (const agenda of agendas) {
        for (const slot of agenda.timeSlots) {
          if (slot.isReserved && slot.patientId && !slot.isAttended) {
            const patient = await User.findById(slot.patientId); 
            if (patient) {
              waitingPatients.push({
                patientId: patient.id,
                patientName: patient.name,
                startTime: slot.startTime,
                endTime: slot.endTime,
                date: agenda.date,
              });
            }
          }
        }
      }

      return waitingPatients;
    },
    getRevenueReport: async (_, { startDate, endDate }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
    
      const doctors = await Doctor.find();
    
      const report = doctors.map((doctor) => {

        const payments = doctor.payments.filter(
          (payment) => payment.paymentDate >= start && payment.paymentDate <= end
        );
    

        const totalRevenue = payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
        const totalPatients = payments.length;
    
        return {
          doctorId: doctor._id,
          doctorName: doctor.name,
          totalPatients,
          totalRevenue,
        };
      });
    
      return report;
    },
    getCommissionStatement: async (_, { startDate, endDate, doctorId }) => {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
    
        const doctor = await Doctor.findById(doctorId).populate('payments');
    
        if (!doctor) {
          throw new Error('Doctor not found');
        }

        const relevantPayments = doctor.payments.filter((payment) => {
          const paymentDate = new Date(payment.paymentDate);
          return paymentDate >= start && paymentDate <= end;
        });
    
        const totalRevenue = relevantPayments.reduce((sum, payment) => sum + payment.amountPaid, 0);
        const commissionPercentage = 30; // Assuming a 30% commission rate
        const commissionAmount = (totalRevenue * commissionPercentage) / 100;
    
        return [
          {
            doctorId: doctor.id,
            doctorName: doctor.name,
            totalRevenue,
            commissionPercentage,
            commissionAmount,
          },
        ];
      } catch (error) {
        console.error('Error fetching commission statement:', error);
        throw new Error('Could not fetch commission statement');
      }
    },
    getGeneralReport: async (_, { startDate, endDate }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const doctors = await Doctor.find();

      let totalRevenue = 0;
      let totalPatients = 0;

      const doctorReports = doctors.map((doctor) => {
        const payments = doctor.payments.filter(
          (payment) => payment.paymentDate >= start && payment.paymentDate <= end
        );

        const doctorTotalRevenue = payments.reduce(
          (sum, payment) => sum + payment.amountPaid,
          0
        );
        const doctorTotalPatients = payments.length;

        totalRevenue += doctorTotalRevenue;
        totalPatients += doctorTotalPatients;

        return {
          doctorId: doctor._id,
          doctorName: doctor.name,
          totalPatients: doctorTotalPatients,
          totalRevenue: doctorTotalRevenue,
        };
      });

      return {
        totalRevenue,
        totalPatients,
        doctorReports,
      };
    },
    getPatientAppointments: async (_, { patientId }) => {
      const agendas = await Agenda.find({"timeSlots.patientId": patientId, });
      const appointments = [];

      for (const agenda of agendas) {
        const doctor = await Doctor.findById(agenda.doctorId);
        const reservedSlots = agenda.timeSlots.filter(
          (slot) => 
            slot.patientId && 
            slot.patientId.toString() === patientId &&
            !slot.isAttended
        );
        for (const slot of reservedSlots) {
          appointments.push({
            date: agenda.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            doctorId: agenda.doctorId,
            doctorName: doctor.name,
          });
        }
      }
      return appointments;
    },
  },
  Mutation: {
    generateAgenda: async (_, { doctorId, startDate, endDate }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const doctor = await Doctor.findById(doctorId);
      if (!doctor) throw new Error("El médico no fue encontrado.");

      const calendar = await Calendar.find({
        date: { $gte: start, $lte: end },
        isHoliday: false,
      }).sort({ date: 1 });

      const newAgendas = [];

      for (const day of calendar) {
        const availability = doctor.availability.find(
          (slot) => slot.day === ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][day.date.getDay()]
        );

        if (availability) {
          const timeSlots = [];
          let startTime = availability.startTime;

          while (startTime < availability.endTime) {
            const endTime = new Date(`1970-01-01T${startTime}:00Z`);
            endTime.setMinutes(endTime.getMinutes() + 30); // 30-minute slots
            const formattedEndTime = endTime.toISOString().substring(11, 16);

            timeSlots.push({
              startTime,
              endTime: formattedEndTime,
              isReserved: false,
            });

            startTime = formattedEndTime;
          }

          const agenda = new Agenda({
            doctorId,
            date: day.date,
            timeSlots,
          });

          await agenda.save();
          newAgendas.push(agenda);
        }
      }

      return newAgendas;
    },
    addTimeSlot: async (_, { agendaId, timeSlot }) => {
      const agenda = await Agenda.findById(agendaId);
      if (!agenda) throw new Error("Agenda no encontrada.");

      const exists = agenda.timeSlots.some(
        (slot) =>
          slot.startTime === timeSlot.startTime && slot.endTime === timeSlot.endTime
      );
      if (exists) throw new Error("El horario ya existe en esta agenda.");

      agenda.timeSlots.push(timeSlot);
      await agenda.save();

      return agenda;
    },
    removeTimeSlot: async (_, { agendaId, timeSlot }) => {
      const agenda = await Agenda.findById(agendaId);
      if (!agenda) throw new Error("Agenda no encontrada.");

      agenda.timeSlots = agenda.timeSlots.filter(
        (slot) =>
          slot.startTime !== timeSlot.startTime || slot.endTime !== timeSlot.endTime
      );
      await agenda.save();

      return agenda;
    },
    updateAgendaDate: async (_, { agendaId, timeSlots }) => {
      const agenda = await Agenda.findById(agendaId);
      if (!agenda) throw new Error("Agenda no encontrada.");

      agenda.timeSlots = timeSlots.map((slot) => ({
        ...slot,
        isReserved: false,
        patientId: null,
      }));
      await agenda.save();

      return agenda;
    },
    bookTimeSlot: async (_, { input }, { user }) => {
      if (!user || user.role !== "Paciente") {
        throw new Error("No autorizado.");
      }
    
      const { doctorId, date, startTime, endTime } = input;
    
      const validDate = convertToValidDate(date);
    
      const agenda = await Agenda.findOne({
        doctorId,
        date: validDate,
      });
      if (!agenda) throw new Error("Agenda no encontrada para la fecha especificada.");
    
      const slot = agenda.timeSlots.find(
        (timeSlot) =>
          timeSlot.startTime === startTime &&
          timeSlot.endTime === endTime &&
          !timeSlot.isReserved
      );
    
      if (!slot) throw new Error("El horario no está disponible o ya está reservado.");
    
      slot.isReserved = true;
      slot.patientId = user.id;
    
      await agenda.save();
      return agenda;
    },
    cancelTimeSlot: async (_, { input }) => {
      const { doctorId, date, startTime, endTime } = input;

      const agenda = await Agenda.findOne({
        doctorId,
        date: new Date(date),
      });
      if (!agenda) throw new Error("Agenda no encontrada para la fecha especificada.");

      const slot = agenda.timeSlots.find(
        (timeSlot) =>
          timeSlot.startTime === startTime &&
          timeSlot.endTime === endTime &&
          timeSlot.isReserved
      );
      if (!slot) throw new Error("El horario no está reservado.");

      // if (user.role === "Paciente" && slot.patientId.toString() !== user.id) {
      //   throw new Error("No autorizado para cancelar este horario.");
      // }

      slot.isReserved = false;
      slot.patientId = null;

      await agenda.save();
      return agenda;
    },
    markPatientAttended: async (_, { input }) => {
      const { doctorId, date, startTime, endTime } = input;

      const agenda = await Agenda.findOne({
        doctorId,
        date: new Date(date),
      });
      if (!agenda) throw new Error("Agenda no encontrada para la fecha especificada.");

      const slot = agenda.timeSlots.find(
        (timeSlot) =>
          timeSlot.startTime === startTime &&
          timeSlot.endTime === endTime &&
          timeSlot.isReserved
      );

      if (!slot) throw new Error("El horario no está reservado o no existe.");

      slot.isAttended = true;

      await agenda.save();
      return agenda;
    },
  },
};

module.exports = agendaResolver;