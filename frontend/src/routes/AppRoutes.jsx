import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import UserProfileForm from "../components/UserProfileForm";
import AuthGate from "../components/AuthGate";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ProductViewLogsPage from "../pages/admin/ProductViewLogsPage"; // ✅
import AdminNotifications from "../pages/admin/Notifications";

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
        <Route
          path="/admin"
          element={
            <AuthGate roles={["ADMIN"]}>
              <AdminDashboard />
            </AuthGate>
          }
        />
        <Route
          path="/admin/product-views/:productId"
          element={
            <AuthGate roles={["ADMIN"]}>
              <ProductViewLogsPage />
            </AuthGate>
          }
        />
         <Route
          path="/admin/notifications"
          element={
            <AuthGate roles={["ADMIN"]}>
              <AdminNotifications />
            </AuthGate>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
