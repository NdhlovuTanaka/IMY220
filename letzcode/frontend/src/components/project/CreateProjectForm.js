import React from "react";
import { useState } from "react"

const CreateProjectForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    languages: "",
    version: "1.0.0",
  })
  const [files, setFiles] = useState([])

  const projectTypes = [
    "Web Application",
    "Mobile Application",
    "Desktop Application",
    "Library",
    "Framework",
    "API",
    "Game",
    "Other",
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    const projectData = {
      ...formData,
      languages: formData.languages
        .split(",")
        .map((lang) => lang.trim())
        .filter((lang) => lang),
      files: files,
    }
    onSave(projectData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files))
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: "1.5rem" }}>Create New Project</h3>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="project-name">Project Name</label>
          <input
            type="text"
            id="project-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="My Awesome Project"
          />
        </div>

        <div>
          <label htmlFor="project-description">Description</label>
          <textarea
            id="project-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            required
            placeholder="Describe what your project does..."
          />
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="project-type">Project Type</label>
            <select id="project-type" name="type" value={formData.type} onChange={handleChange} required>
              <option value="">Select a type</option>
              {projectTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="project-version">Version</label>
            <input
              type="text"
              id="project-version"
              name="version"
              value={formData.version}
              onChange={handleChange}
              required
              placeholder="1.0.0"
            />
          </div>
        </div>

        <div>
          <label htmlFor="project-languages">Programming Languages (comma-separated)</label>
          <input
            type="text"
            id="project-languages"
            name="languages"
            value={formData.languages}
            onChange={handleChange}
            placeholder="JavaScript, Python, CSS"
          />
        </div>

        <div>
          <label htmlFor="project-files">Project Files</label>
          <input
            type="file"
            id="project-files"
            multiple
            onChange={handleFileChange}
            style={{
              padding: "0.5rem",
              border: "2px dashed var(--lz-purple)",
              borderRadius: "8px",
              background: "transparent",
            }}
          />
          {files.length > 0 && (
            <p style={{ color: "var(--lz-muted)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              {files.length} file(s) selected
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
          <button type="submit">Create Project</button>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: "transparent", border: "1px solid var(--lz-muted)" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateProjectForm
