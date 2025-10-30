import React from "react";
import { Link } from "react-router-dom";

const ProjectPreview = ({ project }) => {
  if (!project) return null;

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Unknown date";
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Unknown date";
    }
  };

  // Safely access nested properties
  const projectId = project.id || project._id || "";
  const projectName = project.name || "Unnamed Project";
  const projectDescription = project.description || "No description";
  const projectImage = project.image || "/placeholder.svg";
  const projectLanguages = Array.isArray(project.languages) ? project.languages : [];
  const projectType = project.type || "Unknown";
  const projectStatus = project.status || "checked-in";
  const projectCreatedAt = project.createdAt || new Date().toISOString();
  
  // Handle owner - it might be an object or just a string
  const ownerName = typeof project.owner === 'object' 
    ? (project.owner?.name || project.owner?.username || "Unknown")
    : (project.owner || "Unknown");

  return (
    <div 
      className="card" 
      style={{
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", gap: "1rem" }}>
        <img
          src={projectImage}
          alt={projectName}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "8px",
            objectFit: "cover",
            background: "var(--lz-surface)",
          }}
          onError={(e) => {
            e.target.src = "/placeholder.svg";
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            to={`/project/${projectId}`}
            style={{
              color: "var(--lz-text-primary)",
              textDecoration: "none",
              fontSize: "1.2rem",
              fontWeight: "600",
              display: "block",
              marginBottom: "0.5rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--lz-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--lz-text-primary)";
            }}
          >
            {projectName}
          </Link>

          <p style={{ 
            color: "var(--lz-text-secondary)", 
            margin: "0 0 0.5rem 0", 
            fontSize: "0.9rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
          }}>
            {projectDescription}
          </p>

          {projectLanguages.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              {projectLanguages.slice(0, 3).map((lang, index) => (
                <span
                  key={index}
                  style={{
                    background: "var(--lz-primary)",
                    color: "white",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                  }}
                >
                  #{lang}
                </span>
              ))}
              {projectLanguages.length > 3 && (
                <span
                  style={{
                    background: "var(--lz-surface)",
                    color: "var(--lz-text-muted)",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                  }}
                >
                  +{projectLanguages.length - 3} more
                </span>
              )}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.875rem",
              color: "var(--lz-text-muted)",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <span>📁 {projectType}</span>
              <span>👤 {ownerName}</span>
              <span
                style={{
                  color: projectStatus === "checked-out" ? "var(--lz-orange)" : "var(--lz-green)",
                  fontWeight: "600",
                }}
              >
                {projectStatus === "checked-out" ? "🔒 Checked Out" : "✅ Available"}
              </span>
            </div>
            <span>📅 {formatDate(projectCreatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPreview;