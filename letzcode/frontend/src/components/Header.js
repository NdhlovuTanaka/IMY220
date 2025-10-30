import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ currentUser, onLogout, onSearch }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      setSearchTerm("");
    }
  };

  const notifications = [
    { id: 1, type: "friend-request", message: "Jane Smith sent you a friend request", time: "2 hours ago" },
    { id: 2, type: "project-update", message: "New check-in on React Dashboard Pro", time: "5 hours ago" },
    { id: 3, type: "mention", message: "Mike Johnson mentioned you in a comment", time: "1 day ago" },
  ];

  return (
    <header
      className="lz-header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 2rem",
        background: "var(--lz-surface-elevated)",
        borderBottom: "1px solid var(--lz-border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Link to="/home" className="lz-logo">
        <img
          src="/assets/images/logo.png"
          alt="LetzCode Logo"
          style={{ height: "40px", cursor: "pointer" }}
        />
      </Link>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        style={{
          flex: 1,
          maxWidth: "500px",
          margin: "0 2rem",
          position: "relative",
        }}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search projects, users, or languages..."
          style={{
            width: "100%",
            padding: "0.6rem 2.5rem 0.6rem 1rem",
            background: "var(--lz-surface)",
            border: "1px solid var(--lz-border)",
            borderRadius: "8px",
            color: "var(--lz-text-primary)",
            fontSize: "0.9rem",
          }}
        />
        <button
          type="submit"
          style={{
            position: "absolute",
            right: "0.5rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "1.2rem",
            padding: "0.25rem 0.5rem",
          }}
        >
          🔍
        </button>
      </form>

      {/* Right Section */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: "relative",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "1.5rem",
              padding: "0.5rem",
              color: "var(--lz-text-primary)",
            }}
          >
            🔔
            {notifications.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "0.25rem",
                  right: "0.25rem",
                  width: "8px",
                  height: "8px",
                  background: "#ef4444",
                  borderRadius: "50%",
                }}
              />
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 0.5rem)",
                right: 0,
                width: "320px",
                background: "var(--lz-surface-elevated)",
                border: "1px solid var(--lz-border)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--lz-border)",
                  fontWeight: "600",
                  color: "var(--lz-text-primary)",
                }}
              >
                Notifications
              </div>

              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: "var(--lz-text-muted)",
                    }}
                  >
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--lz-border)",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--lz-surface)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <p style={{ margin: "0 0 0.25rem 0", color: "var(--lz-text-primary)", fontSize: "0.9rem" }}>
                        {notif.message}
                      </p>
                      <p style={{ margin: 0, color: "var(--lz-text-muted)", fontSize: "0.75rem" }}>{notif.time}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.5rem 1rem",
            background: "var(--lz-surface)",
            borderRadius: "8px",
            border: "1px solid var(--lz-border)",
          }}
        >
          <Link to={`/profile/${currentUser?.id}`} style={{ textDecoration: "none" }}>
            <img
              src={currentUser?.profileImage || "/placeholder.svg"}
              alt={currentUser?.name}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </Link>
          <span style={{ color: "var(--lz-text-primary)", fontSize: "0.9rem", fontWeight: "500" }}>
            {currentUser?.username || "User"}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            padding: "0.5rem 1rem",
            background: "transparent",
            border: "1px solid var(--lz-border)",
            borderRadius: "6px",
            color: "var(--lz-text-secondary)",
            cursor: "pointer",
            fontSize: "0.9rem",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#ef4444";
            e.currentTarget.style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--lz-border)";
            e.currentTarget.style.color = "var(--lz-text-secondary)";
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;