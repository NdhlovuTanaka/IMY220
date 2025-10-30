import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { globalSearch, searchProjects } from "../api";
import { showToast } from "../utils/toast";

const SearchPage = ({ currentUser }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({ users: [], projects: [] });
  const [filters, setFilters] = useState({ type: 'all', language: '' });
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const projectTypes = [
    "all",
    "Web Application",
    "Mobile Application",
    "Desktop Application",
    "Library",
    "Framework",
    "API",
    "Game",
    "Other"
  ];

  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, [initialQuery]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    if (!query.trim() || query.trim().length < 2) {
      showToast.error("Please enter at least 2 characters");
      return;
    }

    setIsLoading(true);

    if (activeTab === "all") {
      const data = await globalSearch(query.trim());
      if (data.ok) {
        setResults(data);
      } else {
        showToast.error("Search failed");
      }
    } else if (activeTab === "projects") {
      const data = await searchProjects(query.trim(), {
        type: filters.type !== 'all' ? filters.type : null,
        language: filters.language || null
      });
      if (data.ok) {
        setResults({ users: [], projects: data.projects });
      } else {
        showToast.error("Search failed");
      }
    } else {
      // User search handled by friends page
      const data = await globalSearch(query.trim());
      if (data.ok) {
        setResults({ users: data.users, projects: [] });
      }
    }

    setIsLoading(false);
    setSearchParams({ q: query });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem", fontSize: "2rem", color: "var(--lz-text-primary)" }}>
        Search
      </h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, users, or languages..."
            style={{
              flex: 1,
              padding: "0.75rem 1rem",
              background: "var(--lz-surface)",
              border: "1px solid var(--lz-border)",
              borderRadius: "6px",
              color: "var(--lz-text-primary)",
              fontSize: "1rem"
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "0.75rem 2rem",
              background: "var(--lz-primary)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontWeight: "600"
            }}
          >
            {isLoading ? "Searching..." : "🔍 Search"}
          </button>
        </div>

        {/* Filters for Projects */}
        {activeTab === "projects" && (
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                background: "var(--lz-surface-elevated)",
                border: "1px solid var(--lz-border)",
                borderRadius: "6px",
                color: "var(--lz-text-primary)",
                cursor: "pointer"
              }}
            >
              {projectTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              placeholder="Filter by language..."
              style={{
                padding: "0.5rem 1rem",
                background: "var(--lz-surface-elevated)",
                border: "1px solid var(--lz-border)",
                borderRadius: "6px",
                color: "var(--lz-text-primary)",
                flex: "0 0 200px"
              }}
            />
          </div>
        )}
      </form>

      {/* Tabs */}
      <div style={{ marginBottom: "2rem", borderBottom: "2px solid var(--lz-border)" }}>
        <div style={{ display: "flex", gap: "1rem" }}>
          {["all", "projects", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (query) handleSearch();
              }}
              style={{
                padding: "0.75rem 1.5rem",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === tab ? "3px solid var(--lz-primary)" : "3px solid transparent",
                color: activeTab === tab ? "var(--lz-primary)" : "var(--lz-text-secondary)",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "-2px",
                textTransform: "capitalize"
              }}
            >
              {tab} {tab === "all" ? `(${results.users.length + results.projects.length})` : 
                     tab === "projects" ? `(${results.projects.length})` : 
                     `(${results.users.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--lz-text-muted)" }}>
          Searching...
        </div>
      ) : query.trim() === "" ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
          <h3 style={{ marginBottom: "0.5rem", color: "var(--lz-text-primary)" }}>
            Start Searching
          </h3>
          <p style={{ color: "var(--lz-text-muted)" }}>
            Search for projects, users, or programming languages
          </p>
        </div>
      ) : (
        <>
          {/* Projects Results */}
          {(activeTab === "all" || activeTab === "projects") && results.projects.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ marginBottom: "1rem", color: "var(--lz-text-primary)" }}>
                Projects ({results.projects.length})
              </h2>
              <div style={{ display: "grid", gap: "1rem" }}>
                {results.projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/project/${project.id}`}
                    className="card"
                    style={{
                      display: "flex",
                      gap: "1.5rem",
                      textDecoration: "none",
                      transition: "all 0.2s"
                    }}
                  >
                    <img
                      src={project.image || "/placeholder.svg"}
                      alt={project.name}
                      style={{
                        width: "120px",
                        height: "90px",
                        objectFit: "cover",
                        borderRadius: "8px"
                      }}
                      onError={(e) => { e.target.src = "/placeholder.svg"; }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--lz-text-primary)" }}>
                        {project.name}
                      </h3>
                      <p style={{ margin: "0 0 0.75rem 0", color: "var(--lz-text-secondary)", fontSize: "0.9rem" }}>
                        {project.description}
                      </p>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                        {project.languages?.slice(0, 3).map((lang, index) => (
                          <span
                            key={index}
                            style={{
                              padding: "0.25rem 0.5rem",
                              background: "var(--lz-primary)",
                              color: "white",
                              borderRadius: "4px",
                              fontSize: "0.75rem"
                            }}
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                      <div style={{ color: "var(--lz-text-muted)", fontSize: "0.875rem" }}>
                        by {project.owner?.name} • {project.type} • v{project.version}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span
                        style={{
                          padding: "0.5rem 1rem",
                          background: project.status === "checked-out" ? "var(--lz-orange)" : "var(--lz-green)",
                          color: "white",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "600"
                        }}
                      >
                        {project.status === "checked-out" ? "🔒 Checked Out" : "✅ Available"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Users Results */}
          {(activeTab === "all" || activeTab === "users") && results.users.length > 0 && (
            <div>
              <h2 style={{ marginBottom: "1rem", color: "var(--lz-text-primary)" }}>
                Users ({results.users.length})
              </h2>
              <div style={{ display: "grid", gap: "1rem" }}>
                {results.users.map((user) => (
                  <Link
                    key={user.id}
                    to={`/profile/${user.id}`}
                    className="card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      textDecoration: "none",
                      transition: "all 0.2s"
                    }}
                  >
                    <img
                      src={user.profileImage || "/placeholder.svg"}
                      alt={user.name}
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        objectFit: "cover"
                      }}
                      onError={(e) => { e.target.src = "/placeholder.svg"; }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: "0 0 0.25rem 0", color: "var(--lz-text-primary)" }}>
                        {user.name}
                      </h3>
                      <p style={{ margin: "0 0 0.25rem 0", color: "var(--lz-text-muted)", fontSize: "0.875rem" }}>
                        @{user.username}
                      </p>
                      {user.work && (
                        <p style={{ margin: 0, color: "var(--lz-text-secondary)", fontSize: "0.875rem" }}>
                          {user.work}
                        </p>
                      )}
                    </div>
                    {user.friendStatus === 'friends' && (
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          background: "var(--lz-primary)",
                          color: "white",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "600"
                        }}
                      >
                        Friend
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {results.users.length === 0 && results.projects.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
              <h3 style={{ marginBottom: "0.5rem", color: "var(--lz-text-primary)" }}>
                No results found
              </h3>
              <p style={{ color: "var(--lz-text-muted)" }}>
                Try different keywords or filters
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default SearchPage;