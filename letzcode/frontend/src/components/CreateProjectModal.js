import React, { useState } from "react";
import { createProject, uploadProjectImage } from "../api";
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
  const [projectImage, setProjectImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("/placeholder.svg");
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast.error("Image must be less than 5MB");
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast.error("Please select an image file");
      return;
    }

    setProjectImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
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

    if (files.length > 0) {
      projectData.filesInfo = files.map(f => ({
        name: f.name,
        size: `${(f.size / 1024).toFixed(2)} KB`
      }));
    }

    // Create project first
    const data = await createProject(projectData);

    if (data.ok) {
      // If project image is provided, upload it
      if (projectImage) {
        const imageData = await uploadProjectImage(data.project.id || data.project._id, projectImage);
        if (imageData.ok) {
          data.project.image = imageData.imageUrl;
        }
      }

      showToast.success("Project created successfully");
      onSuccess(data.project);
      onClose();
    } else {
      showToast.error(data.message || "Failed to create project");
    }

    setIsSubmitting(false);
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
        style={{
          background: "var(--lz-surface-elevated)",
          borderRadius: "8px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          padding: "2rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, color: "var(--lz-text-primary)" }}>Create New Project</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "var(--lz-text-muted)",
              padding: "0.25rem 0.5rem",
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Project Image Upload */}
          <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <div style={{ marginBottom: "1rem" }}>
              <img
                src={imagePreview}
                alt="Project preview"
                style={{
                  width: "200px",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "2px solid var(--lz-border)"
                }}
                onError={(e) => {
                  e.target.src = "/placeholder.svg";
                }}
              />
            </div>
            <label
              htmlFor="project-image-upload"
              style={{
                padding: "0.5rem 1rem",
                background: "var(--lz-primary)",
                color: "white",
                borderRadius: "6px",
                cursor: "pointer",
                display: "inline-block",
                fontSize: "0.875rem"
              }}
            >
              🖼️ Choose Project Image
            </label>
            <input
              id="project-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <p style={{ 
              marginTop: "0.5rem", 
              fontSize: "0.75rem", 
              color: "var(--lz-text-muted)" 
            }}>
              Max 5MB • JPG, PNG, GIF, WebP
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
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

          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="description" style={{ display: "block", marginBottom: "0.5rem", color: "var(--lz-text-primary)", fontWeight: "500" }}>
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="3"
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label htmlFor="type" style={{ display: "block", marginBottom: "0.5rem", color: "var(--lz-text-primary)", fontWeight: "500" }}>
                Project Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
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

          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="languages" style={{ display: "block", marginBottom: "0.5rem", color: "var(--lz-text-primary)", fontWeight: "500" }}>
              Programming Languages
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
              style={{
                flex: 1,
                padding: "0.75rem 1.5rem",
                background: "transparent",
                color: "var(--lz-text-primary)",
                border: "1px solid var(--lz-border)",
                borderRadius: "6px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
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