import React, { useState } from "react";
import { uploadProfileImage } from "../../api";
import { showToast } from "../../utils/toast";

const EditProfileForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user.name || "",
    username: user.username || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    birthday: user.birthday ? user.birthday.split('T')[0] : "",
    work: user.work || "",
  });
  
  const [profileImage, setProfileImage] = useState(user.profileImage || "/placeholder.svg");
  const [imageFile, setImageFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { username, ...updateData } = formData;
    onSave(updateData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("Image must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast.error("Please select an image file");
      return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload image
    setIsUploadingImage(true);
    const data = await uploadProfileImage(file);
    setIsUploadingImage(false);

    if (data.ok) {
      showToast.success("Profile image updated!");
      setProfileImage(data.imageUrl);
    } else {
      showToast.error(data.message || "Failed to upload image");
      setProfileImage(user.profileImage || "/placeholder.svg");
    }
  };

  return (
    <div className="card" style={{ marginBottom: "2rem" }}>
      <h3 style={{ marginBottom: "1.5rem" }}>Edit Profile</h3>

      <form onSubmit={handleSubmit}>
        {/* Profile Image Upload */}
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={profileImage}
              alt="Profile"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid var(--lz-border)"
              }}
              onError={(e) => {
                e.target.src = "/placeholder.svg";
              }}
            />
            {isUploadingImage && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white"
              }}>
                ⏳
              </div>
            )}
          </div>
          <div style={{ marginTop: "1rem" }}>
            <label
              htmlFor="profile-image-upload"
              style={{
                padding: "0.5rem 1rem",
                background: "var(--lz-primary)",
                color: "white",
                borderRadius: "6px",
                cursor: "pointer",
                display: "inline-block",
                fontSize: "0.875rem"
              }}
            >
              📷 Change Profile Picture
            </label>
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <p style={{ 
              marginTop: "0.5rem", 
              fontSize: "0.75rem", 
              color: "var(--lz-text-muted)" 
            }}>
              Max 5MB • JPG, PNG, GIF, WebP
            </p>
          </div>
        </div>

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
  );
};

export default EditProfileForm;