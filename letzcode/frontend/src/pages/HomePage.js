import React, { useState, useEffect } from "react";
import { getActivityFeed } from "../api";
import { showToast } from "../utils/toast";
import ProjectPreview from "../components/project/ProjectPreview";
import { Link } from "react-router-dom";

const HomePage = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState("local");
  const [activities, setActivities] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [activeTab, sortBy]);

  const fetchActivities = async () => {
    setIsLoading(true);
    const data = await getActivityFeed(activeTab, sortBy);
    
    if (data.ok) {
      setActivities(data.activities);
    } else {
      showToast.error(data.message || "Failed to load activity feed");
    }
    
    setIsLoading(false);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "check-in":
        return "📥";
      case "check-out":
        return "📤";
      case "create":
        return "✨";
      case "update":
        return "✏️";
      case "delete":
        return "🗑️";
      default:
        return "📋";
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case "check-in":
        return (
          <>
            checked in <Link to={`/project/${activity.project._id}`} style={{ color: "var(--lz-primary)" }}>"{activity.project.name}"</Link>
          </>
        );
      case "check-out":
        return (
          <>
            checked out <Link to={`/project/${activity.project._id}`} style={{ color: "var(--lz-primary)" }}>"{activity.project.name}"</Link>
          </>
        );
      case "create":
        return (
          <>
            created new project <Link to={`/project/${activity.project._id}`} style={{ color: "var(--lz-primary)" }}>"{activity.project.name}"</Link>
          </>
        );
      case "update":
        return (
          <>
            updated <Link to={`/project/${activity.project._id}`} style={{ color: "var(--lz-primary)" }}>"{activity.project.name}"</Link>
          </>
        );
      case "delete":
        return `deleted project "${activity.project?.name}"`;
      default:
        return (
          <>
            made changes to <Link to={`/project/${activity.project._id}`} style={{ color: "var(--lz-primary)" }}>"{activity.project.name}"</Link>
          </>
        );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "0.5rem", fontSize: "2rem", color: "var(--lz-text-primary)" }}>
          Welcome back, {currentUser?.name || "Developer"}! 👋
        </h1>
        <p style={{ color: "var(--lz-text-muted)", fontSize: "1rem" }}>
          Stay up to date with your projects and collaborations
        </p>
      </div>

      {/* Tabs and Sort */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          borderBottom: "2px solid var(--lz-border)",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setActiveTab("local")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "local" ? "3px solid var(--lz-primary)" : "3px solid transparent",
              color: activeTab === "local" ? "var(--lz-primary)" : "var(--lz-text-secondary)",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: "-2px",
            }}
          >
            My Feed
          </button>
          <button
            onClick={() => setActiveTab("global")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "global" ? "3px solid var(--lz-primary)" : "3px solid transparent",
              color: activeTab === "global" ? "var(--lz-primary)" : "var(--lz-text-secondary)",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: "-2px",
            }}
          >
            Global Feed
          </button>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "0.5rem 1rem",
            background: "var(--lz-surface)",
            border: "1px solid var(--lz-border)",
            borderRadius: "6px",
            color: "var(--lz-text-primary)",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          <option value="date">Sort by Date</option>
          <option value="popularity">Sort by Popularity</option>
        </select>
      </div>

      {/* Activity Feed */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--lz-text-muted)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
          Loading {activeTab === "local" ? "your" : "global"} activity...
        </div>
      ) : activities.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "var(--lz-text-muted)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <h3 style={{ marginBottom: "0.5rem", color: "var(--lz-text-primary)" }}>No activity yet</h3>
          <p>
            {activeTab === "local"
              ? "Start by creating a project or connecting with friends!"
              : "Be the first to create a project!"}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {activities.map((activity) => (
            <div key={activity._id} className="card">
              <div style={{ display: "flex", alignItems: "start", gap: "1rem", marginBottom: "1rem" }}>
                <div
                  style={{
                    fontSize: "2rem",
                    padding: "0.5rem",
                    background: "var(--lz-surface)",
                    borderRadius: "8px",
                  }}
                >
                  {getActivityIcon(activity.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <Link to={`/profile/${activity.user._id}`} style={{ textDecoration: "none" }}>
                      <img
                        src={activity.user.profileImage || "/placeholder.svg"}
                        alt={activity.user.name}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    </Link>
                    <div>
                      <p style={{ margin: 0, color: "var(--lz-text-primary)", fontSize: "0.95rem" }}>
                        <Link to={`/profile/${activity.user._id}`} style={{ fontWeight: "600", color: "var(--lz-text-primary)", textDecoration: "none" }}>
                          {activity.user.name}
                        </Link>{" "}
                        {getActivityText(activity)}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--lz-text-muted)" }}>
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>

                  {activity.message && (
                    <div
                      style={{
                        padding: "0.75rem",
                        background: "var(--lz-surface)",
                        borderLeft: "3px solid var(--lz-primary)",
                        borderRadius: "4px",
                        marginBottom: "1rem",
                        fontStyle: "italic",
                        color: "var(--lz-text-secondary)",
                      }}
                    >
                      "{activity.message}"
                    </div>
                  )}

                  {activity.version && (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.25rem 0.5rem",
                        background: "var(--lz-primary)",
                        color: "white",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        marginBottom: "1rem",
                      }}
                    >
                      v{activity.version}
                    </span>
                  )}

                  {activity.project && (
                    <ProjectPreview project={{
                      id: activity.project._id,
                      name: activity.project.name,
                      description: activity.project.description,
                      image: activity.project.image,
                      languages: activity.project.languages,
                      type: activity.project.type,
                      status: activity.project.status,
                      owner: activity.project.owner,
                    }} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default HomePage;