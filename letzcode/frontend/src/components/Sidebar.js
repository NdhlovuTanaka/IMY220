import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getProjects } from "../api";

const Sidebar = ({ currentUser, onThemeToggle }) => {
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);

  useEffect(() => {
    fetchUserProjects();
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
      <nav style={{ padding: "1.5rem 0" }}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0.75rem 1.5rem",
              color: isActive(item.path) ? "var(--lz-primary)" : "var(--lz-text-secondary)",
              textDecoration: "none",
              background: isActive(item.path) ? "rgba(139, 92, 246, 0.1)" : "transparent",
              borderLeft: isActive(item.path) ? "3px solid var(--lz-primary)" : "3px solid transparent",
              transition: "all 0.2s ease",
              fontWeight: isActive(item.path) ? "600" : "400"
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
      </nav>

      <div style={{ borderTop: "1px solid var(--lz-border)", margin: "0 1rem" }} />

      <div style={{ padding: "1rem 0", flex: 1 }}>
        <button
          onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "0.75rem 1.5rem",
            background: "transparent",
            border: "none",
            color: "var(--lz-text-secondary)",
            fontSize: "0.875rem",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            cursor: "pointer",
          }}
        >
          <span>Recent Projects</span>
          <span style={{ transform: isProjectsExpanded ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}>
            ▼
          </span>
        </button>

        {isProjectsExpanded && (
          <div>
            {projects.length === 0 ? (
              <div
                style={{
                  padding: "1rem 1.5rem",
                  color: "var(--lz-text-muted)",
                  fontSize: "0.875rem",
                  fontStyle: "italic",
                }}
              >
                No projects yet
              </div>
            ) : (
              projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  style={{
                    display: "block",
                    padding: "0.5rem 1.5rem",
                    color: "var(--lz-text-secondary)",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    transition: "all 0.2s ease",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
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

      <div style={{ borderTop: "1px solid var(--lz-border)", margin: "0 1rem" }} />

      <div style={{ padding: "1rem 1.5rem" }}>
        <button
          onClick={onThemeToggle}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            padding: "0.75rem 1rem",
            background: "var(--lz-surface-elevated)",
            border: "1px solid var(--lz-border)",
            borderRadius: "6px",
            color: "var(--lz-text-primary)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--lz-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--lz-border)";
          }}
        >
          Toggle Theme
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;