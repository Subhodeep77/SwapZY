import { useEffect, useState, useCallback } from "react";
import API from "../../utils/axios";
import { format } from "date-fns";
import PageHelmet from "../../components/PageHelmet";
import Loader from "../../components/Loader";

const AdminUserActivityLogsPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activityTypeFilter, setActivityTypeFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [expandedIndexes, setExpandedIndexes] = useState(new Set());
  const [allActivityTypes, setAllActivityTypes] = useState([]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLog, setNewLog] = useState({
    appwriteId: "",
    activityType: "",
    productId: "",
    metadata: "{}",
  });

  const [formErrors, setFormErrors] = useState({});

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page,
        ...(activityTypeFilter && { activityType: activityTypeFilter }),
        ...(userIdFilter && { userId: userIdFilter }),
      }).toString();

      const res = await API.get(`/api/admins/user-activities?${query}`);
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
  }, [page, activityTypeFilter, userIdFilter]);

  useEffect(() => {
    setPage(1);
  }, [activityTypeFilter, userIdFilter]);

  useEffect(() => {
    fetchActivities();
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

    if (!newLog.appwriteId.trim()) {
      errors.appwriteId = "Appwrite User ID is required.";
    }

    if (!newLog.activityType.trim()) {
      errors.activityType = "Activity Type is required.";
    }

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
      const payload = {
        appwriteId: newLog.appwriteId,
        activityType: newLog.activityType,
        ...(newLog.productId && { productId: newLog.productId }),
        metadata: JSON.parse(newLog.metadata || "{}"),
      };

      await API.post("/api/admins/user-activities/create", payload);
      alert("Activity log created successfully.");
      setNewLog({
        appwriteId: "",
        activityType: "",
        productId: "",
        metadata: "{}",
      });
      setFormErrors({});
      setShowCreateForm(false);
      setPage(1);
      fetchActivities();
    } catch (err) {
      console.error("Error creating activity log", err);
      alert("Failed to create activity log");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHelmet
        title="User Activity Logs"
        description="Monitor recent user activity logs in SwapZY Admin Dashboard."
      />
      <h1 className="text-2xl font-bold mb-4">User Activity Logs</h1>

      {/* Create Log Toggle Button */}
      <div className="mb-4">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setFormErrors({});
          }}
        >
          {showCreateForm ? "Cancel" : "Create Activity Log"}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-gray-100 p-4 rounded-xl mb-6 border">
          <h2 className="text-lg font-semibold mb-2">New Activity Log</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Appwrite User ID"
                className="border border-gray-300 rounded px-4 py-2 w-full"
                value={newLog.appwriteId}
                onChange={(e) =>
                  setNewLog({ ...newLog, appwriteId: e.target.value })
                }
              />
              {formErrors.appwriteId && (
                <p className="text-red-600 text-sm mt-1">{formErrors.appwriteId}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Activity Type"
                className="border border-gray-300 rounded px-4 py-2 w-full"
                value={newLog.activityType}
                onChange={(e) =>
                  setNewLog({ ...newLog, activityType: e.target.value })
                }
              />
              {formErrors.activityType && (
                <p className="text-red-600 text-sm mt-1">{formErrors.activityType}</p>
              )}
            </div>

            <input
              type="text"
              placeholder="Product ID (optional)"
              className="border border-gray-300 rounded px-4 py-2 w-full"
              value={newLog.productId}
              onChange={(e) =>
                setNewLog({ ...newLog, productId: e.target.value })
              }
            />

            <div className="md:col-span-2">
              <textarea
                placeholder="Metadata (JSON)"
                className="border border-gray-300 rounded px-4 py-2 w-full"
                rows={3}
                value={newLog.metadata}
                onChange={(e) =>
                  setNewLog({ ...newLog, metadata: e.target.value })
                }
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
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={activityTypeFilter}
          onChange={(e) => setActivityTypeFilter(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2"
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
          className="border border-gray-300 rounded px-4 py-2"
          value={userIdFilter}
          onChange={(e) => setUserIdFilter(e.target.value)}
        />

        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          onClick={() => {
            setActivityTypeFilter("");
            setUserIdFilter("");
            setPage(1);
          }}
        >
          Clear Filters
        </button>
      </div>

      {loading && page === 1 ? (
        <Loader />
      ) : (
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-gray-500">No activity logs found.</div>
          ) : (
            activities.map((log, idx) => (
              <div
                key={idx}
                className="bg-white shadow-md p-4 rounded-xl border border-gray-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      Activity Type:{" "}
                      <span className="text-blue-600">{log.activityType}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      User ID: {log.appwriteId}
                    </p>
                    {log.productId && (
                      <p className="text-sm text-gray-600">
                        Product ID: {log.productId}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(log.timestamp), "dd MMM yyyy, hh:mm a")}
                  </div>
                </div>

                {log.metadata && (
                  <div className="mt-2">
                    <button
                      onClick={() => toggleExpand(idx)}
                      className="text-blue-600 text-sm underline"
                    >
                      {expandedIndexes.has(idx)
                        ? "Hide Metadata"
                        : "View Metadata"}
                    </button>
                    {expandedIndexes.has(idx) && (
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded text-gray-700 overflow-x-auto">
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
