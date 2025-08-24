import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import UserProfileForm from "../components/UserProfileForm";
import AuthGate from "../components/AuthGate";
import AdminDashboard from "../pages/admin/Dashboard";
import ProductViewLogsPage from "../pages/admin/ProductViewLogs";
import AdminNotifications from "../pages/admin/Notifications";
import AuditLogs from "../pages/admin/AuditLog";
import AdminActions from "../pages/admin/AdminAction";
import AdminUserActivityLogsPage from "../pages/admin/UserActivityLogs";
import AdminUserManagementPage from "../pages/admin/UserManagement";
import AdminLoginLogs from "../pages/admin/AdminLoginLogs";
import HomeFeed from "../pages/product/HomeFeed";
import NotFound from "../components/404";
import TestApi from "../pages/TestApi";
import TestSocket from "../pages/TestSocket";
import Unauthorized from "../pages/Unauthorized";
import UserProfile from "../pages/admin/UserProfile";
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/init" element={<UserProfileForm />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/dashboard"
          element={
            <AuthGate  roles={["ADMIN","USER"]}>
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
        <Route
          path="/admin/audit-logs"
          element={
            <AuthGate roles={["ADMIN"]}>
              <AuditLogs />
            </AuthGate>
          }
        />
        <Route
          path="/admin/admin-actions"
          element={
            <AuthGate roles={["ADMIN"]}>
              <AdminActions />
            </AuthGate>
          }
        />
        <Route
          path="/admin/user-activities"
          element={
            <AuthGate roles={["ADMIN"]}>
              <AdminUserActivityLogsPage />
            </AuthGate>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AuthGate roles={["ADMIN"]}>
              <AdminUserManagementPage />
            </AuthGate>
          }
        />
        <Route
          path="/admin/user-profile/:appwriteId"
          element={
            <AuthGate roles={["ADMIN"]}>
              <UserProfile />
            </AuthGate>
          }
        />
        <Route
          path="/admin/admin-login-log"
          element={
            <AuthGate roles={["ADMIN"]}>
              <AdminLoginLogs />
            </AuthGate>
          }
        />
        <Route path="/products" element={<HomeFeed />} />
        <Route path="/test-api" element={<TestApi />} />
        <Route path="/test-socket" element={<TestSocket />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
