// src/context/auth.context.js
import { createContext, useContext, useEffect, useState } from "react";
import { account } from "../config/appwrite";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const user = await account.get();
      setAuthUser(user);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setAuthUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await account.deleteSession("current");
    setAuthUser(null);
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

export const useAuthContext = () => useContext(AuthContext);