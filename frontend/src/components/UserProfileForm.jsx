import { useEffect, useState } from "react";
import authService from "../services/authService";
import axios from "axios";
import Loader from "../components/Loader";

const UserProfileForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    college: "",
    contact: "",
    avatar: null,
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
    const { name, value, files } = e.target;
    if (name === "avatar") {
      setFormData((prev) => ({ ...prev, avatar: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    try {
      const token = await authService.getJWT();
      const data = new FormData();
      data.append("name", formData.name);
      data.append("bio", formData.bio);
      data.append("college", formData.college);
      data.append("contact", formData.contact);
      if (formData.avatar) data.append("avatar", formData.avatar);

      await axios.post("/api/users/init", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Profile created successfully");
    } catch (err) {
      console.error("Error creating profile:", err);
      alert("Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
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

        <div>
          <label htmlFor="avatar" className="block mb-1 font-medium">
            Avatar
          </label>
          <input
            id="avatar"
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleChange}
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
    </motion.div>
  );
};

export default UserProfileForm;
