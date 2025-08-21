import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import API from "../utils/axios";
import Loader from "../components/Loader";
import PageHelmet from "../components/PageHelmet";

const AuthGate = ({ children, roles = [] }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // ✅ If no roles are passed, default to USER
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allowedRoles = roles.length === 0 ? ["USER"] : roles;

  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        // 1. Appwrite session
        const appwriteUser = await authService.getCurrentUser();
        if (!appwriteUser) {
          console.warn("No Appwrite session, redirecting to login...");
          return navigate("/login");
        }

        const appwriteId = appwriteUser.$id;
        const token = await authService.getJWT();

        // 2. Fetch DB user
        const res = await API.get(`/api/users/${appwriteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const dbUser = res.data?.user;
        if (!dbUser) {
          console.warn("No user profile in DB, redirecting...");
          return navigate("/profile/init");
        }

        // ✅ 3. Role check (supports multiple roles per user now)
        const userRoles = Array.isArray(dbUser.roles)
          ? dbUser.roles
          : [dbUser.role]; // fallback for old schema

        const hasAccess = userRoles.some((role) =>
          allowedRoles.includes(role)
        );

        if (!hasAccess) {
          console.warn(
            `Unauthorized. Allowed: ${allowedRoles}, user roles: ${userRoles}`
          );
          return navigate("/unauthorized");
        }
      } catch (err) {
        console.warn("Error verifying user:", err);
        navigate("/profile/init");
      } finally {
        setLoading(false);
      }
    };

    checkUserProfile();
  }, [navigate, allowedRoles]);

  if (loading) {
    return (
      <>
        <PageHelmet
          title="Checking user profile..."
          description="Verifying your account..."
        />
        <Loader />
      </>
    );
  }

  return (
    <>
      <PageHelmet
        title="SwapZY Dashboard"
        description="Dashboard access to manage your orders, products, and chats."
      />
      {children}
    </>
  );
};

export default AuthGate;
