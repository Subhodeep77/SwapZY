
import { useEffect, useState } from "react";
import { account } from "../config/appwrite";

const useAuthUser = () => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchUser();
  }, []);

  return { authUser, loading };
};

export default useAuthUser;
