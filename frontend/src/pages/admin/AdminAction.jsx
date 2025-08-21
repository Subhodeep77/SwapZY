import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import Loader from "../../components/Loader";
import PageHelmet from "../../components/PageHelmet";
import authService from "../../services/authService";
import API from "../../utils/axios";
import mascotImg from "../../assets/swapzy_mascot.png";

const AdminActions = () => {
  const [actions, setActions] = useState([]);
  const [adminMap, setAdminMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [adminMapError, setAdminMapError] = useState(false);

  const [page, setPage] = useState(1);
  const [actionType, setActionType] = useState("ALL");
  const [selectedAdminId, setSelectedAdminId] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [newAction, setNewAction] = useState({
    adminAppwriteId: "",
    actionType: "DELETE",
    description: "",
    affectedId: "",
  });

  const limit = 50;

  const fetchActions = useCallback(async () => {
    setLoading(true);
    try {
      const jwt = await authService.getJWT();
      const { data } = await API.get(
        `/api/admin/admin-actions?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      setActions(data.actions || []);
    } catch (error) {
      console.error("Error fetching admin actions:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchAdminMap = useCallback(async () => {
    try {
      const jwt = await authService.getJWT();
      const res = await API.get(`/api/admin/admins/map`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.data.success) {
        setAdminMap(res.data.adminMap || {});
        setAdminMapError(false);
      } else {
        setAdminMapError(true);
      }
    } catch (error) {
      console.error("Error fetching admin map:", error);
      setAdminMapError(true);
    }
  }, []);

  useEffect(() => {
    fetchAdminMap();
  }, [fetchAdminMap]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [actionType, selectedAdminId, dateFrom, dateTo]);

  const filteredActions = actions.filter((action) => {
    const timestamp = new Date(action.createdAt || action.timestamp);
    const matchType = actionType === "ALL" || action.actionType === actionType;
    const matchAdmin =
      selectedAdminId === "ALL" || action.adminAppwriteId === selectedAdminId;
    const matchFrom = !dateFrom || timestamp >= new Date(dateFrom);
    const matchTo = !dateTo || timestamp <= new Date(dateTo);
    return matchType && matchAdmin && matchFrom && matchTo;
  });

  const handleNewActionSubmit = async (e) => {
    e.preventDefault();
    try {
      const jwt = await authService.getJWT();
      await API.post("/api/admin/admin-actions/create", newAction, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setShowForm(false);
      setNewAction({
        adminAppwriteId: "",
        actionType: "DELETE",
        description: "",
        affectedId: "",
      });
      setPage(1);
      fetchActions();
    } catch (err) {
      console.error("Failed to log action:", err);
    }
  };

  return (
    <>
      <PageHelmet
        title="Admin Logs"
        description="Monitor all recent admin actions in real time on SwapZY Admin Dashboard."
      />

      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          📝 Admin Actions
        </h1>

        {/* Toggle Form */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {showForm ? "Cancel" : "Log New Action"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleNewActionSubmit}
            className="bg-white p-4 rounded-lg shadow mb-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Admin
              </label>
              <select
                required
                value={newAction.adminAppwriteId}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    adminAppwriteId: e.target.value,
                  })
                }
                className="w-full mt-1 px-3 py-2 border rounded"
              >
                <option value="">Select Admin</option>
                {Object.entries(adminMap).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              {adminMapError && (
                <p className="text-sm text-red-500 mt-1">
                  ⚠️ Failed to load admin list.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Action Type
              </label>
              <select
                required
                value={newAction.actionType}
                onChange={(e) =>
                  setNewAction({ ...newAction, actionType: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded"
              >
                <option value="DELETE">Delete</option>
                <option value="RESTORE">Restore</option>
                <option value="REFUND">Refund</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Affected ID
              </label>
              <input
                type="text"
                required
                value={newAction.affectedId}
                onChange={(e) =>
                  setNewAction({ ...newAction, affectedId: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={newAction.description}
                onChange={(e) =>
                  setNewAction({ ...newAction, description: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border rounded"
              />
            </div>

            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Submit Action
            </button>
          </form>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="px-3 py-2 border rounded bg-white"
          >
            <option value="ALL">All Actions</option>
            <option value="DELETE">Delete</option>
            <option value="RESTORE">Restore</option>
            <option value="REFUND">Refund</option>
          </select>

          <select
            value={selectedAdminId}
            onChange={(e) => setSelectedAdminId(e.target.value)}
            className="px-3 py-2 border rounded bg-white"
          >
            <option value="ALL">All Admins</option>
            {Object.entries(adminMap).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          <label className="text-sm text-gray-600">
            From:{" "}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="ml-1 px-2 py-1 border rounded"
            />
          </label>
          <label className="text-sm text-gray-600">
            To:{" "}
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="ml-1 px-2 py-1 border rounded"
            />
          </label>
        </div>

        {/* Table */}
        {loading ? (
          <Loader />
        ) : filteredActions.length === 0 ? (
          <div className="text-center py-16">
            <img
              src={mascotImg}
              alt="No logs"
              className="w-40 mx-auto mb-4 rounded-xl"
            />
            <p className="text-gray-500 text-lg">No admin actions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-sm bg-white">
            <table className="min-w-full text-sm text-left border border-gray-200">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Affected ID</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredActions.map((action, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 font-medium text-gray-800">
                      {action.actionType}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <div className="text-blue-600 font-medium">
                        {adminMap[action.adminAppwriteId]?.name ||
                          "Unknown Admin"}
                      </div>
                      {adminMap[action.adminAppwriteId]?.email && (
                        <div className="text-gray-500 text-xs">
                          {adminMap[action.adminAppwriteId].email}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {action.description || "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {action.affectedId}
                    </td>
                    <td className="px-4 py-2 text-gray-400">
                      {formatDistanceToNow(
                        new Date(action.createdAt || action.timestamp),
                        { addSuffix: true }
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminActions;
