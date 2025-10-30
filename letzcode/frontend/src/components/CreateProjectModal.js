import React, { useState } from "react";
import { createProject } from "../api";
import { showToast } from "../utils/toast";

const CreateProjectModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "Web Application",
    languages: "",
    version: "1.0.0",
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectTypes = [
    "Web Application",
    "Mobile Application",
    "Desktop Application",
    "Library",
    "Framework",
    "API",
    "Game",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      showToast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    const projectData = {
      ...formData,
      languages: formData.languages
        .split(",")
        .map((lang) => lang.trim())
        .filter((lang) => lang),
    };

    // Note: In a real app, you'd upload files here
    // For now, we're just tracking file metadata
    if (files.length > 0) {
      projectData.filesInfo = files.map(f => ({
        name: f.name,
        size: `${(f.size / 1024).toFixed(2)} KB`
      }));
    }

    const data = await createProject(projectData);

    setIsSubmitting(false);

    if (data.ok) {
      showToast.success("Project created successfully");
      onSuccess(data.project);
      onClose();
    } else {
      showToast.error(data.message || "Failed to create project");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "2rem",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", color: "var(--lz-text-primary)" }}>Create New Project</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.5rem",
              color: "var(--lz-text-muted)",
              cursor: "pointer",
              padding: "0.5rem",
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="name" style={{ display: "block", marginBottom: "0.5rem", color: "var(--lz-text-primary)", fontWeight: "500" }}>
              Project Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="My Awesome Project"
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "var(--lz-surface)",
                border: "1px solid var(--lz-border)",
                borderRadius: "6px",
                color: "var(--lz-text-primary)",
                fontSize: "1rem",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="description" style={{ display: "block", marginBottom: "0.5rem", color: "var(--lz-text-primary)", fontWeight: "500" }}>
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              required
              placeholder="Describe what your project does..."
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "var(--lz-surface)",
                border: "1px solid var(--lz-border)",
                borderRadius: "6px",
                color: "var(--lz-text-primary)",
                fontSize: "1rem",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label htmlFor="type" style={{ display: "block", marginBottom: "0.5rem", color: "var(--lz-text-primary)", fontWeight: "500" }}>
                Project Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "var(--lz-surface)",
                  border: "1px solid var(--lz-border)",
                  borderRadius: "6px",
                  color: "var(--lz-text-primary)",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="version" style={{ display: "block", marginBottom: "0.5rem", color: "var(--lz-text-primary)", fontWeight: "500" }}>
                Version
              </label>
              <input
                type="text"
                id="version"
                name="version"
                value={formData.version}
                onChange={handleChange}
                placeholder="1.0.0"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "var(--lz-surface)",
                  border: "1px solid var(--lz-border)",
                  borderRadius: "6px",
                  color: "var(--lz-text-primary)",
                  fontSize: "1rem",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="languages" style={{ display: "block", marginBottom: "0.5rem", color: "var(--lz-text-primary)", fontWeight: "500" }}>
              Programming Languages (comma-separated)
            </label>
            <input
              type="text"
              id="languages"
              name="languages"
              value={formData.languages}
              onChange={handleChange}
              placeholder="JavaScript, Python, CSS"
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "var(--lz-surface)",
                border: "1px solid var(--lz-border)",
                borderRadius: "6px",
                color: "var(--lz-text-primary)",
                fontSize: "1rem",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="files" style={{ display: "block", marginBottom: "0.5rem", color: "var(--lz-text-primary)", fontWeight: "500" }}>
              Project Files (optional)
            </label>
            <input
              type="file"
              id="files"
              multiple
              onChange={handleFileChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "var(--lz-surface)",
                border: "2px dashed var(--lz-border)",
                borderRadius: "6px",
                color: "var(--lz-text-primary)",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            />
            {files.length > 0 && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "var(--lz-text-muted)" }}>
                {files.length} file(s) selected
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: "0.75rem 1.5rem",
                background: isSubmitting ? "var(--lz-surface)" : "var(--lz-primary)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: "0.75rem 1.5rem",
                background: "transparent",
                color: "var(--lz-text-secondary)",
                border: "1px solid var(--lz-border)",
                borderRadius: "6px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;