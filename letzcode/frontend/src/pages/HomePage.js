import React, { useState, useEffect } from "react";
import { getActivityFeed } from "../api";
import { showToast } from "../utils/toast";
import ProjectPreview from "../components/project/ProjectPreview";
import CreateProjectModal from "../components/CreateProjectModal";
import { Link } from "react-router-dom";

const HomePage = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState("local");
  const [activities, setActivities] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [activeTab, sortBy]);

  const fetchActivities = async () => {
    setIsLoading(true);
    const data = await getActivityFeed(activeTab, sortBy);
    
    if (data.ok) {
      // Filter out activities without valid project or user data
      const validActivities = data.activities.filter(
        activity => activity && activity.user && activity.project
      );
      setActivities(validActivities);
    } else {
      showToast.error(data.message || "Failed to load activity feed");
    }
    
    setIsLoading(false);
  };

  const handleProjectCreated = () => {
    // Refresh activities to show the new project
    fetchActivities();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "check-in":
        return "↓";
      case "check-out":
        return "↑";
      case "create":
        return "+";
      case "update":
        return "•";
      case "delete":
        return "×";
      default:
        return "•";
    }
  };

  const getActivityText = (activity) => {
    if (!activity || !activity.project) return "performed an action";
    
    const projectId = activity.project._id || activity.project.id;
    const projectName = activity.project.name || "Unknown Project";
    
    switch (activity.type) {
      case "check-in":
        return (
          <>
            checked in{" "}
            <Link
              to={`/project/${projectId}`}
              style={{
                color: "var(--lz-primary)",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              "{projectName}"
            </Link>
          </>
        );
      case "check-out":
        return (
          <>
            checked out{" "}
            <Link
              to={`/project/${projectId}`}
              style={{
                color: "var(--lz-primary)",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              "{projectName}"
            </Link>
          </>
        );
      case "create":
        return (
          <>
            created new project{" "}
            <Link
              to={`/project/${projectId}`}
              style={{
                color: "var(--lz-primary)",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              "{projectName}"
            </Link>
          </>
        );
      case "update":
        return (
          <>
            updated{" "}
            <Link
              to={`/project/${projectId}`}
              style={{
                color: "var(--lz-primary)",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              "{projectName}"
            </Link>
          </>
        );
      case "delete":
        return `deleted project "${projectName}"`;
      default:
        return (
          <>
            made changes to{" "}
            <Link
              to={`/project/${projectId}`}
              style={{
                color: "var(--lz-primary)",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              "{projectName}"
            </Link>
          </>
        );
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = Math.floor((now - date) / 1000);

      if (diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
      if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Unknown date";
    }
  };

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header with Create Button */}
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              marginBottom: "0.5rem",
              fontSize: "2rem",
              color: "var(--lz-text-primary)",
            }}
          >
            Welcome back, {currentUser?.name || "Developer"}!
          </h1>
          <p style={{ color: "var(--lz-text-muted)", fontSize: "1rem" }}>
            Stay up to date with your projects and collaborations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: "0.75rem 1.5rem",
            background: "var(--lz-primary)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--lz-primary-dark)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--lz-primary)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>+</span> Create Project
        </button>
      </div>

      {/* Tabs and Sort */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          borderBottom: "2px solid var(--lz-border)",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setActiveTab("local")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "transparent",
              border: "none",
              borderBottom:
                activeTab === "local"
                  ? "3px solid var(--lz-primary)"
                  : "3px solid transparent",
              color:
                activeTab === "local"
                  ? "var(--lz-primary)"
                  : "var(--lz-text-secondary)",
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
              borderBottom:
                activeTab === "global"
                  ? "3px solid var(--lz-primary)"
                  : "3px solid transparent",
              color:
                activeTab === "global"
                  ? "var(--lz-primary)"
                  : "var(--lz-text-secondary)",
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
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          <option value="date">Sort by Date</option>
          <option value="popularity">Sort by Popularity</option>
        </select>
      </div>

      {/* Activity Feed */}
      {isLoading ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            color: "var(--lz-text-muted)",
          }}
        >
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
          <h3
            style={{
              marginBottom: "0.5rem",
              color: "var(--lz-text-primary)",
            }}
          >
            No activity yet
          </h3>
          <p style={{ marginBottom: "1.5rem" }}>
            {activeTab === "local"
              ? "Start by creating a project or connecting with friends"
              : "Be the first to create a project"}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "0.75rem 1.5rem",
              background: "var(--lz-primary)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {activities.map((activity) => {
            if (!activity || !activity.user || !activity.project) return null;
            
            return (
              <div key={activity._id} className="card">
                <div style={{ display: "flex", alignItems: "start", gap: "1rem" }}>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      padding: "0.5rem",
                      background: "var(--lz-surface)",
                      borderRadius: "8px",
                      minWidth: "48px",
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <Link
                        to={`/profile/${activity.user._id || activity.user.id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <img
                          src={activity.user.profileImage || "/placeholder.svg"}
                          alt={activity.user.name || "User"}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      </Link>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: 0,
                            color: "var(--lz-text-primary)",
                            fontSize: "0.95rem",
                          }}
                        >
                          <Link
                            to={`/profile/${activity.user._id || activity.user.id}`}
                            style={{
                              fontWeight: "600",
                              color: "var(--lz-text-primary)",
                              textDecoration: "none",
                            }}
                          >
                            {activity.user.name || "Unknown User"}
                          </Link>{" "}
                          {getActivityText(activity)}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            color: "var(--lz-text-muted)",
                          }}
                        >
                          {formatDate(activity.timestamp || activity.createdAt)}
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
                      <ProjectPreview
                        project={{
                          id: activity.project._id || activity.project.id,
                          name: activity.project.name || "Unknown Project",
                          description: activity.project.description || "",
                          image: activity.project.image || "/placeholder.svg",
                          languages: activity.project.languages || [],
                          type: activity.project.type || "Unknown",
                          createdAt: activity.project.createdAt || new Date().toISOString(),
                          status: activity.project.status || "checked-in",
                          owner: activity.project.owner || activity.user,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProjectCreated}
        />
      )}
    </main>
  );
};

export default HomePage;