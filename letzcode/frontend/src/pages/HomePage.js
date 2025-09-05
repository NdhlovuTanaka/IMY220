import React from "react"
import { useState } from "react"
import Feed from "../components/Feed"
import SearchInput from "../components/SearchInput"
import CreateProjectForm from "../components/project/CreateProjectForm"

const HomePage = ({ currentUser }) => {
  const [activeFeed, setActiveFeed] = useState("local")
  const [searchResults, setSearchResults] = useState(null)
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false)

  const handleSearch = (searchTerm) => {
    // Simulate search functionality
    console.log("Searching for:", searchTerm)
    // For now, just show a message
    setSearchResults(`Search results for "${searchTerm}" - Feature coming soon!`)
  }

  const handleCreateProject = () => {
    setShowCreateProjectForm(true)
  }

  const handleCancelCreateProject = () => {
    setShowCreateProjectForm(false)
  }

  const handleSaveProject = (projectData) => {
    console.log("Project Created:", projectData)
    setShowCreateProjectForm(false)
  }

  return (
    <main>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ marginBottom: "1rem" }}>Welcome back, {currentUser?.name || "Developer"}!</h1>

        <SearchInput onSearch={handleSearch} />

        {searchResults && (
          <div className="card" style={{ marginBottom: "1rem", background: "#1a1a2e" }}>
            <p style={{ margin: 0, color: "var(--lz-muted)" }}>{searchResults}</p>
            <button
              onClick={() => setSearchResults(null)}
              style={{
                marginTop: "0.5rem",
                background: "transparent",
                border: "1px solid var(--lz-muted)",
                padding: "0.25rem 0.5rem",
                fontSize: "0.875rem",
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            padding: "1rem",
            background: "var(--lz-surface)",
            borderRadius: "12px",
            border: "1px solid var(--lz-border)",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: "1.25rem",
                color: "var(--lz-text-primary)",
              }}
            >
              Your Projects
            </h2>
            <p
              style={{
                margin: 0,
                color: "var(--lz-text-secondary)",
                fontSize: "0.875rem",
              }}
            >
              Create and manage your code repositories
            </p>
          </div>
          <button
            onClick={handleCreateProject}
            style={{
              background: "linear-gradient(135deg, var(--lz-primary) 0%, #3b82f6 100%)",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 12px rgba(74, 144, 226, 0.3)",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)"
              e.target.style.boxShadow = "0 6px 20px rgba(74, 144, 226, 0.4)"
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)"
              e.target.style.boxShadow = "0 4px 12px rgba(74, 144, 226, 0.3)"
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>+</span>
            New Project
          </button>
        </div>

        {showCreateProjectForm && (
          <div
            style={{
              marginBottom: "2rem",
              background: "var(--lz-surface)",
              borderRadius: "12px",
              border: "1px solid var(--lz-border)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "1rem 1.5rem",
                borderBottom: "1px solid var(--lz-border)",
                background: "var(--lz-background)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "var(--lz-text-primary)",
                  fontSize: "1.1rem",
                }}
              >
                Create New Project
              </h3>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <CreateProjectForm onSave={handleSaveProject} onCancel={handleCancelCreateProject} />
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
          <button
            onClick={() => setActiveFeed("local")}
            style={{
              background: activeFeed === "local" ? "var(--lz-primary)" : "transparent",
              border: "1px solid var(--lz-primary)",
              color: activeFeed === "local" ? "white" : "var(--lz-text-secondary)",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            My Feed
          </button>
          <button
            onClick={() => setActiveFeed("global")}
            style={{
              background: activeFeed === "global" ? "var(--lz-primary)" : "transparent",
              border: "1px solid var(--lz-primary)",
              color: activeFeed === "global" ? "white" : "var(--lz-text-secondary)",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Global Feed
          </button>
        </div>

        <Feed feedType={activeFeed} currentUser={currentUser} />
      </div>
    </main>
  )
}

export default HomePage
