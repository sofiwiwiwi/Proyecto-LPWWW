import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useAuth } from "../authContext";
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Register.css";  // Asegúrate de que el CSS se importe correctamente

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
  const navigate = useNavigate();  // Usamos el hook useNavigate para la redirección

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
      navigate("/login");  // Redirige al login después del registro exitoso
    } catch (err) {
      console.error("Error al registrarse:", err);
      alert(`Error al registrarse: ${err.message}`);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh", backgroundColor: "transparent" }}>
      <Row className="w-100">
        <Col xs={12} md={6} lg={4} className="mx-auto">
          <div className="register-container">
            <div className="text-center mb-4">
              <h2>Registro</h2>
            </div>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formName">
                <Form.Label className="form-label">Nombre:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Introduce tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formEmail">
                <Form.Label className="form-label">Correo Electrónico:</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Introduce tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formPassword">
                <Form.Label className="form-label">Contraseña:</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Introduce tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="formRole">
                <Form.Label className="form-label">Rol:</Form.Label>
                <Form.Control
                  as="select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="Paciente">Paciente</option>
                  <option value="Médico">Médico</option>
                  <option value="Secretaria">Secretaria</option>
                </Form.Control>
              </Form.Group>

              {role === "Médico" && (
                <Form.Group controlId="formSpecialty">
                  <Form.Label className="form-label">Especialidad:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Introduce tu especialidad"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    required
                  />
                </Form.Group>
              )}

              <Button variant="primary" type="submit" className="mt-3" block disabled={loading}>
                {loading ? "Registrando..." : "Registrarse"}
              </Button>
            </Form>

            {error && <Alert variant="danger" className="mt-3 alert-danger">Error: {error.message}</Alert>}

            <div className="text-center mt-3">
              <Button variant="link" style={{ fontSize: '1rem', color: 'white' }} onClick={() => navigate("/login")}>
                ¿Ya tienes cuenta? Inicia sesión aquí
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;

