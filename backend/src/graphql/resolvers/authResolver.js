const User = require('../../models/User');
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
      const { name, email, password, role } = input;

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

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return { token, user };
    },
    login: async (_, { input }) => {
      const { email, password } = input;

      const user = await User.findOne({ email });
      if (!user) throw new Error("Usuario o contraseña incorrectos.");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Usuario o contraseña incorrectos.");

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return { token, user };
    },
  },
};

module.exports = authResolver;