import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { format } from "date-fns";
import PageHelmet from "../../components/PageHelmet";
import Loader from "../../components/Loader";

const AdminLoginLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

 const fetchLoginLogs = useCallback(async () => {
  try {
    setLoading(true);
    const res = await axios.get(`/api/admin/admin-login-log?page=${page}&limit=10`);
    setLogs(res.data.logs || []);
    setTotalPages(res.data.pagination?.totalPages || 1);
  } catch (error) {
    console.error("Failed to fetch admin login logs:", error.message);
  } finally {
    setLoading(false);
  }
}, [page]);

  const handleManualLog = async (type) => {
    try {
      setPosting(true);
      const endpoint =
        type === "login"
          ? "/api/admin/admin-login-log/log"
          : "/api/admin/admin-login-log/log-logout";
      await axios.post(endpoint);
      await fetchLoginLogs(); // Refresh logs
    } catch (error) {
      console.error(`Failed to log admin ${type}:`, error.message);
    } finally {
      setPosting(false);
    }
  };

  useEffect(() => {
    fetchLoginLogs();
  }, [fetchLoginLogs]);

  return (
    <div className="p-6">
      <PageHelmet title="Admin Login Logs" />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">🧾 Admin Login Logs</h1>
        <div className="space-x-3">
          <button
            onClick={() => handleManualLog("login")}
            disabled={posting}
            className="bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition"
          >
            Log Login
          </button>
          <button
            onClick={() => handleManualLog("logout")}
            disabled={posting}
            className="bg-red-500 text-white px-4 py-2 text-sm rounded-md hover:bg-red-600 transition"
          >
            Log Logout
          </button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : logs.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          No login/logout records found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">#</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Admin ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Action</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Timestamp</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {logs.map((log, idx) => (
                  <tr key={log._id}>
                    <td className="px-4 py-2 text-sm text-gray-700">{(page - 1) * 10 + idx + 1}</td>
                    <td className="px-4 py-2 text-sm text-blue-600">{log.adminAppwriteId}</td>
                    <td className="px-4 py-2 text-sm">{log.actionType}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{log.description}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {format(new Date(log.timestamp), "dd MMM yyyy, hh:mm a")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 mt-2">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
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
