import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../../utils/axios";
import { format } from "date-fns";
import PageHelmet from "../../components/PageHelmet";
import Loader from "../../components/Loader";
import authService from "../../services/authService";
import { useNavigate } from "react-router-dom";

const getAuthHeaders = async () => {
  const token = await authService.getJWT();
  return { Authorization: `Bearer ${token}` };
};

const AdminUserManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [pendingFilters, setPendingFilters] = useState({
    search: searchParams.get("search") || "",
    role: searchParams.get("role") || "",
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      }).toString();
      const headers = await getAuthHeaders();
      const res = await API.get(`/api/admin/users?${query}`, { headers });
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
      const headers = await getAuthHeaders();
      await API.patch(`/api/admin/users/${appwriteId}`, { role: newRole }, { headers });
      setRefreshFlag((prev) => !prev);
    } catch (err) {
      console.error("Error updating user role", err);
    }
  };

  const handleToggleBan = async (appwriteId, currentStatus) => {
    const confirmMessage = currentStatus ? "Unban this user?" : "Ban this user?";
    if (!window.confirm(confirmMessage)) return;

    try {
      const headers = await getAuthHeaders();
      if (currentStatus) {
        await API.patch(`/api/admin/users/${appwriteId}/restore`, {}, { headers });
      } else {
        await API.patch(`/api/admin/users/${appwriteId}/soft-delete`, {}, { headers });
      }
      setRefreshFlag((prev) => !prev);
    } catch (err) {
      console.error("Error toggling ban status", err);
    }
  };

  const navigate = useNavigate();
  const handleViewUser = async (appwriteId) => {
    try {
      const headers = await getAuthHeaders();
      const res = await API.get(`/api/admin/users/${appwriteId}`, { headers });
      navigate(`/admin/user-profile/${appwriteId}`);
      console.log("User details:", res.data.user);
    } catch (err) {
      console.error("Error fetching user details", err);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("");
    setPage(1);
    setPendingFilters({ search: "", role: "" });
  };

  const applyFilters = () => {
    setSearch(pendingFilters.search);
    setRoleFilter(pendingFilters.role);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <PageHelmet
        title="User Management"
        description="Manage user accounts, roles, and activity on the SwapZY admin dashboard."
      />
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user accounts, roles, and access permissions
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={pendingFilters.search}
                onChange={(e) => setPendingFilters({ ...pendingFilters, search: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Role
              </label>
              <select
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={pendingFilters.role}
                onChange={(e) => setPendingFilters({ ...pendingFilters, role: e.target.value })}
              >
                <option value="">All Roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02]"
              >
                Search
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02]"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : (
          <>
            {users.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No users found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search criteria or clear the filters
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                          Joined
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {users.map((user, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.name}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                  {user.name?.charAt(0)?.toUpperCase()}
                                </div>
                              )}
                              <span className="font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                            {user.email}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.appwriteId, e.target.value)}
                            >
                              <option value="USER">User</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                            {format(new Date(user.createdAt), "dd MMM yyyy")}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                className="px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                                onClick={() => handleViewUser(user.appwriteId)}
                              >
                                View
                              </button>
                              <button
                                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                  user.isDeleted
                                    ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
                                    : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                                }`}
                                onClick={() => handleToggleBan(user.appwriteId, user.isDeleted)}
                              >
                                {user.isDeleted ? "Unban" : "Ban"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                          pageNum === page
                            ? "bg-blue-600 text-white shadow-lg transform scale-105"
                            : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagementPage;
