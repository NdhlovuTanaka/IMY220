import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { getUserProfile, updateProfile, deleteProfile, getProjects, getFriends } from "../api";
import { showToast } from "../utils/toast";
import EditProfileForm from "../components/profile/EditProfileForm";
import CreateProjectModal from "../components/CreateProjectModal";

const ProfilePage = ({ currentUser }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  
  // Data states
  const [projects, setProjects] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);

  const profileUserId = userId || currentUser?.id;
  const isOwnProfile = profileUserId === currentUser?.id;

  useEffect(() => {
    if (profileUserId) {
      fetchUserProfile();
      fetchUserProjects();
      if (isOwnProfile) {
        fetchUserFriends();
      }
    } else {
      setIsLoading(false);
    }
  }, [profileUserId]);

  useEffect(() => {
    if (user && !user.profileCompleted && isOwnProfile) {
      setIsEditing(true);
      setShowWarning(true);
    }
  }, [user, isOwnProfile]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!user?.profileCompleted && isOwnProfile) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, isOwnProfile]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const data = await getUserProfile(profileUserId);
      if (data.ok) {
        setUser(data.user);
      } else {
        showToast.error(data.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      showToast.error("Error loading profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const data = await getProjects(null, profileUserId);
      if (data.ok) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchUserFriends = async () => {
    setIsLoadingFriends(true);
    try {
      const data = await getFriends();
      if (data.ok) {
        setFriends(data.friends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const handleSaveProfile = async (updatedData) => {
    try {
      const data = await updateProfile(updatedData);
      if (data.ok) {
        setUser(data.user);
        setIsEditing(false);
        setHasUnsavedChanges(false);
        setShowWarning(false);
        showToast.success("Profile updated successfully! 🎉");
      } else {
        showToast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast.error("Error updating profile");
    }
  };

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will delete all your projects."
    );
    
    if (!confirmed) return;

    try {
      const data = await deleteProfile();
      if (data.ok) {
        localStorage.clear();
        showToast.success("Account deleted successfully");
        setTimeout(() => navigate("/"), 1500);
      } else {
        showToast.error(data.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      showToast.error("Error deleting account");
    }
  };

  const handleCreateProject = (newProject) => {
    showToast.success("Project created successfully!");
    // Add the new project to the beginning of the list
    setProjects(prev => [newProject, ...prev]);
    // Refresh the full list to ensure we have all data
    fetchUserProjects();
    // Close the modal
    setShowCreateProject(false);
  };

  if (!profileUserId) {
    return (
      <main>
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--lz-text-muted)" }}>
          Unable to load profile. Please try logging in again.
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main>
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--lz-text-muted)" }}>
          Loading profile...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main>
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--lz-text-muted)" }}>
          User not found
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Warning Banner */}
      {showWarning && !user.profileCompleted && isOwnProfile && (
        <div
          style={{
            background: "#f59e0b",
            color: "white",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <strong>⚠️ Complete Your Profile</strong>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>
              Please fill in your profile details to get the full experience of LetzCode.
            </p>
          </div>
          <button
            onClick={() => setShowWarning(false)}
            style={{
              background: "transparent",
              border: "1px solid white",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Header */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "start" }}>
          <img
            src={user.profileImage || "/placeholder.svg"}
            alt={`${user.name}'s profile`}
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
            onError={(e) => { e.target.src = "/placeholder.svg"; }}
          />

          <div style={{ flex: 1 }}>
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}
            >
              <div>
                <h1 style={{ margin: "0 0 0.5rem 0", color: "var(--lz-text-primary)" }}>{user.name}</h1>
                <p style={{ color: "var(--lz-muted)", margin: "0 0 0.5rem 0" }}>@{user.username}</p>
                {user.bio && <p style={{ margin: "0.5rem 0", lineHeight: "1.6", color: "var(--lz-text-secondary)" }}>{user.bio}</p>}
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                {isOwnProfile ? (
                  <>
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      style={{
                        padding: "0.75rem 1.5rem",
                        background: isEditing ? "transparent" : "var(--lz-primary)",
                        color: isEditing ? "var(--lz-primary)" : "white",
                        border: isEditing ? "1px solid var(--lz-primary)" : "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600"
                      }}
                    >
                      {isEditing ? "✕ Cancel Edit" : "✏️ Edit Profile"}
                    </button>
                    <button 
                      onClick={handleDeleteProfile} 
                      style={{ 
                        padding: "0.75rem 1.5rem",
                        background: "var(--lz-red)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600"
                      }}
                    >
                      🗑️ Delete Account
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                fontSize: "0.9rem",
                color: "var(--lz-muted)",
              }}
            >
              {user.location && <div>📍 {user.location}</div>}
              {user.website && (
                <div>
                  🌐{" "}
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--lz-purple)" }}
                  >
                    {user.website}
                  </a>
                </div>
              )}
              {user.work && <div>💼 {user.work}</div>}
              {user.birthday && (
                <div>🎂 {new Date(user.birthday).toLocaleDateString()}</div>
              )}
              <div>📅 Joined {new Date(user.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <EditProfileForm 
          user={user} 
          onSave={handleSaveProfile} 
          onCancel={() => {
            if (!user.profileCompleted) {
              showToast.warning("Please complete your profile before continuing");
              return;
            }
            setIsEditing(false);
          }} 
        />
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <CreateProjectModal 
          onClose={() => setShowCreateProject(false)} 
          onSuccess={handleCreateProject} 
        />
      )}

      {/* Tabs */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", borderBottom: "2px solid var(--lz-border)" }}>
          <button
            onClick={() => setActiveTab("projects")}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "projects" ? "3px solid var(--lz-primary)" : "3px solid transparent",
              padding: "0.75rem 0",
              marginBottom: "-2px",
              color: activeTab === "projects" ? "var(--lz-primary)" : "var(--lz-text-secondary)",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Projects ({projects.length})
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab("friends")}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: activeTab === "friends" ? "3px solid var(--lz-primary)" : "3px solid transparent",
                padding: "0.75rem 0",
                marginBottom: "-2px",
                color: activeTab === "friends" ? "var(--lz-primary)" : "var(--lz-text-secondary)",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Friends ({friends.length})
            </button>
          )}
        </div>

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "var(--lz-text-primary)", margin: 0 }}>Projects</h2>
              {isOwnProfile && (
                <button 
                  onClick={() => setShowCreateProject(true)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "var(--lz-primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>+</span> Create Project
                </button>
              )}
            </div>

            {isLoadingProjects ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--lz-text-muted)" }}>
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📁</div>
                <p style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "var(--lz-text-primary)" }}>
                  No projects yet
                </p>
                {isOwnProfile && (
                  <button 
                    onClick={() => setShowCreateProject(true)}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: "var(--lz-primary)",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600"
                    }}
                  >
                    Create Your First Project
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                {projects.map((project) => (
                  <Link
                    key={project.id || project._id}
                    to={`/project/${project.id || project._id}`}
                    className="card"
                    style={{ 
                      textDecoration: "none", 
                      transition: "all 0.2s",
                      display: "block"
                    }}
                  >
                    <img
                      src={project.image || "/placeholder.svg"}
                      alt={project.name}
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "1rem"
                      }}
                      onError={(e) => { e.target.src = "/placeholder.svg"; }}
                    />
                    <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--lz-text-primary)" }}>
                      {project.name}
                    </h3>
                    <p style={{ margin: "0 0 1rem 0", color: "var(--lz-text-secondary)", fontSize: "0.875rem" }}>
                      {project.description.substring(0, 100)}{project.description.length > 100 ? "..." : ""}
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.875rem" }}>
                      <span style={{ color: "var(--lz-text-muted)" }}>
                        v{project.version}
                      </span>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          background: project.status === "checked-out" ? "var(--lz-orange)" : "var(--lz-green)",
                          color: "white",
                          borderRadius: "4px",
                          fontSize: "0.75rem"
                        }}
                      >
                        {project.status === "checked-out" ? "Checked Out" : "Available"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === "friends" && isOwnProfile && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "var(--lz-text-primary)", margin: 0 }}>Friends ({friends.length})</h2>
              <Link to="/friends">
                <button
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "var(--lz-primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>+</span> Add Friends
                </button>
              </Link>
            </div>

            {isLoadingFriends ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--lz-text-muted)" }}>
                Loading friends...
              </div>
            ) : friends.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👥</div>
                <p style={{ fontSize: "1.2rem", marginBottom: "1rem", color: "var(--lz-text-primary)" }}>
                  No friends yet
                </p>
                <p style={{ marginBottom: "1.5rem", color: "var(--lz-text-secondary)" }}>
                  Connect with other developers to see their projects and collaborate!
                </p>
                <Link to="/friends">
                  <button
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: "var(--lz-primary)",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600"
                    }}
                  >
                    Find Friends
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
                {friends.map((friend) => (
                  <Link
                    key={friend._id}
                    to={`/friend/${friend._id}`}
                    className="card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      textDecoration: "none",
                      transition: "all 0.2s",
                      padding: "1rem"
                    }}
                  >
                    <img
                      src={friend.profileImage || "/placeholder.svg"}
                      alt={friend.name}
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        objectFit: "cover"
                      }}
                      onError={(e) => { e.target.src = "/placeholder.svg"; }}
                    />
                    <div>
                      <h3 style={{ margin: "0 0 0.25rem 0", color: "var(--lz-text-primary)" }}>
                        {friend.name}
                      </h3>
                      <p style={{ margin: 0, color: "var(--lz-text-muted)", fontSize: "0.875rem" }}>
                        @{friend.username}
                      </p>
                      {friend.work && (
                        <p style={{ margin: "0.25rem 0 0 0", color: "var(--lz-text-secondary)", fontSize: "0.875rem" }}>
                          {friend.work}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default ProfilePage;