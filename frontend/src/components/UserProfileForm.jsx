import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  School,
  Phone,
  FileText,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import authService from "../services/authService";
import API from "../utils/axios.js";

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800 shadow-green-100";
      case "error":
        return "bg-red-50 border-red-200 text-red-800 shadow-red-100";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100";
    }
  };

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center space-x-3 px-6 py-4 border rounded-xl shadow-2xl backdrop-blur-sm ${getColors()} animate-in slide-in-from-right-5 duration-300`}
    >
      {getIcon()}
      <span className="font-medium text-sm">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-70 transition-opacity text-lg font-semibold"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

// Loader component
const Loader = () => <Loader2 className="w-5 h-5 animate-spin" />;

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
  const [toasts, setToasts] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // Toast management functions
  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    document.title = "Complete Your Profile - SwapZY";
    const fetchUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to fetch user", error);
        showToast("Failed to load user information", "error");
      }
    };
    fetchUser();
  }, []);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Name is required";
        } else if (value.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else {
          delete newErrors.name;
        }
        break;
      case "college":
        if (!value.trim()) {
          newErrors.college = "College is required";
        } else {
          delete newErrors.college;
        }
        break;
      case "contact":
        if (!value.trim()) {
          newErrors.contact = "Contact is required";
        } else if (!/^[+]?[\d\s\-(\\)]{10,}$/.test(value)) {
          newErrors.contact = "Please enter a valid phone number";
        } else {
          delete newErrors.contact;
        }
        break;
      case "bio":
        if (value.length > 500) {
          newErrors.bio = "Bio must be less than 500 characters";
        } else {
          delete newErrors.bio;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "avatar" && files && files[0]) {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        showToast("Please select a valid image file", "error");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "error");
        return;
      }

      setFormData((prev) => ({ ...prev, avatar: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      showToast("Session expired. Please refresh the page.", "error");
      return;
    }

    // Validate all required fields
    const isNameValid = validateField("name", formData.name);
    const isCollegeValid = validateField("college", formData.college);
    const isContactValid = validateField("contact", formData.contact);
    const isBioValid = validateField("bio", formData.bio);

    if (!isNameValid || !isCollegeValid || !isContactValid || !isBioValid) {
      showToast("Please fix the errors before submitting", "error");
      return;
    }

    setLoading(true);
    try {
      const token = await authService.getJWT();
      if (!token) {
        showToast("Session expired. Please log in again.", "error");
        setLoading(false);
        return;
      }

      const formPayload = new FormData();
      formPayload.append("name", formData.name.trim());
      formPayload.append("bio", formData.bio.trim());
      formPayload.append("college", formData.college.trim());
      formPayload.append("contact", formData.contact.trim());

      if (formData.avatar) {
        console.log(formData.avatar)
        formPayload.append("avatar", formData.avatar);
      }

      // Using fetch instead of axios for better compatibility
      const response = await API.post("/api/users/init", formPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.log("response",response);
      }

      
      console.log("✅ Profile created:", response);
      showToast("Profile created successfully! 🎉", "success");

      // Optional: Reset form or redirect
      // setFormData({ name: "", bio: "", college: "", contact: "", avatar: null });
      // setAvatarPreview(null);
    } catch (err) {
      console.error("🔥 Profile Creation Error:", err);

      if (err.message.includes("400")) {
        showToast("Please check your input and try again", "error");
      } else if (err.message.includes("401")) {
        showToast("Session expired. Please log in again.", "error");
      } else if (err.message.includes("413")) {
        showToast("File too large. Please choose a smaller image.", "error");
      } else if (err.message.includes("Network")) {
        showToast("Network error. Please check your connection.", "error");
      } else {
        showToast("Failed to create profile. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 px-8 py-10">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <User className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Complete Your Profile
              </h1>
              <p className="text-blue-100 text-lg">
                Help others get to know you better
              </p>
              {currentUser && (
                <div className="mt-4 inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                  <Mail className="w-4 h-4 text-blue-100" />
                  <span className="text-blue-100 text-sm">
                    {currentUser.email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <div onSubmit={handleSubmit} className="space-y-8">
              {/* Avatar Section */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg bg-gradient-to-br from-gray-100 to-gray-200">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <label
                    htmlFor="avatar"
                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg cursor-pointer transition-all duration-200 transform hover:scale-110 focus-within:ring-4 focus-within:ring-blue-300"
                    aria-label="Upload profile picture"
                  >
                    <Camera className="w-5 h-5" />
                  </label>

                  <input
                    type="file"
                    id="avatar"
                    name="avatar"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChange}
                  />
                </div>

                <p className="mt-3 text-sm text-gray-600">
                  Click the camera icon to upload a photo
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Max file size: 5MB • Formats: JPG, PNG, GIF
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    <User className="inline w-4 h-4 mr-2 text-blue-600" />
                    Full Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => handleFocus("name")}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white focus:outline-none ${
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : focusedField === "name"
                        ? "border-blue-500 focus:ring-4 focus:ring-blue-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                    aria-invalid={errors.name ? "true" : "false"}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p
                      id="name-error"
                      className="mt-2 text-sm text-red-600 flex items-center"
                      role="alert"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* College Field */}
                <div>
                  <label
                    htmlFor="college"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    <School className="inline w-4 h-4 mr-2 text-blue-600" />
                    College/University *
                  </label>
                  <input
                    id="college"
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    onFocus={() => handleFocus("college")}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white focus:outline-none ${
                      errors.college
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : focusedField === "college"
                        ? "border-blue-500 focus:ring-4 focus:ring-blue-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Your college or university"
                    aria-invalid={errors.college ? "true" : "false"}
                    aria-describedby={
                      errors.college ? "college-error" : undefined
                    }
                  />
                  {errors.college && (
                    <p
                      id="college-error"
                      className="mt-2 text-sm text-red-600 flex items-center"
                      role="alert"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      {errors.college}
                    </p>
                  )}
                </div>

                {/* Contact Field */}
                <div>
                  <label
                    htmlFor="contact"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    <Phone className="inline w-4 h-4 mr-2 text-blue-600" />
                    Contact Number *
                  </label>
                  <input
                    id="contact"
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    onFocus={() => handleFocus("contact")}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white focus:outline-none ${
                      errors.contact
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : focusedField === "contact"
                        ? "border-blue-500 focus:ring-4 focus:ring-blue-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Your phone number"
                    aria-invalid={errors.contact ? "true" : "false"}
                    aria-describedby={
                      errors.contact ? "contact-error" : undefined
                    }
                  />
                  {errors.contact && (
                    <p
                      id="contact-error"
                      className="mt-2 text-sm text-red-600 flex items-center"
                      role="alert"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      {errors.contact}
                    </p>
                  )}
                </div>

                {/* Bio Field */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="bio"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    <FileText className="inline w-4 h-4 mr-2 text-blue-600" />
                    Bio (Optional)
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="4"
                    value={formData.bio}
                    onChange={handleChange}
                    onFocus={() => handleFocus("bio")}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white focus:outline-none resize-vertical ${
                      errors.bio
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : focusedField === "bio"
                        ? "border-blue-500 focus:ring-4 focus:ring-blue-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Tell others about yourself, your interests, or what you're looking to swap..."
                    maxLength="500"
                    aria-invalid={errors.bio ? "true" : "false"}
                    aria-describedby={errors.bio ? "bio-error" : "bio-help"}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p id="bio-help" className="text-xs text-gray-500">
                      Share your interests, what you're looking to swap, etc.
                    </p>
                    <span
                      className={`text-xs ${
                        formData.bio.length > 450
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    >
                      {formData.bio.length}/500
                    </span>
                  </div>
                  {errors.bio && (
                    <p
                      id="bio-error"
                      className="mt-2 text-sm text-red-600 flex items-center"
                      role="alert"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      {errors.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || Object.keys(errors).length > 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg hover:shadow-xl"
                  aria-describedby="submit-help"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader />
                      <span className="ml-2">Creating Profile...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Save className="w-5 h-5 mr-2" />
                      Complete Profile
                    </span>
                  )}
                </button>
                <p
                  id="submit-help"
                  className="mt-3 text-sm text-gray-500 text-center"
                >
                  * Required fields • Your information helps build trust in the
                  community
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Profile Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Use a clear profile photo to build trust with other users
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Mention your interests and what items you typically swap
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              A complete profile gets 3x more engagement
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;