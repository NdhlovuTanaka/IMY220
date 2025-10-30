import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getUserProfile, getMutualData, removeFriend, getProjects } from "../api";
import { showToast } from "../utils/toast";

const FriendProfilePage = ({ currentUser }) => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const [friend, setFriend] = useState(null);
  const [mutualFriends, setMutualFriends] = useState([]);
  const [mutualProjects, setMutualProjects] = useState([]);
  const [friendProjects, setFriendProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFriendData();
  }, [friendId]);

  const fetchFriendData = async () => {
    setIsLoading(true);

    // Fetch friend's profile
    const profileData = await getUserProfile(friendId);
    if (profileData.ok) {
      setFriend(profileData.user);
    } else {
      showToast.error("Failed to load friend profile");
      navigate("/friends");
      return;
    }

    // Fetch mutual data
    const mutualData = await getMutualData(friendId);
    if (mutualData.ok) {
      setMutualFriends(mutualData.mutualFriends);
      setMutualProjects(mutualData.mutualProjects);
    }

    // Fetch friend's projects
    const projectsData = await getProjects(null, friendId);
    if (projectsData.ok) {
      setFriendProjects(projectsData.projects);
    }

    setIsLoading(false);
  };

  const handleRemoveFriend = async () => {
    const confirmed = window.confirm(`Are you sure you want to remove ${friend.name} from your friends?`);
    if (!confirmed) return;

    const data = await removeFriend(friendId);
    if (data.ok) {
      showToast.success("Friend removed");
      navigate("/friends");
    } else {
      showToast.error(data.message || "Failed to remove friend");
    }
  };

  if (isLoading) {
    return (
      <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--lz-text-muted)" }}>
          Loading profile...
        </div>
      </main>
    );
  }

  if (!friend) {
    return (
      <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <h3 style={{ marginBottom: "0.5rem", color: "var(--lz-text-primary)" }}>Friend not found</h3>
          <Link to="/friends" style={{ color: "var(--lz-primary)" }}>
            Back to Friends
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Back Button */}
      <Link
        to="/friends"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          color: "var(--lz-text-secondary)",
          textDecoration: "none",
          fontSize: "0.9rem"
        }}
      >
        ← Back to Friends
      </Link>

      {/* Profile Header */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "start", gap: "2rem" }}>
          <img
            src={friend.profileImage || "/placeholder.svg"}
            alt={friend.name}
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover"
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
              <div>
                <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", color: "var(--lz-text-primary)" }}>
                  {friend.name}
                </h1>
                <p style={{ margin: "0 0 0.5rem 0", color: "var(--lz-text-muted)", fontSize: "1.1rem" }}>
                  @{friend.username}
                </p>
                {friend.work && (
                  <p style={{ margin: "0", color: "var(--lz-text-secondary)" }}>
                    {friend.work}
                  </p>
                )}
              </div>
              <button
                onClick={handleRemoveFriend}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "transparent",
                  color: "#ef4444",
                  border: "1px solid #ef4444",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                Remove Friend
              </button>
            </div>

            {friend.bio && (
              <p style={{ margin: "0 0 1rem 0", color: "var(--lz-text-secondary)", lineHeight: "1.6" }}>
                {friend.bio}
              </p>
            )}

            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
              {friend.location && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--lz-text-secondary)" }}>
                  <span>📍</span>
                  <span>{friend.location}</span>
                </div>
              )}
              {friend.website && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span>🔗</span>
                  <a
                    href={friend.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--lz-primary)", textDecoration: "none" }}
                  >
                    {friend.website}
                  </a>
                </div>
              )}
              {friend.email && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--lz-text-secondary)" }}>
                  <span>✉️</span>
                  <span>{friend.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card" style={{ textAlign: "center", padding: "1.5rem" }}>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "var(--lz-primary)", marginBottom: "0.5rem" }}>
            {mutualFriends.length}
          </div>
          <div style={{ color: "var(--lz-text-secondary)", fontSize: "0.9rem" }}>
            Mutual Friends
          </div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "1.5rem" }}>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "var(--lz-primary)", marginBottom: "0.5rem" }}>
            {mutualProjects.length}
          </div>
          <div style={{ color: "var(--lz-text-secondary)", fontSize: "0.9rem" }}>
            Mutual Projects
          </div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "1.5rem" }}>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "var(--lz-primary)", marginBottom: "0.5rem" }}>
            {friendProjects.length}
          </div>
          <div style={{ color: "var(--lz-text-secondary)", fontSize: "0.9rem" }}>
            Total Projects
          </div>
        </div>
      </div>

      {/* Mutual Friends Section */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "1.5rem", color: "var(--lz-text-primary)" }}>
          Mutual Friends ({mutualFriends.length})
        </h2>

        {mutualFriends.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--lz-text-muted)" }}>
            No mutual friends
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
            {mutualFriends.map((mutualFriend) => (
              <Link
                key={mutualFriend.id}
                to={`/friend/${mutualFriend.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem",
                  background: "var(--lz-surface-elevated)",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--lz-surface)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--lz-surface-elevated)";
                }}
              >
                <img
                  src={mutualFriend.profileImage || "/placeholder.svg"}
                  alt={mutualFriend.name}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    objectFit: "cover"
                  }}
                />
                <div>
                  <div style={{ color: "var(--lz-text-primary)", fontWeight: "600" }}>
                    {mutualFriend.name}
                  </div>
                  <div style={{ color: "var(--lz-text-muted)", fontSize: "0.875rem" }}>
                    @{mutualFriend.username}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Mutual Projects Section */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "1.5rem", color: "var(--lz-text-primary)" }}>
          Mutual Projects ({mutualProjects.length})
        </h2>

        {mutualProjects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--lz-text-muted)" }}>
            No mutual projects
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {mutualProjects.map((project) => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                style={{
                  display: "flex",
                  gap: "1rem",
                  padding: "1rem",
                  background: "var(--lz-surface-elevated)",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--lz-surface)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--lz-surface-elevated)";
                }}
              >
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.name}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "8px",
                    objectFit: "cover"
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--lz-text-primary)" }}>
                    {project.name}
                  </h3>
                  <p style={{ margin: "0 0 0.75rem 0", color: "var(--lz-text-secondary)", fontSize: "0.9rem" }}>
                    {project.description}
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {project.languages && project.languages.slice(0, 3).map((lang, index) => (
                      <span
                        key={index}
                        style={{
                          padding: "0.25rem 0.75rem",
                          background: "var(--lz-primary)",
                          color: "white",
                          borderRadius: "12px",
                          fontSize: "0.75rem"
                        }}
                      >
                        {lang}
                      </span>
                    ))}
                    {project.languages && project.languages.length > 3 && (
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          background: "var(--lz-surface)",
                          color: "var(--lz-text-muted)",
                          borderRadius: "12px",
                          fontSize: "0.75rem"
                        }}
                      >
                        +{project.languages.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      background: project.status === "checked-in" ? "#10b981" : "#f59e0b",
                      color: "white",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "600"
                    }}
                  >
                    {project.status === "checked-in" ? "Available" : "Checked Out"}
                  </span>
                  <div style={{ marginTop: "0.5rem", color: "var(--lz-text-muted)", fontSize: "0.875rem" }}>
                    v{project.version}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Friend's All Projects Section */}
      <div className="card">
        <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "1.5rem", color: "var(--lz-text-primary)" }}>
          All Projects ({friendProjects.length})
        </h2>

        {friendProjects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--lz-text-muted)" }}>
            No projects yet
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
            {friendProjects.map((project) => {
              const isMutual = mutualProjects.some(mp => mp.id === project.id);
              return (
                <Link
                  key={project.id}
                  to={`/project/${project.id}`}
                  style={{
                    padding: "1rem",
                    background: "var(--lz-surface-elevated)",
                    borderRadius: "8px",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    position: "relative"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--lz-surface)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--lz-surface-elevated)";
                  }}
                >
                  {isMutual && (
                    <div
                      style={{
                        position: "absolute",
                        top: "0.5rem",
                        right: "0.5rem",
                        padding: "0.25rem 0.5rem",
                        background: "var(--lz-primary)",
                        color: "white",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        fontWeight: "600"
                      }}
                    >
                      Mutual
                    </div>
                  )}
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.name}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      marginBottom: "0.75rem"
                    }}
                  />
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--lz-text-primary)", fontSize: "1.1rem" }}>
                    {project.name}
                  </h3>
                  <p style={{ margin: "0 0 0.75rem 0", color: "var(--lz-text-secondary)", fontSize: "0.875rem", lineHeight: "1.5" }}>
                    {project.description.length > 80
                      ? `${project.description.substring(0, 80)}...`
                      : project.description}
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {project.languages && project.languages.slice(0, 2).map((lang, index) => (
                      <span
                        key={index}
                        style={{
                          padding: "0.25rem 0.5rem",
                          background: "var(--lz-primary)",
                          color: "white",
                          borderRadius: "12px",
                          fontSize: "0.7rem"
                        }}
                      >
                        {lang}
                      </span>
                    ))}
                    {project.languages && project.languages.length > 2 && (
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          background: "var(--lz-surface)",
                          color: "var(--lz-text-muted)",
                          borderRadius: "12px",
                          fontSize: "0.7rem"
                        }}
                      >
                        +{project.languages.length - 2}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default FriendProfilePage;