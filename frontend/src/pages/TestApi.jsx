import React, { useEffect, useState } from "react";
import API from "../utils/axios";

const TestApi = () => {
  const [response, setResponse] = useState("");

  useEffect(() => {
    const testCall = async () => {
      try {
        const res = await API.get("/health");
        setResponse(res.data.status);
      } catch (error) {
        console.error("API Test Failed:", error);
        setResponse("Error");
      }
    };

    testCall();
  }, []);

  return (
    <div>
      <h1>API Test: {response}</h1>
    </div>
  );
};

export default TestApi;
