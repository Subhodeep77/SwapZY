// src/App.jsx
import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes"; // 👈 your main route file
import authService from "./services/authService"; // 👈 import the service

function App() {
  useEffect(() => {
    // 🔐 Check login session & connect socket if logged in
    authService.getCurrentUser();
  }, []);

  return <AppRoutes />;
}

export default App;
