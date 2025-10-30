import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getProjects } from "../api";

const Sidebar = ({ currentUser, onThemeToggle }) => {
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);

  useEffect(() => {
    fetchUserProjects();
    
    // Refresh projects every 30 seconds to catch new ones
    const interval = setInterval(fetchUserProjects, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserProjects = async () => {
    const data = await getProjects("my");
    if (data.ok) {
      setProjects(data.projects.slice(0, 5));
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: "/home", label: "Home" },
    { path: `/profile/${currentUser?.id}`, label: "Profile" },
    { path: "/friends", label: "Friends" },
    { path: "/history", label: "History" },
  ];

  return (
    <aside
      style={{
        width: "260px",
        height: "calc(100vh - 64px)",
        position: "sticky",
        top: "64px",
        background: "var(--lz-surface)",
        borderRight: "1px solid var(--lz-border)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      <nav style={{ padding: "1.5rem", flex: 1 }}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: "block",
              padding: "0.75rem 1rem",
              marginBottom: "0.5rem",
              background: isActive(item.path) ? "var(--lz-primary)" : "transparent",
              color: isActive(item.path) ? "white" : "var(--lz-text-primary)",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "0.95rem",
              fontWeight: isActive(item.path) ? "600" : "400",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = "var(--lz-surface-elevated)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {item.label}
          </Link>
        ))}

        <div style={{ marginTop: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 1rem",
              color: "var(--lz-text-primary)",
              fontWeight: "600",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
            onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
          >
            <span>RECENT PROJECTS</span>
            <span style={{ fontSize: "1.2rem" }}>{isProjectsExpanded ? "▼" : "▶"}</span>
          </div>

          {isProjectsExpanded && (
            <div style={{ marginTop: "0.5rem" }}>
              {projects.length === 0 ? (
                <div style={{ padding: "0.75rem 1rem", color: "var(--lz-text-muted)", fontSize: "0.875rem", fontStyle: "italic" }}>
                  No projects yet
                </div>
              ) : (
                projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/project/${project.id}`}
                    style={{
                      display: "block",
                      padding: "0.75rem 1rem",
                      marginBottom: "0.25rem",
                      color: "var(--lz-text-secondary)",
                      textDecoration: "none",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--lz-surface-elevated)";
                      e.currentTarget.style.color = "var(--lz-text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--lz-text-secondary)";
                    }}
                  >
                    {project.name}
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </nav>

      <div style={{ padding: "1.5rem", borderTop: "1px solid var(--lz-border)" }}>
        <button
          onClick={onThemeToggle}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: "var(--lz-surface-elevated)",
            border: "1px solid var(--lz-border)",
            borderRadius: "6px",
            color: "var(--lz-text-primary)",
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--lz-primary)";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--lz-surface-elevated)";
            e.currentTarget.style.color = "var(--lz-text-primary)";
          }}
        >
          Toggle Theme
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;