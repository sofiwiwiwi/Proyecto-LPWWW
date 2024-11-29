import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useAuth } from "../authContext";

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Paciente"); 
  const [specialty, setSpecialty] = useState(""); 
  const { login } = useAuth();

  const [registerMutation, { loading, error }] = useMutation(REGISTER_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const input = {
      name,
      email,
      password,
      role,
    };

    if (role === "Médico") {
      input.specialty = specialty; 
    }

    console.log("Variables being sent:", input); 

    try {
      const { data } = await registerMutation({
        variables: { input },
      });
      login(data.register.token, data.register.user);
      alert(`Registro exitoso. Bienvenido, ${data.register.user.name}`);
      setName("");
      setEmail("");
      setPassword("");
      setRole("Paciente");
      setSpecialty("");
    } catch (err) {
      console.error("Error al registrarse:", err);
      alert(`Error al registrarse: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre:
          <input
            type="text"
            placeholder="Introduce tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Correo Electrónico:
          <input
            type="email"
            placeholder="Introduce tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Contraseña:
          <input
            type="password"
            placeholder="Introduce tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Rol:
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="Paciente">Paciente</option>
            <option value="Médico">Médico</option>
          </select>
        </label>
        {role === "Médico" && ( 
          <label>
            Especialidad:
            <input
              type="text"
              placeholder="Introduce tu especialidad"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              required
            />
          </label>
        )}
        <button type="submit" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
    </div>
  );
};

export default Register;