const Agenda = require('../../models/Agenda');
const Calendar = require('../../models/Calendar');
const Doctor = require('../../models/Doctor');

const COMMISSION_PERCENTAGE = 30;

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
      const today = new Date().setHours(0, 0, 0, 0);

      const agendas = await Agenda.find({
        doctorId,
        date: { $lte: today },
      });

      const waitingPatients = [];

      for (const agenda of agendas) {
        for (const slot of agenda.timeSlots) {
          if (slot.isReserved && slot.patientId) {
            const patient = await User.findById(slot.patientId);
            if (patient) {
              waitingPatients.push({
                patientId: patient.id,
                patientName: patient.name,
                startTime: slot.startTime,
                endTime: slot.endTime,
              });
            }
          }
        }
      }

      return waitingPatients;
    },
    getRevenueReport: async (_, { startDate, endDate, doctorId }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const query = {
        date: { $gte: start, $lte: end },
      };
      if (doctorId) query.doctorId = doctorId;

      const agendas = await Agenda.find(query);

      const report = {};
      for (const agenda of agendas) {
        const doctor = await Doctor.findById(agenda.doctorId);
        if (!doctor) continue;

        if (!report[doctor.id]) {
          report[doctor.id] = {
            doctorId: doctor.id,
            doctorName: doctor.name,
            totalPatients: 0,
            totalRevenue: 0,
          };
        }

        for (const slot of agenda.timeSlots) {
          if (slot.isAttended) {
            report[doctor.id].totalPatients += 1;
            report[doctor.id].totalRevenue += 50; // Replace 50 with actual fee logic
          }
        }
      }

      return Object.values(report);
    },
    getCommissionStatement: async (_, { startDate, endDate, doctorId }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const query = {
        date: { $gte: start, $lte: end },
      };
      if (doctorId) query.doctorId = doctorId;

      const agendas = await Agenda.find(query);
      const report = {};
      for (const agenda of agendas) {
        const doctor = await Doctor.findById(agenda.doctorId);
        if (!doctor) continue;

        if (!report[doctor.id]) {
          report[doctor.id] = {
            doctorId: doctor.id,
            doctorName: doctor.name,
            totalRevenue: 0,
          };
        }

        for (const slot of agenda.timeSlots) {
          if (slot.isAttended) {
            report[doctor.id].totalRevenue += 50;
          }
        }
      }

      const statements = Object.values(report).map((entry) => ({
        doctorId: entry.doctorId,
        doctorName: entry.doctorName,
        totalRevenue: entry.totalRevenue,
        commissionPercentage: COMMISSION_PERCENTAGE,
        commissionAmount: (entry.totalRevenue * COMMISSION_PERCENTAGE) / 100,
      }));

      return statements;
    },
    getGeneralReport: async (_, { startDate, endDate }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const agendas = await Agenda.find({
        date: { $gte: start, $lte: end },
      });

      let totalRevenue = 0;
      let totalPatients = 0;
      const doctorReports = {};

      for (const agenda of agendas) {
        const doctor = await Doctor.findById(agenda.doctorId);
        if (!doctor) continue;

        if (!doctorReports[doctor.id]) {
          doctorReports[doctor.id] = {
            doctorId: doctor.id,
            doctorName: doctor.name,
            totalPatients: 0,
            totalRevenue: 0,
          };
        }

        for (const slot of agenda.timeSlots) {
          if (slot.isAttended) {
            const revenue = 50;
            totalRevenue += revenue;
            totalPatients += 1;

            doctorReports[doctor.id].totalPatients += 1;
            doctorReports[doctor.id].totalRevenue += revenue;
          }
        }
      }

      return {
        totalRevenue,
        totalPatients,
        doctorReports: Object.values(doctorReports),
      };
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

      const agenda = await Agenda.findOne({
        doctorId,
        date: new Date(date),
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
    cancelTimeSlot: async (_, { input }, { user }) => {
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

      if (user.role === "Paciente" && slot.patientId.toString() !== user.id) {
        throw new Error("No autorizado para cancelar este horario.");
      }

      slot.isReserved = false;
      slot.patientId = null;

      await agenda.save();
      return agenda;
    },
    markPatientAttended: async (_, { input }, { user }) => {
      if (!user || user.role !== "Médico") {
        throw new Error("No autorizado.");
      }

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