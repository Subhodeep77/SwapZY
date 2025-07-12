import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../appwrite/authService";
import axios from "axios";
import Loader from "../components/Loader";

const AuthGate = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const user = await authService.getCurrentUser();
        const token = await authService.getJWT();

        const res = await axios.get("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.data || !res.data.appwriteId) {
          navigate("/profile/init");
        }
      } catch (err) {
        console.warn("User profile not found, redirecting to init");
        navigate("/profile/init");
      } finally {
        setLoading(false);
      }
    };

    checkUserProfile();
  }, [navigate]);

  useEffect(() => {
    document.title = loading ? "Checking user profile..." : "SwapZY Dashboard";
    const meta = document.querySelector("meta[name='description']");
    if (meta) {
      meta.setAttribute(
        "content",
        loading
          ? "Verifying your account..."
          : "Dashboard access to manage your orders, products, and chats."
      );
    }
  }, [loading]);

  if (loading) return <Loader />;

  return children;
};

export default AuthGate;
