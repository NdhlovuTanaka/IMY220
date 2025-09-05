import React from "react";
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import EditProfileForm from "../components/profile/EditProfileForm"
import ProjectPreview from "../components/project/ProjectPreview"
import CreateProjectForm from "../components/project/CreateProjectForm"
import ProfilePreview from "../components/profile/ProfilePreview"

const ProfilePage = ({ currentUser }) => {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [activeTab, setActiveTab] = useState("projects")
  const isOwnProfile = userId === currentUser?.id || userId === "1" // Assuming current user has id 1 for demo

  // Dummy user data
  const dummyUser = {
    id: userId,
    name: isOwnProfile ? currentUser?.name || "John Doe" : "Jane Smith",
    username: isOwnProfile ? "johndoe" : "janesmith",
    email: isOwnProfile ? currentUser?.email || "john@example.com" : "jane@example.com",
    bio: "Full-stack developer passionate about clean code and innovative solutions.",
    location: "San Francisco, CA",
    website: "https://johndoe.dev",
    birthday: "1995-06-15",
    work: "Senior Developer at TechCorp",
    profileImage: "/developer-avatar.png",
    projectCount: 12,
    friendCount: 45,
    isFollowing: !isOwnProfile ? false : undefined,
  }

  const dummyProjects = [
    {
      id: 1,
      name: "React Dashboard",
      description: "Modern admin dashboard built with React and TypeScript",
      owner: dummyUser.name,
      languages: ["JavaScript", "TypeScript", "CSS"],
      status: "checked-in",
      createdAt: "2024-08-15T10:00:00Z",
      image: "/placeholder-azq1n.png",
    },
    {
      id: 2,
      name: "API Gateway",
      description: "Microservices API gateway with authentication",
      owner: dummyUser.name,
      languages: ["Node.js", "Express", "MongoDB"],
      status: "checked-out",
      createdAt: "2024-07-20T14:30:00Z",
      image: "/placeholder-pksys.png",
    },
  ]

  const dummyFriends = [
    {
      id: 2,
      name: "Alice Johnson",
      username: "alicej",
      profileImage: "/alice-avatar.png",
      projectCount: 8,
      isFollowing: true,
    },
    {
      id: 3,
      name: "Bob Wilson",
      username: "bobw",
      profileImage: "/bob-avatar.jpg",
      projectCount: 15,
      isFollowing: true,
    },
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUser(dummyUser)
    }, 500)
  }, [userId])

  const handleSaveProfile = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }))
    setIsEditing(false)
  }

  const handleCreateProject = (projectData) => {
    console.log("Creating project:", projectData)
    setShowCreateProject(false)
    // In real app, would add to projects list
  }

  const handleFollow = (targetUserId) => {
    setUser((prev) => ({
      ...prev,
      isFollowing: !prev.isFollowing,
    }))
  }

  if (!user) {
    return (
      <main>
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--lz-muted)" }}>Loading profile...</div>
      </main>
    )
  }

  return (
    <main>
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
                {user.bio && <p style={{ margin: "0 0 1rem 0", maxWidth: "500px" }}>{user.bio}</p>}
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                {isOwnProfile ? (
                  <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                ) : (
                  <button onClick={() => handleFollow(user.id)}>{user.isFollowing ? "Unfollow" : "Follow"}</button>
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
              <div>📊 {user.projectCount} projects</div>
              <div>👥 {user.friendCount} friends</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditing && <EditProfileForm user={user} onSave={handleSaveProfile} onCancel={() => setIsEditing(false)} />}

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
            Projects
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
            Friends
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

            <div className="grid" style={{ gap: "1rem" }}>
              {dummyProjects.map((project) => (
                <ProjectPreview key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === "friends" && (
          <div>
            <h2 style={{ marginBottom: "1.5rem" }}>Friends ({dummyFriends.length})</h2>

            <div className="grid" style={{ gap: "1rem" }}>
              {dummyFriends.map((friend) => (
                <ProfilePreview key={friend.id} user={friend} showFollowButton={isOwnProfile} onFollow={handleFollow} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default ProfilePage
