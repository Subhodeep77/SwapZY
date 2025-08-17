import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react"; // nice warning icon
import PageHelmet from "../components/PageHelmet";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <PageHelmet
        title="Unauthorized"
        description="You don't have permission to access this page."
      />

      <div className="flex flex-col items-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Unauthorized Access
        </h1>
        <p className="text-gray-600 mb-6">
          Sorry, you don’t have permission to view this page.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 rounded-lg shadow hover:bg-gray-300 transition"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
