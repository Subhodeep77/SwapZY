// src/context/auth.context.js
import { createContext, useContext, useEffect, useState } from "react";
import { account } from "../config/appwrite";
import { connectSocket, disconnectSocket } from "../services/socket"; // ✅ Also import connectSocket

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const user = await account.get();
      setAuthUser(user);
      connectSocket(); // ✅ connect only if user exists
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setAuthUser(null);
      disconnectSocket(); // ✅ disconnect if unauthenticated
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("🚪 Logging out...");
      await account.deleteSession("current");
      disconnectSocket(); // ✅ disconnect socket
      setAuthUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => useContext(AuthContext);
