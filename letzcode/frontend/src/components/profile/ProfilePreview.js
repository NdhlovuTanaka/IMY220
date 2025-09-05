import React from "react";
import { Link } from "react-router-dom"

const ProfilePreview = ({ user, showFollowButton = false, onFollow }) => {
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <img
        src={user.profileImage || "/placeholder.svg?height=60&width=60&query=user+avatar"}
        alt={`${user.name}'s profile`}
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />

      <div style={{ flex: 1 }}>
        <Link
          to={`/profile/${user.id}`}
          style={{
            color: "var(--lz-white)",
            textDecoration: "none",
            fontSize: "1.1rem",
            fontWeight: "600",
          }}
        >
          {user.name}
        </Link>
        <p style={{ color: "var(--lz-muted)", margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>
          @{user.username} • {user.projectCount || 0} projects
        </p>
      </div>

      {showFollowButton && (
        <button
          onClick={() => onFollow(user.id)}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
          }}
        >
          {user.isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}
    </div>
  )
}

export default ProfilePreview
