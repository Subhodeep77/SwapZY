import { useEffect, useState } from "react";
import API from "../../utils/axios";
import { formatDistanceToNow } from "date-fns";
import PageHelmet from "../../components/PageHelmet";
import Loader from "../../components/Loader";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/api/admin/notifications");
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.patch(`/api/admin/notifications/${id}`);
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
        return `${base} bg-red-100 text-red-800`;
      case "WARNING":
        return `${base} bg-yellow-100 text-yellow-800`;
      default:
        return `${base} bg-blue-100 text-blue-800`;
    }
  };

  return (
    <>
      <PageHelmet
        title="Admin Notifications"
        description="View all admin alerts and flagged items in SwapZY."
      />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔔 Admin Notifications</h1>
        {loading ? (
          <Loader />
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-600 mt-16">
            <p className="text-xl">No notifications yet.</p>
            <p className="text-sm text-gray-400">You're all caught up!</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`p-4 border rounded-xl shadow-sm flex justify-between items-start transition ${
                  notification.read ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="flex flex-col gap-2">
                  {/* Badge and time in one row */}
                  <div className="flex items-center gap-2">
                    <span className={getTypeBadge(notification.type)}>
                      {notification.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(
                        new Date(notification.createdAt),
                        { addSuffix: true }
                      )}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-gray-800">{notification.message}</p>
                </div>

                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification._id)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Mark as Read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default AdminNotifications;
