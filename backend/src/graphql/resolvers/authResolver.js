const User = require('../../models/User');
const Doctor = require('../../models/Doctor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authResolver = {
  Query: {
    currentUser: async (_, __, { user }) => {
      if (!user) throw new Error("No autenticado.");
      return user;
    },
  },
  Mutation: {
    register: async (_, { input }) => {
      const { name, email, password, role, specialty } = input;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("El correo electrónico ya está registrado.");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        name,
        email,
        password: hashedPassword,
        role,
      });
      await user.save();

      if (role === "Médico") {
        if (!specialty) {
          throw new Error("La especialidad es obligatoria para un médico.");
        }
        const doctor = new Doctor({
          name,
          specialty,
          user: user._id,
        });
        await doctor.save();
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return { token, user };
    },
    login: async (_, { input }) => {
      const { email, password } = input;
    
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("Usuario no encontrado.");
      }
    
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Contraseña incorrecta.");
      }
    
      const token = jwt.sign(
        { id: user.id, role: user.role }, 
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
    
      return { token, user };
    },
  },
};
module.exports = authResolver;