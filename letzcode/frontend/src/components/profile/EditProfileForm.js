import React from "react";
import { useState } from "react"

const EditProfileForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user.name || "",
    username: user.username || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    birthday: user.birthday || "",
    work: user.work || "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: "1.5rem" }}>Edit Profile</h3>

      <form onSubmit={handleSubmit}>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="edit-name">Full Name</label>
            <input type="text" id="edit-name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="edit-username">Username</label>
            <input
              type="text"
              id="edit-username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
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
          />
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
          <button type="submit">Save Changes</button>
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

export default EditProfileForm
