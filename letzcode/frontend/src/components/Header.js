import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../api";

const Header = ({ currentUser, onLogout, onSearch }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const data = await getNotifications();
    if (data.ok) {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    }
  };

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

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationRead(notification._id);
      fetchNotifications();
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
    
    setShowNotifications(false);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    fetchNotifications();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

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
      <Link to="/home" className="lz-logo">
        <img
          src="/assets/images/logo.png"
          alt="LetzCode Logo"
          style={{ height: "40px", cursor: "pointer" }}
        />
      </Link>

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
            color: "var(--lz-text-secondary)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </form>

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
              padding: "0.5rem",
              color: "var(--lz-text-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "0.25rem",
                  right: "0.25rem",
                  minWidth: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#ef4444",
                  color: "white",
                  borderRadius: "50%",
                  fontSize: "0.65rem",
                  fontWeight: "bold",
                  padding: "0 4px",
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 0.5rem)",
                right: 0,
                width: "360px",
                maxHeight: "500px",
                background: "var(--lz-surface-elevated)",
                border: "1px solid var(--lz-border)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                zIndex: 1000,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  borderBottom: "1px solid var(--lz-border)",
                }}
              >
                <span style={{ fontWeight: "600", color: "var(--lz-text-primary)" }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--lz-primary)",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      padding: "0.25rem 0.5rem",
                    }}
                  >
                    Mark all read
                  </button>
                )}
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
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        padding: "1rem",
                        borderBottom: "1px solid var(--lz-border)",
                        cursor: "pointer",
                        transition: "background 0.2s",
                        background: notif.read ? "transparent" : "rgba(139, 92, 246, 0.05)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--lz-surface)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = notif.read ? "transparent" : "rgba(139, 92, 246, 0.05)";
                      }}
                    >
                      <img
                        src={notif.sender?.profileImage || "/placeholder.svg"}
                        alt={notif.sender?.name}
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: "0 0 0.25rem 0", color: "var(--lz-text-primary)", fontSize: "0.875rem" }}>
                          {notif.message}
                        </p>
                        <p style={{ margin: 0, color: "var(--lz-text-muted)", fontSize: "0.75rem" }}>
                          {formatTime(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.read && (
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "var(--lz-primary)",
                            flexShrink: 0,
                            marginTop: "0.5rem",
                          }}
                        />
                      )}
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