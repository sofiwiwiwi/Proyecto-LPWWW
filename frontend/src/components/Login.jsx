import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useAuth } from "../authContext";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [loginMutation, { loading, error }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginMutation({
        variables: { input: { email, password } },
      });
      login(data.login.token, data.login.user);
      alert(`Bienvenido, ${data.login.user.name}`);
    } catch (err) {
      alert(`Error al iniciar sesión: ${err.message}`);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Row className="w-100">
        <Col xs={12} md={6} lg={4} className="mx-auto">
          <div className="text-center mb-4">
            <h2>Iniciar Sesión</h2>
          </div>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formEmail">
              <Form.Label>Correo Electrónico:</Form.Label>
              <Form.Control
                type="email"
                placeholder="Introduce tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formPassword">
              <Form.Label>Contraseña:</Form.Label>
              <Form.Control
                type="password"
                placeholder="Introduce tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" block disabled={loading}>
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </Button>
          </Form>

          {error && <Alert variant="danger" className="mt-3">Error: {error.message}</Alert>}
        </Col>
      </Row>
    </Container>
  );
};

export default Login;