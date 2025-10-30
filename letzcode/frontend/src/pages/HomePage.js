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
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, [activeTab, sortBy]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getActivityFeed(activeTab, sortBy);
      
      if (data && data.ok && Array.isArray(data.activities)) {
        // Filter and validate activities
        const validActivities = data.activities.filter(activity => {
          try {
            // Must have user
            if (!activity || !activity.user) return false;
            
            const userId = activity.user._id || activity.user.id;
            if (!userId) return false;

            // Must have project for most activity types
            if (activity.type !== 'profile-update' && !activity.project) return false;
            
            // If has project, must have valid project ID
            if (activity.project) {
              const projectId = activity.project._id || activity.project.id;
              if (!projectId) return false;
            }

            return true;
          } catch (err) {
            console.warn("Invalid activity detected:", activity, err);
            return false;
          }
        });
        
        console.log(`Filtered ${data.activities.length} activities to ${validActivities.length} valid ones`);
        setActivities(validActivities);
      } else {
        setActivities([]);
        if (data && data.message) {
          showToast.error(data.message);
        }
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Failed to load activity feed");
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectCreated = () => {
    fetchActivities();
  };

  const getActivityIcon = (type) => {
    const icons = {
      "check-in": "↓",
      "check-out": "↑",
      "create": "+",
      "update": "•",
      "delete": "×"
    };
    return icons[type] || "•";
  };

  const getActivityText = (activity) => {
    try {
      if (!activity) return "performed an action";
      
      // Handle activities without projects
      if (!activity.project) {
        if (activity.type === 'profile-update') {
          return "updated their profile";
        }
        return "performed an action";
      }
      
      const projectId = activity.project._id || activity.project.id;
      const projectName = activity.project.name || "Unknown Project";
      
      // Make sure projectId exists before creating link
      if (!projectId) {
        return `${activity.type} "${projectName}"`;
      }
      
      const textMap = {
        "check-in": "checked in",
        "check-out": "checked out",
        "create": "created new project",
        "update": "updated",
        "delete": "deleted project"
      };
      
      const action = textMap[activity.type] || "made changes to";
      
      if (activity.type === "delete") {
        return `${action} "${projectName}"`;
      }
      
      return (
        <>
          {action}{" "}
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
    } catch (err) {
      console.error("Error rendering activity text:", err);
      return "performed an action";
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Unknown date";
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Unknown date";
      
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
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Unknown date";
    }
  };

  if (error) {
    return (
      <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <h3 style={{ marginBottom: "0.5rem", color: "var(--lz-text-primary)" }}>
            {error}
          </h3>
          <button
            onClick={fetchActivities}
            style={{
              padding: "0.75rem 1.5rem",
              background: "var(--lz-primary)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "1rem",
            }}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
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
          <h1 style={{ marginBottom: "0.5rem", fontSize: "2rem", color: "var(--lz-text-primary)" }}>
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
        >
          <span style={{ fontSize: "1.2rem" }}>+</span> Create Project
        </button>
      </div>

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
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          <option value="date">Sort by Date</option>
          <option value="popularity">Sort by Popularity</option>
        </select>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--lz-text-muted)" }}>
          <p>Loading {activeTab === "local" ? "your" : "global"} activity...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--lz-text-muted)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <h3 style={{ marginBottom: "0.5rem", color: "var(--lz-text-primary)" }}>
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
            try {
              const userId = activity.user?._id || activity.user?.id;
              const userName = activity.user?.name || "Unknown User";
              const userImage = activity.user?.profileImage || "/placeholder.svg";
              const projectId = activity.project?._id || activity.project?.id;
              
              return (
                <div key={activity._id || Math.random()} className="card">
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
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                        <Link to={`/profile/${userId}`} style={{ textDecoration: "none" }}>
                          <img
                            src={userImage}
                            alt={userName}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        </Link>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, color: "var(--lz-text-primary)", fontSize: "0.95rem" }}>
                            <Link
                              to={`/profile/${userId}`}
                              style={{
                                fontWeight: "600",
                                color: "var(--lz-text-primary)",
                                textDecoration: "none",
                              }}
                            >
                              {userName}
                            </Link>{" "}
                            {getActivityText(activity)}
                          </p>
                          <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--lz-text-muted)" }}>
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

                      {activity.project && projectId && (
                        <ProjectPreview
                          project={{
                            id: projectId,
                            _id: projectId,
                            name: activity.project.name || "Unknown Project",
                            description: activity.project.description || "",
                            image: activity.project.image || "/placeholder.svg",
                            languages: Array.isArray(activity.project.languages) ? activity.project.languages : [],
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
            } catch (err) {
              console.error("Error rendering activity:", activity, err);
              return null;
            }
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