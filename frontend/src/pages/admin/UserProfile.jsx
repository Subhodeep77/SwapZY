import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../utils/axios";
import getAuthHeaders from "../../utils/authHeaders";

export default function UserProfile() {
  const { appwriteId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await API.get(`/api/users/${appwriteId}`, { headers });
        setUser(res.data.user);
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    };
    fetchUser();
  }, [appwriteId]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white/80 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <p className="text-gray-600">Email: {user.email}</p>
      <p className="text-gray-600">Role: {user.role}</p>
      <p className="text-gray-600">College: {user.college}</p>
      <p className="text-gray-600">Contact: {user.contact}</p>
    </div>
  );
}
