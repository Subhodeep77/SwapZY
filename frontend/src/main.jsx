// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css"; 
import { AuthProvider } from "./context/auth.context"; // 👈 import your AuthProvider
import { CategoryProvider } from "./context/category.context";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <CategoryProvider>
        <AuthProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AuthProvider>
      </CategoryProvider>
    </HelmetProvider>
  </React.StrictMode>
);
