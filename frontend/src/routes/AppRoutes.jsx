import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import UserProfileForm from "../components/UserProfileForm";
import AuthGate from "../components/AuthGate"; // ✅ Import it

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/init" element={<UserProfileForm />} />
        <Route
          path="/dashboard"
          element={
            <AuthGate>
              <Dashboard />
            </AuthGate>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
