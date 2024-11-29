const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  isReserved: {
    type: Boolean,
    default: false,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  isAttended: {
    type: Boolean,
    default: false,
  },
});

const AgendaSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timeSlots: [TimeSlotSchema],
});

const Agenda = mongoose.model("Agenda", AgendaSchema);
module.exports = Agenda;