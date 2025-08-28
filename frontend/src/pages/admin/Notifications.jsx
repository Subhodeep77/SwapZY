import { useEffect, useState } from "react";
import API from "../../utils/axios";
import { formatDistanceToNow } from "date-fns";
import PageHelmet from "../../components/PageHelmet";
import Loader from "../../components/Loader";
import authService from "../../services/authService";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAuthHeaders = async () => {
    const token = await authService.getJWT();
    return { Authorization: `Bearer ${token}` };
  };

  const fetchNotifications = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await API.get("/api/admin/notifications", { headers });
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const headers = await getAuthHeaders();
      await API.patch(`/api/admin/notifications/${id}`, { headers });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getTypeBadge = (type) => {
    const base = "px-2 py-1 text-xs rounded-full font-semibold";
    switch (type) {
      case "CRITICAL":
        return `${base} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case "WARNING":
        return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      default:
        return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
    }
  };

  return (
    <>
      <PageHelmet
        title="Admin Notifications"
        description="View all admin alerts and flagged items in SwapZY."
      />

      <div
        className="min-h-screen p-6 dark:bg-gray-900"
        style={{
          background:
            "linear-gradient(90deg, rgba(42,123,155,1) 0%, rgba(87,199,133,1) 62%, rgba(237,221,83,1) 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            🔔 Admin Notifications
          </h1>
          {loading ? (
            <Loader />
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-300 mt-16">
              <p className="text-xl">No notifications yet.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                You're all caught up!
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li
                  key={notification._id}
                  className={`p-4 border rounded-xl shadow-sm flex justify-between items-start transition ${
                    notification.read
                      ? "bg-gray-50 dark:bg-gray-700"
                      : "bg-white dark:bg-gray-800"
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    {/* Badge and time */}
                    <div className="flex items-center gap-2">
                      <span className={getTypeBadge(notification.type)}>
                        {notification.type}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDistanceToNow(
                          new Date(notification.createdAt),
                          { addSuffix: true }
                        )}
                      </span>
                    </div>

                    {/* Message */}
                    <p className="text-gray-800 dark:text-gray-200">
                      {notification.message}
                    </p>
                  </div>

                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      Mark as Read
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminNotifications;
