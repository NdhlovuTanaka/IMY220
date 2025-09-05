import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("dark");

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <header className="lz-header">
      <Link to="/home" className="lz-logo">
        <img
          src="/assets/images/logo.png"
          alt="Logo"
          style={{ height: "40px", cursor: "pointer" }}
        />
      </Link>

      <nav style={{ display: "flex", gap: "1rem", marginLeft: "auto", alignItems: "center" }}>
        <Link to="/home" style={{ color: "var(--lz-text-primary)", textDecoration: "none" }}>
          Home
        </Link>
        <Link to={`/profile/${currentUser?.id || "1"}`} style={{ color: "var(--lz-text-primary)", textDecoration: "none" }}>
          Profile
        </Link>
        <span style={{ color: "var(--lz-text-secondary)" }}>Welcome, {currentUser?.email || "User"}</span>
        <button onClick={handleLogout} className="btn-secondary">Logout</button>
        <button onClick={toggleTheme} className="btn-primary">
          Toggle Theme
        </button>
      </nav>
    </header>
  );
};

export default Header;