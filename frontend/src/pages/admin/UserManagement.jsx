import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../../utils/axios";
import { format } from "date-fns";
import PageHelmet from "../../components/PageHelmet";
import Loader from "../../components/Loader";

const AdminUserManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  const [refreshFlag, setRefreshFlag] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      }).toString();

      const res = await API.get(`/api/admin/users?${query}`);
      setUsers(res.data.users);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshFlag]);

  // Sync state to URL params
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    if (roleFilter) {
      params.set("role", roleFilter);
    } else {
      params.delete("role");
    }
    setSearchParams(params);
  }, [page, search, roleFilter, searchParams, setSearchParams]);

  const handleRoleChange = async (appwriteId, newRole) => {
    try {
      await API.patch(`/api/admin/users/${appwriteId}`, { role: newRole });
      setRefreshFlag((prev) => !prev);
    } catch (err) {
      console.error("Error updating user role", err);
    }
  };

  const handleToggleBan = async (appwriteId, currentStatus) => {
    const confirmMessage = currentStatus
      ? "Unban this user?"
      : "Ban this user?";
    if (!window.confirm(confirmMessage)) return;

    try {
      if (currentStatus) {
        await API.patch(`/api/admin/users/${appwriteId}/restore`);
      } else {
        await API.patch(`/api/admin/users/${appwriteId}/soft-delete`);
      }
      setRefreshFlag((prev) => !prev);
    } catch (err) {
      console.error("Error toggling ban status", err);
    }
  };

  const handleViewUser = async (appwriteId) => {
    try {
      const res = await API.get(`/api/admin/users/${appwriteId}`);
      console.log("User details:", res.data.user);
    } catch (err) {
      console.error("Error fetching user details", err);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("");
    setPage(1);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHelmet
        title="User Management"
        description="Manage user accounts, roles, and activity on the SwapZY admin dashboard."
      />

      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or email"
          className="border border-gray-300 rounded px-4 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border border-gray-300 rounded px-4 py-2"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>

        <button
          onClick={resetFilters}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          Clear Filters
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          {users.length === 0 ? (
            <div className="text-gray-500 text-center">No users found.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow">
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-gray-100 text-left text-gray-700">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Joined</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr
                      key={idx}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="p-3 flex items-center gap-2">
                        {user.avatarUrl && (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        {user.name}
                      </td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3 font-medium">
                        <select
                          className="border rounded px-2 py-1 text-sm"
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.appwriteId, e.target.value)
                          }
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="p-3">
                        {format(new Date(user.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="p-3 text-center space-x-2">
                        <button
                          className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-600 hover:underline"
                          onClick={() => handleViewUser(user.appwriteId)}
                        >
                          View
                        </button>
                        <button
                          className={`text-xs px-2 py-1 rounded ${
                            user.isDeleted
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          } hover:underline`}
                          onClick={() =>
                            handleToggleBan(user.appwriteId, user.isDeleted)
                          }
                        >
                          {user.isDeleted ? "Unban" : "Ban"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-4 py-2 text-sm font-semibold text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUserManagementPage;
