import React from "react";
import { Link } from "react-router-dom";

const ProjectPreview = ({ project }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="card">
      <div style={{ display: "flex", gap: "1rem" }}>
        <img
          src={project.image || "/placeholder.svg?height=80&width=80&query=code+project"}
          alt={project.name}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "8px",
            objectFit: "cover",
          }}
        />

        <div style={{ flex: 1 }}>
          <Link
            to={`/project/${project.id}`}
            style={{
              color: "var(--lz-text-primary)",
              textDecoration: "none",
              fontSize: "1.2rem",
              fontWeight: "600",
            }}
          >
            {project.name}
          </Link>

          <p style={{ color: "var(--lz-text-secondary)", margin: "0.5rem 0", fontSize: "0.9rem" }}>
            {project.description}
          </p>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            {project.languages?.map((lang, index) => (
              <span
                key={index}
                style={{
                  background: "var(--lz-purple)",
                  color: "var(--lz-white)",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                #{lang}
              </span>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.875rem",
              color: "var(--lz-text-muted)",
            }}
          >
            <span>by {project.owner}</span>
            <span>{formatDate(project.createdAt)}</span>
            <span className={project.status === "checked-out" ? "status-out" : "status-in"}>
              {project.status === "checked-out" ? "🔒 Checked Out" : "✅ Available"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPreview;