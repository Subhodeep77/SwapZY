import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../../utils/axios";
import { format } from "date-fns";
import PageHelmet from "../../components/PageHelmet";
import Loader from "../../components/Loader";
import authService from "../../services/authService";
import { Trash2 } from "lucide-react";

const getAuthHeaders = async () => {
  const token = await authService.getJWT();
  return { Authorization: `Bearer ${token}` };
};

const AdminUserActivityLogsPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [allActivityTypes, setAllActivityTypes] = useState([]);
  const [expandedIndexes, setExpandedIndexes] = useState(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLog, setNewLog] = useState({
    appwriteId: "",
    activityType: "",
    productId: "",
    metadata: "{}",
  });
  const [formErrors, setFormErrors] = useState({});

  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const limitFromUrl = parseInt(searchParams.get("limit") || "50", 10);
  const activityFromUrl = searchParams.get("activityType") || "";
  const userIdFromUrl = searchParams.get("userId") || "";

  const [page, setPage] = useState(pageFromUrl);
  const [limit, setLimit] = useState(limitFromUrl);

  // Filters (controlled separately)
  const [activityTypeFilter, setActivityTypeFilter] = useState(activityFromUrl);
  const [userIdFilter, setUserIdFilter] = useState(userIdFromUrl);

  // Applied filters (only update on Search)
  const [appliedFilters, setAppliedFilters] = useState({
    activityType: activityFromUrl,
    userId: userIdFromUrl,
  });

  const firstLoadRef = useRef(true);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page);
    params.set("limit", limit);
    if (appliedFilters.activityType)
      params.set("activityType", appliedFilters.activityType);
    else params.delete("activityType");

    if (appliedFilters.userId)
      params.set("userId", appliedFilters.userId);
    else params.delete("userId");

    setSearchParams(params);
  }, [page, limit, appliedFilters, setSearchParams, searchParams]);

  const fetchActivities = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      setLoading(true);
      const query = new URLSearchParams({
        page,
        limit,
        ...(appliedFilters.activityType && { activityType: appliedFilters.activityType }),
        ...(appliedFilters.userId && { userId: appliedFilters.userId }),
      }).toString();

      const res = await API.get(`/api/admin/user-activities?${query}`, { headers });
      const logs = res.data.logs || [];

      const activityTypes = new Set(logs.map((log) => log.activityType));
      setAllActivityTypes((prev) =>
        Array.from(new Set([...prev, ...activityTypes]))
      );

      setActivities((prev) => (page === 1 ? logs : [...prev, ...logs]));
      setHasMore(logs.length > 0);
    } catch (err) {
      console.error("Error fetching user activities", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, appliedFilters]);

  useEffect(() => {
    fetchActivities();
    firstLoadRef.current = false;
  }, [fetchActivities]);

  const handleLoadMore = () => {
    if (hasMore) setPage((prev) => prev + 1);
  };

  const toggleExpand = (index) => {
    const newSet = new Set(expandedIndexes);
    newSet.has(index) ? newSet.delete(index) : newSet.add(index);
    setExpandedIndexes(newSet);
  };

  const validateForm = () => {
    const errors = {};
    if (!newLog.appwriteId.trim())
      errors.appwriteId = "Appwrite User ID is required.";
    if (!newLog.activityType.trim())
      errors.activityType = "Activity Type is required.";
    try {
      JSON.parse(newLog.metadata || "{}");
    } catch {
      errors.metadata = "Metadata must be valid JSON.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateLog = async () => {
    if (!validateForm()) return;
    try {
      const headers = await getAuthHeaders();
      const payload = {
        appwriteId: newLog.appwriteId,
        activityType: newLog.activityType,
        ...(newLog.productId && { productId: newLog.productId }),
        metadata: JSON.parse(newLog.metadata || "{}"),
      };
      await API.post("/api/admin/user-activities/create", payload, { headers });
      alert("Activity log created successfully.");
      setNewLog({ appwriteId: "", activityType: "", productId: "", metadata: "{}" });
      setFormErrors({});
      setShowCreateForm(false);
      setPage(1);
      fetchActivities();
    } catch (err) {
      console.error("Error creating activity log", err);
      alert("Failed to create activity log");
    }
  };

  const handleSearch = () => {
    setAppliedFilters({
      activityType: activityTypeFilter,
      userId: userIdFilter,
    });
    setPage(1);
  };

  const handleClearFilters = () => {
    setActivityTypeFilter("");
    setUserIdFilter("");
    setLimit(50);
    setAppliedFilters({ activityType: "", userId: "" });
    setPage(1);
  };

  const handleDeleteLog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    try {
      const headers = await getAuthHeaders();
      await API.delete(`/api/admin/user-activities/${id}`, { headers });
      setActivities((prev) => prev.filter((log) => log._id !== id));
    } catch (err) {
      console.error("Error deleting log", err);
      alert("Failed to delete log");
    }
  };

  const handleDeleteAllLogs = async () => {
    if (!window.confirm("⚠️ This will delete ALL logs permanently. Continue?")) return;
    try {
      const headers = await getAuthHeaders();
      await API.delete("/api/admin/user-activities", { headers });
      setActivities([]);
      setHasMore(false);
    } catch (err) {
      console.error("Error deleting all logs", err);
      alert("Failed to delete all logs");
    }
  };

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <PageHelmet
        title="User Activity Logs"
        description="Monitor recent user activity logs in SwapZY Admin Dashboard."
      />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          User Activity Logs
        </h1>
        
      </div>

      {/* Create Log & delete Log Button */}
      <div className="mb-4 flex flex-wrap gap-x-3">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setFormErrors({});
          }}
        >
          {showCreateForm ? "Cancel" : "Create Activity Log"}
        </button>

        {activities.length > 0 && (
          <button
            onClick={handleDeleteAllLogs}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
          >
            Delete All Logs
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mb-6 border border-gray-300 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
            New Activity Log
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Appwrite User ID"
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-4 py-2 w-full"
                value={newLog.appwriteId}
                onChange={(e) => setNewLog({ ...newLog, appwriteId: e.target.value })}
              />
              {formErrors.appwriteId && (
                <p className="text-red-600 text-sm mt-1">{formErrors.appwriteId}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Activity Type"
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-4 py-2 w-full"
                value={newLog.activityType}
                onChange={(e) => setNewLog({ ...newLog, activityType: e.target.value })}
              />
              {formErrors.activityType && (
                <p className="text-red-600 text-sm mt-1">{formErrors.activityType}</p>
              )}
            </div>

            <input
              type="text"
              placeholder="Product ID (optional)"
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-4 py-2 w-full"
              value={newLog.productId}
              onChange={(e) => setNewLog({ ...newLog, productId: e.target.value })}
            />

            <div className="md:col-span-2">
              <textarea
                placeholder="Metadata (JSON)"
                className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-4 py-2 w-full"
                rows={3}
                value={newLog.metadata}
                onChange={(e) => setNewLog({ ...newLog, metadata: e.target.value })}
              />
              {formErrors.metadata && (
                <p className="text-red-600 text-sm mt-1">{formErrors.metadata}</p>
              )}
            </div>
          </div>

          <button
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
            onClick={handleCreateLog}
          >
            Submit
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
        <select
          value={activityTypeFilter}
          onChange={(e) => setActivityTypeFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-4 py-2"
        >
          <option value="">All Activity Types</option>
          {allActivityTypes.map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Filter by User ID"
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-4 py-2"
          value={userIdFilter}
          onChange={(e) => setUserIdFilter(e.target.value)}
        />

        <select
          value={limit}
          onChange={(e) => {
            setLimit(parseInt(e.target.value, 10));
            setPage(1);
          }}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-4 py-2"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n} per page
            </option>
          ))}
        </select>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={handleSearch}
        >
          Search
        </button>

        <button
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded"
          onClick={handleClearFilters}
        >
          Clear Filters
        </button>
      </div>

      {loading && page === 1 ? (
        <Loader />
      ) : (
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400">No activity logs found.</div>
          ) : (
            activities.map((log, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 shadow-md p-4 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      Activity Type:{" "}
                      <span className="text-blue-600 dark:text-blue-400">
                        {log.activityType}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      User ID: {log.appwriteId}
                    </p>
                    {log.productId && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Product ID: {log.productId}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(log.timestamp), "dd MMM yyyy, hh:mm a")}
                    </p>
                    <button
                      onClick={() => handleDeleteLog(log._id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {log.metadata && (
                  <div className="mt-2">
                    <button
                      onClick={() => toggleExpand(idx)}
                      className="text-blue-600 dark:text-blue-400 text-sm underline"
                    >
                      {expandedIndexes.has(idx) ? "Hide Metadata" : "View Metadata"}
                    </button>
                    {expandedIndexes.has(idx) && (
                      <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded text-gray-700 dark:text-gray-300 overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {!loading && hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUserActivityLogsPage;
