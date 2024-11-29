import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ApolloProviderWrapper from "./apolloClient";
import { AuthProvider } from "./authContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProviderWrapper>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ApolloProviderWrapper>
);