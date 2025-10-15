
// src/Pages/Logout.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthToken } from "../utils/auth";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    clearAuthToken();
    navigate("/");
    window.location.reload();
  }, [navigate]);

  return (
    <div style={{ textAlign: "center",  padding: "5rem" }}>
      <h2>Logging out...</h2>
    </div>
  );
};

export default Logout;
