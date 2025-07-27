import { useEffect, useState } from "react";
import authService from "../services/authService";
import axios from "axios";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
const MotionDiv = motion.div;

const UserProfileForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    college: "",
    contact: "",
  });
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    document.title = "Complete Your Profile - SwapZY";
    const fetchUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to fetch Appwrite user", error);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      console.warn("⛔ No currentUser found. Aborting...");
      return;
    }

    setLoading(true);
    try {
      const token = await authService.getJWT();
      if (!token) {
        alert("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        bio: formData.bio,
        college: formData.college,
        contact: formData.contact,
      };

      const res = await axios.post("/api/user/init", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Profile created:", res.data);
      alert("Profile created successfully");
    } catch (err) {
      console.error("🔥 Error creating profile:", err);
      if (err.response) {
        console.error(
          "🛑 Backend Response:",
          err.response.status,
          err.response.data
        );
      }
      alert("Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionDiv
      className="min-h-screen flex items-center justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-md w-full bg-white shadow-lg rounded p-6"
        aria-label="User profile setup form"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">
          Complete Your Profile
        </h1>

        <div>
          <label htmlFor="name" className="block mb-1 font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block mb-1 font-medium">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label htmlFor="college" className="block mb-1 font-medium">
            College
          </label>
          <input
            id="college"
            type="text"
            name="college"
            value={formData.college}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label htmlFor="contact" className="block mb-1 font-medium">
            Contact
          </label>
          <input
            id="contact"
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full flex items-center justify-center gap-2"
        >
          {loading ? <Loader /> : "Save Profile"}
        </button>
      </form>
    </MotionDiv>
  );
};

export default UserProfileForm;
