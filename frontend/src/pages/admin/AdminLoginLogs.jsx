import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import PageHelmet from "../../components/PageHelmet";
import Loader from "../../components/Loader";
import API from "../../utils/axios";
import authService from "../../services/authService";

const getAuthHeaders = async () => {
  const token = await authService.getJWT();
  return { Authorization: `Bearer ${token}` };
};

const AdminLoginLogs = () => {
  const [logs, setLogs] = useState([]);
  const [adminMap, setAdminMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch login logs
  const fetchLoginLogs = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      setLoading(true);
      const res = await API.get(
        `/api/admin/admin-login-log?page=${page}&limit=10`,
        { headers }
      );
      setLogs(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch admin login logs:", error.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Fetch admin ID → details map
  const fetchAdminMap = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await API.get("/api/admin/admins/map", { headers });
      const admins = res.data.admins || [];

      const map = {};
      admins.forEach((admin) => {
        map[admin.appwriteId] = admin;
      });

      setAdminMap(map);
    } catch (err) {
      console.error("Failed to fetch admin name map:", err.message);
    }
  }, []);

  const handleManualLog = async (type) => {
    try {
      const headers = await getAuthHeaders();
      setPosting(true);
      const endpoint =
        type === "login"
          ? "/api/admin/admin-login-log/log"
          : "/api/admin/admin-login-log/log-logout";
      await API.post(endpoint, {}, { headers });
      await fetchLoginLogs();
    } catch (error) {
      console.error(`Failed to log admin ${type}:`, error.message);
    } finally {
      setPosting(false);
    }
  };

  useEffect(() => {
    fetchAdminMap();
    fetchLoginLogs();
  }, [fetchAdminMap, fetchLoginLogs]);

  return (
    <div className="p-6 dark:bg-gray-900 min-h-screen">
      <PageHelmet title="Admin Login Logs" />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold dark:text-white">
          🧾 Admin Login Logs
        </h1>
        <div className="space-x-3">
          <button
            onClick={() => handleManualLog("login")}
            disabled={posting || loading}
            className="bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            Log Login
          </button>
          <button
            onClick={() => handleManualLog("logout")}
            disabled={posting || loading}
            className="bg-red-500 text-white px-4 py-2 text-sm rounded-md hover:bg-red-600 transition disabled:opacity-50"
          >
            Log Logout
          </button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : logs.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
          No login/logout records found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-lg shadow-sm dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {["#", "Admin", "Action", "Description", "Status", "Email Verified", "Timestamp"].map((head) => (
                    <th
                      key={head}
                      className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {logs.map((log, idx) => {
                  const adminData = adminMap[log.adminAppwriteId];
                  return (
                    <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                        {(page - 1) * 10 + idx + 1}
                      </td>
                      <td className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400">
                        {adminData
                          ? `${adminData.name}${adminData.email ? ` (${adminData.email})` : ""}`
                          : log.adminAppwriteId}
                      </td>
                      <td className="px-4 py-2 text-sm dark:text-gray-300">{log.actionType}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                        {log.description}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-2 text-sm">
                        {adminData ? (
                          adminData.status ? (
                            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs font-medium">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs font-medium">
                              Inactive
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600">—</span>
                        )}
                      </td>

                      {/* Email Verification Badge */}
                      <td className="px-4 py-2 text-sm">
                        {adminData ? (
                          adminData.emailVerification ? (
                            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium">
                              Verified
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 text-xs font-medium">
                              Not Verified
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600">—</span>
                        )}
                      </td>

                      <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(log.timestamp), "dd MMM yyyy, hh:mm a")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages || loading}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminLoginLogs;
