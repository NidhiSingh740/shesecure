
// src/Pages/Logout.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    navigate("/");
  }, [navigate, logout]);

  return (
    <div style={{ textAlign: "center", padding: "5rem" }}>
      <h2>Logging out...</h2>
    </div>
  );
};

export default Logout;
