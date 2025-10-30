import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getUserProfile, updateProfile, deleteProfile } from "../api";
import { showToast } from "../utils/toast";
import EditProfileForm from "../components/profile/EditProfileForm";
import ProjectPreview from "../components/project/ProjectPreview";
import CreateProjectForm from "../components/project/CreateProjectForm";
import ProfilePreview from "../components/profile/ProfilePreview";

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
  
  // Use currentUser.id if userId is not provided
  const profileUserId = userId || currentUser?.id;
  const isOwnProfile = profileUserId === currentUser?.id;

  // Dummy data for projects and friends (to be replaced with real data later)
  const dummyProjects = [];
  const dummyFriends = [];

  useEffect(() => {
    if (profileUserId) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, [profileUserId]);

  // Show edit form automatically if profile is incomplete
  useEffect(() => {
    if (user && !user.profileCompleted && isOwnProfile) {
      setIsEditing(true);
      setShowWarning(true);
    }
  }, [user, isOwnProfile]);

  // Warn user before leaving if profile is incomplete
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

  const handleCreateProject = (projectData) => {
    console.log("Creating project:", projectData);
    setShowCreateProject(false);
    showToast.success("Project created successfully! 🚀");
    // In real app, would add to projects list
  };

  const handleFollow = (targetUserId) => {
    // Implement friend request logic later
    console.log("Follow user:", targetUserId);
    showToast.info("Friend request sent!");
  };

  if (!profileUserId) {
    return (
      <main>
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--lz-muted)" }}>
          Unable to load profile. Please try logging in again.
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main>
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--lz-muted)" }}>
          Loading profile...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main>
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--lz-muted)" }}>
          User not found
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Profile Incomplete Warning */}
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
          />

          <div style={{ flex: 1 }}>
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}
            >
              <div>
                <h1 style={{ margin: "0 0 0.5rem 0" }}>{user.name}</h1>
                <p style={{ color: "var(--lz-muted)", margin: "0 0 0.5rem 0" }}>@{user.username}</p>
                <p style={{ color: "var(--lz-muted)", margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>{user.email}</p>
                {user.bio && <p style={{ margin: "0 0 1rem 0", maxWidth: "500px" }}>{user.bio}</p>}
                {!user.bio && isOwnProfile && (
                  <p style={{ margin: "0 0 1rem 0", color: "var(--lz-muted)", fontStyle: "italic" }}>
                    Add a bio to tell others about yourself
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                {isOwnProfile ? (
                  <>
                    <button onClick={() => setIsEditing(true)}>✏️ Edit Profile</button>
                    <button 
                      onClick={handleDeleteProfile}
                      style={{ background: "#ef4444", color: "white" }}
                    >
                      🗑️ Delete Account
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleFollow(user.id)}>
                    {user.isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}
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

      {/* Create Project Form */}
      {showCreateProject && (
        <CreateProjectForm onSave={handleCreateProject} onCancel={() => setShowCreateProject(false)} />
      )}

      {/* Tabs */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid #1d1d27" }}>
          <button
            onClick={() => setActiveTab("projects")}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "projects" ? "2px solid var(--lz-purple)" : "2px solid transparent",
              padding: "0.75rem 0",
              color: activeTab === "projects" ? "var(--lz-white)" : "var(--lz-muted)",
            }}
          >
            Projects ({dummyProjects.length})
          </button>
          <button
            onClick={() => setActiveTab("friends")}
            style={{
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "friends" ? "2px solid var(--lz-purple)" : "2px solid transparent",
              padding: "0.75rem 0",
              color: activeTab === "friends" ? "var(--lz-white)" : "var(--lz-muted)",
            }}
          >
            Friends ({dummyFriends.length})
          </button>
        </div>

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div>
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}
            >
              <h2>Projects</h2>
              {isOwnProfile && <button onClick={() => setShowCreateProject(true)}>+ Create Project</button>}
            </div>

            {dummyProjects.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--lz-muted)" }}>
                <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>No projects yet</p>
                {isOwnProfile && (
                  <button onClick={() => setShowCreateProject(true)}>
                    Create Your First Project
                  </button>
                )}
              </div>
            ) : (
              <div className="grid" style={{ gap: "1rem" }}>
                {dummyProjects.map((project) => (
                  <ProjectPreview key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === "friends" && (
          <div>
            <h2 style={{ marginBottom: "1.5rem" }}>Friends ({dummyFriends.length})</h2>

            {dummyFriends.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--lz-muted)" }}>
                <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>No friends yet</p>
                <p>Connect with other developers to see their projects and collaborate!</p>
              </div>
            ) : (
              <div className="grid" style={{ gap: "1rem" }}>
                {dummyFriends.map((friend) => (
                  <ProfilePreview key={friend.id} user={friend} showFollowButton={isOwnProfile} onFollow={handleFollow} />
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