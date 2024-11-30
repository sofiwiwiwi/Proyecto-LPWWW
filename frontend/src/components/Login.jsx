import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  // Importa el hook useNavigate
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { useAuth } from "../authContext";  // Asumiendo que tienes este hook para manejar el login
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();  // Usamos el hook useNavigate para la redirección

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null); // Limpiamos el error anterior

    try {
      // Lógica para manejar el login
      // Suponiendo que tienes una función `login` que autentica al usuario
      const user = await login(email, password);

      alert(`Bienvenido, ${user.name}`);
      // Si el login es exitoso, redirige a la página principal (ajustar ruta según sea necesario)
      navigate("/dashboard");  // O a la página a la que desees redirigir
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Row className="w-100">
        <Col xs={12} md={6} lg={4} className="mx-auto">
          <div className="login-container">
            <div className="text-center mb-4">
              <h2>Iniciar Sesión</h2>
            </div>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formEmail">
                <Form.Label className="form-label">Correo Electrónico:</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Introduce tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-control"
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
                  className="form-control"
                />
              </Form.Group>

              <Button variant="primary" type="submit" block disabled={loading} className="mt-3">
                {loading ? "Cargando..." : "Iniciar Sesión"}
              </Button>
            </Form>

            {error && <Alert variant="danger" className="mt-3 alert-danger">Error: {error}</Alert>}

            {/* Botón para redirigir al registro */}
            <div className="text-center mt-3">
              <Button variant="link" onClick={() => navigate("/register")}>
                ¿No tienes una cuenta? Regístrate aquí
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;


