import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { format } from "date-fns";
import Loader from "../../components/Loader";
import PageHelmet from "../../components/PageHelmet";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [search, setSearch] = useState({ adminId: "", action: "" });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const [showForm, setShowForm] = useState(false);
  const [newLog, setNewLog] = useState({
    actorAppwriteId: "",
    actorRole: "ADMIN",
    action: "",
    targetCollection: "",
    targetId: "",
    metadata: "{}",
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/admin/audit-logs", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          actionType: search.action || undefined,
          performedBy: search.adminId || undefined,
        },
      });
      setLogs(data.logs || []);
      setPagination((prev) => ({ ...prev, total: data.total || 0 }));
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, search, fetchLogs]);

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearchChange = (e) => {
    setSearch((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePrev = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNext = () => {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    if (pagination.page < totalPages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handleCreateLog = async () => {
    // Validate fields
    if (!newLog.actorAppwriteId.trim()) {
      alert("❌ Actor Appwrite ID is required.");
      return;
    }
    if (!newLog.action.trim()) {
      alert("❌ Action is required.");
      return;
    }
    if (!newLog.targetCollection.trim()) {
      alert("❌ Target Collection is required.");
      return;
    }
    if (!newLog.targetId.trim()) {
      alert("❌ Target ID is required.");
      return;
    }

    let parsedMetadata;
    try {
      parsedMetadata = JSON.parse(newLog.metadata || "{}");
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("❌ Metadata must be valid JSON.");
      return;
    }

    try {
      const payload = {
        ...newLog,
        metadata: parsedMetadata,
      };

      await axios.post("/api/admin/audit-logs/create", payload);
      alert("✅ Audit log created successfully");

      setShowForm(false);
      setNewLog({
        actorAppwriteId: "",
        actorRole: "ADMIN",
        action: "",
        targetCollection: "",
        targetId: "",
        metadata: "{}",
      });

      fetchLogs();
    } catch (err) {
      console.error("Audit log creation failed:", err);
      alert("❌ Failed to create audit log");
    }
  };

  return (
    <>
      <PageHelmet
        title="Audit Logs"
        description="View all admin audit logs with filters and metadata"
      />

      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Audit Logs</h1>

        {/* Create Button */}
        <div className="mb-4">
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {showForm ? "Cancel" : "Create Audit Log"}
          </button>
        </div>

        {/* Create Log Form */}
        {showForm && (
          <div className="bg-gray-100 p-4 rounded mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="actorAppwriteId"
                placeholder="Actor Appwrite ID"
                value={newLog.actorAppwriteId}
                onChange={(e) => setNewLog({ ...newLog, actorAppwriteId: e.target.value })}
                className="border px-3 py-2 rounded w-full"
              />
              <select
                name="actorRole"
                value={newLog.actorRole}
                onChange={(e) => setNewLog({ ...newLog, actorRole: e.target.value })}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER</option>
              </select>
              <input
                type="text"
                name="action"
                placeholder="Action (e.g., USER_BANNED)"
                value={newLog.action}
                onChange={(e) => setNewLog({ ...newLog, action: e.target.value })}
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="text"
                name="targetCollection"
                placeholder="Target Collection"
                value={newLog.targetCollection}
                onChange={(e) => setNewLog({ ...newLog, targetCollection: e.target.value })}
                className="border px-3 py-2 rounded w-full"
              />
              <input
                type="text"
                name="targetId"
                placeholder="Target ID"
                value={newLog.targetId}
                onChange={(e) => setNewLog({ ...newLog, targetId: e.target.value })}
                className="border px-3 py-2 rounded w-full"
              />
              <textarea
                name="metadata"
                placeholder='Metadata (JSON format) — e.g., {"reason":"spam"}'
                value={newLog.metadata}
                onChange={(e) => setNewLog({ ...newLog, metadata: e.target.value })}
                className="border px-3 py-2 rounded w-full"
                rows={4}
              />
            </div>
            <button
              onClick={handleCreateLog}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit Log
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            name="adminId"
            value={search.adminId}
            onChange={handleSearchChange}
            placeholder="Filter by Admin ID"
            className="border rounded px-3 py-2 w-64"
          />
          <input
            type="text"
            name="action"
            value={search.action}
            onChange={handleSearchChange}
            placeholder="Filter by Action"
            className="border rounded px-3 py-2 w-64"
          />
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Admin ID</th>
                  <th className="px-4 py-2 border">Action</th>
                  <th className="px-4 py-2 border">Target</th>
                  <th className="px-4 py-2 border">Timestamp</th>
                  <th className="px-4 py-2 border">IP</th>
                  <th className="px-4 py-2 border">User Agent</th>
                  <th className="px-4 py-2 border">Meta</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="px-4 py-2 border">{log.actorAppwriteId}</td>
                    <td className="px-4 py-2 border">{log.action}</td>
                    <td className="px-4 py-2 border">{log.targetId}</td>
                    <td className="px-4 py-2 border">
                      {log.timestamp
                        ? format(new Date(log.timestamp), "yyyy-MM-dd HH:mm")
                        : "-"}
                    </td>
                    <td className="px-4 py-2 border">{log.ip || "-"}</td>
                    <td className="px-4 py-2 border max-w-[200px] truncate">
                      {log.userAgent || "-"}
                    </td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => toggleRow(log._id)}
                        className="text-sm text-blue-600 underline"
                      >
                        {expandedRows[log._id] ? "Hide" : "Show"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Meta viewer */}
            {logs.map(
              (log) =>
                expandedRows[log._id] && (
                  <div key={`meta-${log._id}`} className="bg-gray-100 p-4 my-2 rounded">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(log.metadata || {}, null, 2)}
                    </pre>
                  </div>
                )
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrev}
                disabled={pagination.page === 1}
                className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit) || 1}
              </span>
              <button
                onClick={handleNext}
                disabled={pagination.page * pagination.limit >= pagination.total}
                className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AuditLogs;
