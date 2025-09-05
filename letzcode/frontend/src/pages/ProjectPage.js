import React from "react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

const ProjectPage = ({ currentUser }) => {
  const { projectId } = useParams()
  const [project, setProject] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [checkInMessage, setCheckInMessage] = useState("")
  const [newVersion, setNewVersion] = useState("")
  const [viewingFile, setViewingFile] = useState(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState("")

  const [isOwner, setIsOwner] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMember, setIsMember] = useState(false)

  // Dummy project data
  const dummyProject = {
    id: projectId,
    name: "React Dashboard Pro",
    description:
      "A comprehensive admin dashboard built with React, TypeScript, and modern UI components. Features include user management, analytics, and real-time data visualization.",
    owner: "John Doe",
    members: ["John Doe", "Jane Smith", "Mike Johnson"],
    languages: ["JavaScript", "TypeScript", "CSS", "HTML"],
    type: "Web Application",
    version: "2.1.0",
    status: "checked-in",
    checkedOutBy: null,
    createdAt: "2024-07-15T10:00:00Z",
    lastUpdated: "2024-09-03T14:30:00Z",
    image: "./public/assets/images/icon.png",
    files: [
      {
        id: 1,
        name: "src/App.tsx",
        size: "2.4 KB",
        lastModified: "2024-09-03",
        uploadedBy: "John Doe",
        content: `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;`,
      },
      {
        id: 2,
        name: "src/components/Dashboard.tsx",
        size: "5.1 KB",
        lastModified: "2024-09-02",
        uploadedBy: "Jane Smith",
        content: `import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    // API call simulation
    const response = await fetch('/api/dashboard');
    const result = await response.json();
    setData(result);
  };
  
  return (
    <div className="dashboard">
      <h1>Analytics Dashboard</h1>
      {data && <Bar data={data} />}
    </div>
  );
};

export default Dashboard;`,
      },
      {
        id: 3,
        name: "src/utils/api.ts",
        size: "1.8 KB",
        lastModified: "2024-09-01",
        uploadedBy: "Mike Johnson",
        content: `const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`);
    return response.json();
  },
  
  post: async (endpoint: string, data: any) => {
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};`,
      },
      {
        id: 4,
        name: "package.json",
        size: "1.2 KB",
        lastModified: "2024-08-30",
        uploadedBy: "John Doe",
        content: `{
  "name": "react-dashboard-pro",
  "version": "2.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "chart.js": "^4.2.1",
    "react-chartjs-2": "^5.2.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}`,
      },
      {
        id: 5,
        name: "README.md",
        size: "3.5 KB",
        lastModified: "2024-08-28",
        uploadedBy: "John Doe",
        content: `# React Dashboard Pro

A comprehensive admin dashboard built with React, TypeScript, and modern UI components.

## Features

- Real-time analytics and data visualization
- User management system
- Responsive design
- Modern UI components
- TypeScript support

## Getting Started

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Start the development server: \`npm start\`
4. Open http://localhost:3000 to view it in the browser

## Project Structure

- \`src/components/\` - Reusable React components
- \`src/utils/\` - Utility functions and API clients
- \`src/styles/\` - CSS and styling files

## Contributing

Please read our contributing guidelines before submitting pull requests.`,
      },
    ],
    messages: [
      {
        id: 1,
        user: "John Doe",
        action: "check-in",
        message: "Added new analytics dashboard with real-time charts",
        version: "2.1.0",
        timestamp: "2024-09-03T14:30:00Z",
      },
      {
        id: 2,
        user: "Jane Smith",
        action: "check-in",
        message: "Fixed responsive layout issues on mobile devices",
        version: "2.0.5",
        timestamp: "2024-09-01T11:15:00Z",
      },
      {
        id: 3,
        user: "Mike Johnson",
        action: "check-in",
        message: "Implemented user authentication and role-based access",
        version: "2.0.0",
        timestamp: "2024-08-28T16:45:00Z",
      },
    ],
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProject(dummyProject)
      setNewVersion(dummyProject.version)
    }, 500)
  }, [projectId])

  const handleCheckOut = () => {
    setProject((prev) => ({
      ...prev,
      status: "checked-out",
      checkedOutBy: currentUser?.name || "Current User",
    }))
  }

  const handleCheckIn = () => {
    if (!checkInMessage.trim()) {
      alert("Please provide a check-in message")
      return
    }

    const newMessage = {
      id: project.messages.length + 1,
      user: currentUser?.name || "Current User",
      action: "check-in",
      message: checkInMessage,
      version: newVersion,
      timestamp: new Date().toISOString(),
    }

    setProject((prev) => ({
      ...prev,
      status: "checked-in",
      checkedOutBy: null,
      version: newVersion,
      lastUpdated: new Date().toISOString(),
      messages: [newMessage, ...prev.messages],
    }))

    setCheckInMessage("")
  }

  const handleViewFile = (file) => {
    setViewingFile(viewingFile?.id === file.id ? null : file)
  }

  const handleAddMember = () => {
    if (!newMemberEmail.trim()) {
      alert("Please enter a valid email address")
      return
    }

    setProject((prev) => ({
      ...prev,
      members: [...prev.members, newMemberEmail],
    }))

    setNewMemberEmail("")
    setShowAddMember(false)
    alert(`Member ${newMemberEmail} added successfully!`)
  }

  const handleDeleteFile = (fileId) => {
    if (isOwner || isAdmin || project.files.find((file) => file.id === fileId)?.uploadedBy === currentUser?.name) {
      setProject((prev) => ({
        ...prev,
        files: prev.files.filter((file) => file.id !== fileId),
      }))
      alert("File deleted successfully!")
    } else {
      alert("You don't have permission to delete this file.")
    }
  }

  const handleRemoveMember = (memberName) => {
    if (isOwner || isAdmin) {
      setProject((prev) => ({
        ...prev,
        members: prev.members.filter((member) => member !== memberName),
      }))
      alert(`Member ${memberName} removed successfully!`)
    } else {
      alert("You don't have permission to remove members.")
    }
  }

  const handleDeleteProject = () => {
    if (isOwner) {
      alert("Project deleted successfully!")
    } else {
      alert("You don't have permission to delete this project.")
    }
  }

  const canCheckOut = project?.status === "checked-in"
  const canCheckIn =
    project?.status === "checked-out" && project?.checkedOutBy === (currentUser?.name || "Current User")

  if (!project) {
    return (
      <main>
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--lz-muted)" }}>Loading project...</div>
      </main>
    )
  }

  return (
    <main>
      <div
        className="card"
        style={{
          marginBottom: "2rem",
          padding: "1.5rem",
          background: "var(--lz-surface)",
          border: "2px solid var(--lz-purple)",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(139, 92, 246, 0.1)",
        }}
      >
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              cursor: "pointer",
              padding: "0.5rem 1rem",
              background: isOwner ? "rgba(139, 92, 246, 0.1)" : "transparent",
              borderRadius: "6px",
              border: isOwner ? "1px solid var(--lz-purple)" : "1px solid transparent",
              transition: "all 0.2s ease",
            }}
          >
            <input
              type="checkbox"
              checked={isOwner}
              onChange={(e) => setIsOwner(e.target.checked)}
              style={{
                cursor: "pointer",
                width: "18px",
                height: "18px",
                accentColor: "var(--lz-purple)",
              }}
            />
            <span
              style={{
                color: "var(--lz-text)",
                fontWeight: isOwner ? "600" : "400",
                fontSize: "1rem",
              }}
            >
            Owner
            </span>
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              cursor: "pointer",
              padding: "0.5rem 1rem",
              background: isAdmin ? "rgba(139, 92, 246, 0.1)" : "transparent",
              borderRadius: "6px",
              border: isAdmin ? "1px solid var(--lz-purple)" : "1px solid transparent",
              transition: "all 0.2s ease",
            }}
          >
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              style={{
                cursor: "pointer",
                width: "18px",
                height: "18px",
                accentColor: "var(--lz-purple)",
              }}
            />
            <span
              style={{
                color: "var(--lz-text)",
                fontWeight: isAdmin ? "600" : "400",
                fontSize: "1rem",
              }}
            >
              Admin
            </span>
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              cursor: "pointer",
              padding: "0.5rem 1rem",
              background: isMember ? "rgba(139, 92, 246, 0.1)" : "transparent",
              borderRadius: "6px",
              border: isMember ? "1px solid var(--lz-purple)" : "1px solid transparent",
              transition: "all 0.2s ease",
            }}
          >
            <input
              type="checkbox"
              checked={isMember}
              onChange={(e) => setIsMember(e.target.checked)}
              style={{
                cursor: "pointer",
                width: "18px",
                height: "18px",
                accentColor: "var(--lz-purple)",
              }}
            />
            <span
              style={{
                color: "var(--lz-text)",
                fontWeight: isMember ? "600" : "400",
                fontSize: "1rem",
              }}
            >
              Member
            </span>
          </label>
        </div>
      </div>

      {/* Project Header */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "2rem" }}>
          <img
            src={project.image || "/placeholder.svg"}
            alt={project.name}
            style={{
              width: "200px",
              height: "150px",
              borderRadius: "8px",
              objectFit: "cover",
            }}
          />

          <div style={{ flex: 1 }}>
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}
            >
              <div>
                <h1 style={{ margin: "0 0 0.5rem 0" }}>{project.name}</h1>
                <p style={{ color: "var(--lz-muted)", margin: "0 0 1rem 0" }}>
                  by {project.owner} • v{project.version}
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span className={project.status === "checked-out" ? "status-out" : "status-in"}>
                  {project.status === "checked-out" ? "🔒 Checked Out" : "✅ Available"}
                </span>
                {project.status === "checked-out" && (
                  <span style={{ fontSize: "0.875rem", color: "var(--lz-muted)" }}>by {project.checkedOutBy}</span>
                )}
              </div>
            </div>

            <p style={{ marginBottom: "1rem" }}>{project.description}</p>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              {project.languages.map((lang, index) => (
                <span
                  key={index}
                  style={{
                    background: "var(--lz-purple)",
                    color: "var(--lz-white)",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                  }}
                >
                  #{lang}
                </span>
              ))}
            </div>

            <div style={{ fontSize: "0.875rem", color: "var(--lz-muted)" }}>
              <div>Type: {project.type}</div>
              <div>Members: {project.members.join(", ")}</div>
              <div>Created: {new Date(project.createdAt).toLocaleDateString()}</div>
              <div>Last Updated: {new Date(project.lastUpdated).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {/* Check-out/Check-in buttons for members */}
          {isMember && canCheckOut && (
            <button
              onClick={handleCheckOut}
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                background: "var(--lz-blue)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.9rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              📤 Check Out Project
            </button>
          )}

          {isMember && canCheckIn && (
            <div style={{ display: "flex", gap: "1rem", alignItems: "end", flex: 1 }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="checkin-message">Check-in Message</label>
                <input
                  type="text"
                  id="checkin-message"
                  value={checkInMessage}
                  onChange={(e) => setCheckInMessage(e.target.value)}
                  placeholder="Describe your changes..."
                />
              </div>
              <div>
                <label htmlFor="new-version">Version</label>
                <input
                  type="text"
                  id="new-version"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  style={{ width: "100px" }}
                />
              </div>
              <button
                onClick={handleCheckIn}
                className="btn-success"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  background: "var(--lz-green)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                📥 Check In
              </button>
            </div>
          )}

          {/* Add Files button - available to everyone as requested */}
          <button
            className="btn-secondary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              background: "var(--lz-purple)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            📁 Add Files
          </button>

          {/* Owner-only buttons */}
          {isOwner && (
            <>
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="btn-outline"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  background: "transparent",
                  color: "var(--lz-blue)",
                  border: "2px solid var(--lz-blue)",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Add Member
              </button>

              <button
                onClick={handleDeleteProject}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  background: "var(--lz-red)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                🗑️ Delete Project
              </button>
            </>
          )}

          {/* Admin and Owner can remove members */}
          {(isOwner || isAdmin) && (
            <button
              onClick={() => handleRemoveMember("Jane Smith")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                background: "var(--lz-orange)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.9rem",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              👤➖ Remove Member
            </button>
          )}

          <button
            className="btn-outline"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              background: "transparent",
              color: "var(--lz-muted)",
              border: "2px solid var(--lz-muted)",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            💾 Download Files
          </button>
        </div>

        {showAddMember && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "var(--lz-card-bg)",
              borderRadius: "6px",
              border: "1px solid var(--lz-border)",
            }}
          >
            <h4 style={{ margin: "0 0 1rem 0" }}>Add New Member</h4>
            <div style={{ display: "flex", gap: "1rem", alignItems: "end" }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="member-email">Member Email</label>
                <input
                  type="email"
                  id="member-email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Enter member's email address..."
                />
              </div>
              <button
                onClick={handleAddMember}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "var(--lz-green)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Add
              </button>
              <button
                onClick={() => setShowAddMember(false)}
                style={{
                  padding: "0.75rem 1rem",
                  background: "transparent",
                  color: "var(--lz-muted)",
                  border: "1px solid var(--lz-muted)",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid #1d1d27" }}>
          {["overview", "files", "messages"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab ? "2px solid var(--lz-purple)" : "2px solid transparent",
                padding: "0.75rem 0",
                color: activeTab === tab ? "var(--lz-white)" : "var(--lz-muted)",
                textTransform: "capitalize",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
            <div className="card">
              <h3 style={{ marginBottom: "1rem" }}>Project Details</h3>
              <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.9rem" }}>
                <div>
                  <strong>Name:</strong> {project.name}
                </div>
                <div>
                  <strong>Description:</strong> {project.description}
                </div>
                <div>
                  <strong>Type:</strong> {project.type}
                </div>
                <div>
                  <strong>Version:</strong> {project.version}
                </div>
                <div>
                  <strong>Status:</strong> {project.status}
                </div>
                <div>
                  <strong>Owner:</strong> {project.owner}
                </div>
                <div>
                  <strong>Members:</strong> {project.members.join(", ")}
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: "1rem" }}>Quick Stats</h3>
              <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.9rem" }}>
                <div>📁 {project.files.length} files</div>
                <div>💬 {project.messages.length} check-ins</div>
                <div>👥 {project.members.length} members</div>
                <div>🏷️ {project.languages.length} languages</div>
              </div>
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === "files" && (
          <div className="card">
            <h3 style={{ marginBottom: "1rem" }}>Project Files</h3>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              {project.files.map((file) => (
                <div key={file.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.75rem",
                      background: "var(--lz-card-bg)",
                      borderRadius: "6px",
                      border: "1px solid var(--lz-border)",
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>📄 {file.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--lz-muted)" }}>
                        {file.size} • Modified {file.lastModified} • Uploaded by {file.uploadedBy}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleViewFile(file)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem 1rem",
                          fontSize: "0.8rem",
                          background: viewingFile?.id === file.id ? "var(--lz-purple)" : "transparent",
                          color: viewingFile?.id === file.id ? "white" : "var(--lz-blue)",
                          border: `1px solid ${viewingFile?.id === file.id ? "var(--lz-purple)" : "var(--lz-blue)"}`,
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        👁️ {viewingFile?.id === file.id ? "Hide" : "View"}
                      </button>

                      {(isOwner || isAdmin || file.uploadedBy === currentUser?.name) && (
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.5rem 1rem",
                            fontSize: "0.8rem",
                            background: "var(--lz-red)",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {viewingFile?.id === file.id && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        padding: "1rem",
                        background: "var(--lz-surface)",
                        borderRadius: "6px",
                        border: "1px solid var(--lz-border)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <h4 style={{ margin: 0, fontSize: "0.9rem" }}>📄 {file.name}</h4>
                        <button
                          onClick={() => setViewingFile(null)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--lz-muted)",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={file.content}
                        style={{
                          width: "100%",
                          height: "300px",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.8rem",
                          background: "var(--lz-bg)",
                          color: "var(--lz-text)",
                          border: "1px solid var(--lz-border)",
                          borderRadius: "4px",
                          padding: "0.75rem",
                          resize: "vertical",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="card">
            <h3 style={{ marginBottom: "1rem" }}>Check-in Messages</h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              {project.messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    padding: "1rem",
                    background: "#161622",
                    borderRadius: "8px",
                    borderLeft: "4px solid var(--lz-purple)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div>
                      <strong>{message.user}</strong> {message.action === "check-in" ? "checked in" : "checked out"}
                      <span
                        style={{
                          marginLeft: "0.5rem",
                          padding: "0.125rem 0.375rem",
                          background: "var(--lz-purple)",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                        }}
                      >
                        v{message.version}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "var(--lz-muted)" }}>
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontStyle: "italic" }}>"{message.message}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default ProjectPage
