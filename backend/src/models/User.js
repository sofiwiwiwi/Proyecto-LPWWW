const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre es obligatorio."],
  },
  email: {
    type: String,
    required: [true, "El correo electrónico es obligatorio."],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Por favor, ingrese un correo electrónico válido.",
    ],
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria."],
    minlength: [6, "La contraseña debe tener al menos 6 caracteres."],
  },
  role: {
    type: String,
    enum: ["Secretaria", "Médico", "Paciente"],
    required: [true, "El rol es obligatorio."],
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;