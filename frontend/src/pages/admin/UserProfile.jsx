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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-white/80 text-lg mt-4 text-center font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      {/* Main card */}
      <div className="relative w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform hover:scale-105 transition-all duration-500">
        {/* Card header with gradient */}
        <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-4 left-6">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full border-4 border-white/40 object-cover"
            />
          </div>
        </div>

        {/* Card content */}
        <div className="p-6 pt-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {user.name}
          </h1>

          <div className="space-y-4">
            {[
              { label: "Email", value: user.email, icon: "📧" },
              { label: "Role", value: user.role, icon: "👤" },
              { label: "College", value: user.college, icon: "🎓" },
              { label: "Contact", value: user.contact, icon: "📱" }
            ].map((item, index) => (
              <div key={index} className="group">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300 border border-transparent hover:border-blue-200 dark:hover:border-blue-700/50">
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block">
                      {item.label}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium truncate block">
                      {item.value}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}