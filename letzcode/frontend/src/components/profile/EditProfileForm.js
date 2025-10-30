import React from "react";
import { useState } from "react"

const EditProfileForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user.name || "",
    username: user.username || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    birthday: user.birthday ? user.birthday.split('T')[0] : "",
    work: user.work || "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Don't send username in the update (it's locked)
    const { username, ...updateData } = formData;
    onSave(updateData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="card" style={{ marginBottom: "2rem" }}>
      <h3 style={{ marginBottom: "1.5rem" }}>Edit Profile</h3>

      <form onSubmit={handleSubmit}>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="edit-name">Full Name</label>
            <input type="text" id="edit-name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="edit-username">
              Username 
              <span style={{ 
                marginLeft: "0.5rem", 
                fontSize: "0.75rem", 
                color: "var(--lz-muted)",
                fontWeight: "normal"
              }}>
                (Cannot be changed)
              </span>
            </label>
            <input
              type="text"
              id="edit-username"
              name="username"
              value={formData.username}
              disabled
              style={{
                background: "var(--lz-surface)",
                color: "var(--lz-text-muted)",
                cursor: "not-allowed",
                opacity: 0.7
              }}
              title="Username cannot be changed after account creation"
            />
          </div>
        </div>

        <div>
          <label htmlFor="edit-bio">Bio</label>
          <textarea
            id="edit-bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="3"
            placeholder="Tell us about yourself..."
            maxLength={500}
          />
          <small style={{ color: "var(--lz-muted)", fontSize: "0.75rem" }}>
            {formData.bio.length}/500 characters
          </small>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="edit-location">Location</label>
            <input
              type="text"
              id="edit-location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
            />
          </div>

          <div>
            <label htmlFor="edit-website">Website</label>
            <input
              type="url"
              id="edit-website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="edit-birthday">Birthday</label>
            <input type="date" id="edit-birthday" name="birthday" value={formData.birthday} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="edit-work">Work</label>
            <input
              type="text"
              id="edit-work"
              name="work"
              value={formData.work}
              onChange={handleChange}
              placeholder="Software Developer at Company"
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
          <button type="submit">💾 Save Changes</button>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: "transparent", border: "1px solid var(--lz-muted)" }}
          >
            ✕ Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditProfileForm