// src/admin/routes.jsx

import AdminDashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import AdminActions from "./pages/AdminActions";
import AuditLogs from "./pages/AuditLogs";
import Notifications from "./pages/Notifications";
import UserActivityLogs from "./pages/UserActivityLogs";
import ProductViews from "./pages/ProductViews";

// Add more pages as you implement them

export const adminRoutes = [
  {
    path: "", // renders at /admin
    element: <AdminDashboard />,
    label: "Dashboard",
  },
  {
    path: "users", // /admin/users
    element: <UserManagement />,
    label: "Users",
  },
  {
    path: "admin-actions",
    element: <AdminActions />,
    label: "Admin Actions",
  },
  {
    path: "audit-logs",
    element: <AuditLogs />,
    label: "Audit Logs",
  },
  {
    path: "notifications",
    element: <Notifications />,
    label: "Notifications",
  },
  {
    path: "user-activities",
    element: <UserActivityLogs />,
    label: "User Activities",
  },
  {
    path: "product-views/:productId",
    element: <ProductViews />,
    label: "Product Views (Dynamic)",
    hidden: true, // not shown in sidebar
  },
];
