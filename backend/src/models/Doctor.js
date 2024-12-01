const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    required: [true, "El día es obligatorio."],
    enum: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
  },
  startTime: {
    type: String,
    required: [true, "La hora de inicio es obligatoria."],
  },
  endTime: {
    type: String,
    required: [true, "La hora de término es obligatoria."],
  },
});

const PaymentSchema = new mongoose.Schema({
  paymentDate: {
    type: Date,
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "Transfer", "Card", "Other", "Isapre", "FONASA"],
    required: true,
  },
  reference: {
    type: String,
    default: "",
  },
});

const DoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre del médico es obligatorio."],
  },
  specialty: {
    type: String,
    required: [true, "La especialidad es obligatoria."],
  },
  availability: [AvailabilitySchema],
  payments: {
    type: [PaymentSchema], 
    default: [],           
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", required: true 
  },
});

const Doctor = mongoose.model("Doctor", DoctorSchema);
module.exports = Doctor;