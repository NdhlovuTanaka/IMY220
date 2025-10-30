import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getProject, 
  checkoutProject, 
  checkinProject, 
  deleteProject,
  addProjectFiles,
  addProjectMember,
  removeProjectMember,
  getFriends,
  downloadProjectFile,
  previewProjectFile
} from "../api";
import { showToast } from "../utils/toast";

const ProjectPage = ({ currentUser }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [checkInMessage, setCheckInMessage] = useState("");
  const [newVersion, setNewVersion] = useState("");
  const [showAddFiles, setShowAddFiles] = useState(false);
  const [files, setFiles] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Calculate user's role
  const isOwner = project?.owner?._id === currentUser?.id || project?.owner?.id === currentUser?.id;
  const isMember = project?.members?.some(m => 
    (m._id === currentUser?.id || m.id === currentUser?.id)
  );

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    if (showAddMember && (isOwner || isMember)) {
      fetchFriends();
    }
  }, [showAddMember]);

  const fetchProject = async () => {
    setIsLoading(true);
    const data = await getProject(projectId);
    
    if (data.ok) {
      setProject(data.project);
      setNewVersion(data.project.version);
    } else {
      showToast.error(data.message || "Failed to load project");
      navigate("/home");
    }
    
    setIsLoading(false);
  };

  const fetchFriends = async () => {
    const data = await getFriends();
    if (data.ok) {
      // Filter out friends who are already members
      const nonMembers = data.friends.filter(friend => 
        !project.members.some(m => (m._id || m.id) === friend._id)
      );
      setFriends(nonMembers);
    }
  };

  const handleCheckOut = async () => {
    const data = await checkoutProject(projectId);
    
    if (data.ok) {
      showToast.success("Project checked out successfully. You can now edit and upload files.");
      fetchProject();
    } else {
      showToast.error(data.message || "Failed to check out project");
    }
  };

  const handleCheckIn = async () => {
    if (!checkInMessage.trim()) {
      showToast.error("Please provide a check-in message describing your changes");
      return;
    }

    const data = await checkinProject(projectId, {
      message: checkInMessage,
      version: newVersion
    });

    if (data.ok) {
      showToast.success("Project checked in successfully. Changes are now available to all members.");
      setCheckInMessage("");
      fetchProject();
    } else {
      showToast.error(data.message || "Failed to check in project");
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleAddFiles = async () => {
    if (files.length === 0) {
      showToast.error("Please select files to upload");
      return;
    }

    // Convert files to the format expected by backend
    const filesInfo = files.map(file => ({
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`
    }));

    const data = await addProjectFiles(projectId, filesInfo);

    if (data.ok) {
      showToast.success(`${files.length} file(s) added successfully`);
      setFiles([]);
      setShowAddFiles(false);
      fetchProject();
    } else {
      showToast.error(data.message || "Failed to add files");
    }
  };

  const handleAddMember = async () => {
    if (!selectedFriend) {
      showToast.error("Please select a friend to add");
      return;
    }

    const data = await addProjectMember(projectId, selectedFriend);

    if (data.ok) {
      const addedFriend = friends.find(f => f._id === selectedFriend);
      showToast.success(`${addedFriend?.name} added as project member`);
      setSelectedFriend("");
      setShowAddMember(false);
      fetchProject();
    } else {
      showToast.error(data.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    const confirmed = window.confirm(`Are you sure you want to remove ${memberName} from this project?`);
    if (!confirmed) return;

    const data = await removeProjectMember(projectId, memberId);

    if (data.ok) {
      showToast.success(`${memberName} removed from project`);
      fetchProject();
    } else {
      showToast.error(data.message || "Failed to remove member");
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    const data = await downloadProjectFile(projectId, fileId);
    
    if (data.ok) {
      showToast.success(`Downloading ${fileName}...`);
      // In a real app, this would trigger actual file download
      // For demo, we'll show the download info
      console.log("Download file:", data.file);
    } else {
      showToast.error(data.message || "Failed to download file");
    }
  };

  const handlePreviewFile = async (fileId) => {
    const data = await previewProjectFile(projectId, fileId);
    
    if (data.ok) {
      setPreviewFile(data.file);
      setShowPreview(true);
    } else {
      showToast.error(data.message || "Failed to preview file");
    }
  };

  const handleDeleteProject = async () => {
    const confirmed = window.confirm(
      `⚠️ DELETE PROJECT: "${project.name}"\n\nThis will permanently delete:\n- All project files\n- All check-in history\n- All related activities\n\nThis action CANNOT be undone.\n\nType the project name to confirm deletion.`
    );

    if (!confirmed) return;

    const userConfirmation = prompt(`Type "${project.name}" to confirm deletion:`);
    
    if (userConfirmation !== project.name) {
      showToast.error("Project name didn't match. Deletion cancelled.");
      return;
    }

    const data = await deleteProject(projectId);

    if (data.ok) {
      showToast.success("Project deleted successfully");
      navigate("/home");
    } else {
      showToast.error(data.message || "Failed to delete project");
    }
  };

  const canCheckOut = project?.status === "checked-in" && isMember;
  const canCheckIn =
    project?.status === "checked-out" &&
    (project?.checkedOutBy?._id === currentUser?.id || project?.checkedOutBy?.id === currentUser?.id);
  const canAddFiles = isMember;
  const canAddMembers = isMember; // Both owner and members can add friends

  if (isLoading) {
    return (
      <main style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ color: "var(--lz-text-muted)" }}>Loading project...</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main style={{ textAlign: "center", padding: "3rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>❌</div>
        <p style={{ color: "var(--lz-text-muted)" }}>Project not found</p>
      </main>
    );
  }

  return (
    <main>
      {/* Role Indicator */}
      <div className="card" style={{ marginBottom: "2rem", padding: "1rem", background: "var(--lz-surface-elevated)", border: "1px solid var(--lz-border)" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", fontSize: "0.9rem", flexWrap: "wrap" }}>
          <span style={{ color: "var(--lz-text-muted)" }}>Your Role:</span>
          {isOwner && (
            <span style={{ padding: "0.25rem 0.75rem", background: "var(--lz-purple)", color: "white", borderRadius: "4px", fontWeight: "600" }}>
               Owner 
            </span>
          )}
          {!isOwner && isMember && (
            <span style={{ padding: "0.25rem 0.75rem", background: "var(--lz-primary)", color: "white", borderRadius: "4px", fontWeight: "600" }}>
              Member 
            </span>
          )}
          {!isOwner && !isMember && (
            <span style={{ padding: "0.25rem 0.75rem", background: "var(--lz-surface)", color: "var(--lz-text-muted)", borderRadius: "4px", border: "1px solid var(--lz-border)" }}>
              Viewer
            </span>
          )}
        </div>
        {!isOwner && !isMember && (
          <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.875rem", color: "var(--lz-text-muted)" }}>
            This is a public project. You can view details and download files, but cannot make changes.
          </p>
        )}
      </div>

      {/* Project Header */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "start" }}>
          <img
            src={project.image || "/placeholder.svg"}
            alt={project.name}
            style={{ width: "200px", height: "150px", borderRadius: "8px", objectFit: "cover", background: "var(--lz-surface)" }}
            onError={(e) => { e.target.src = "/placeholder.svg"; }}
          />

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
              <div>
                <h1 style={{ margin: "0 0 0.5rem 0", color: "var(--lz-text-primary)" }}>
                  {project.name}
                </h1>
                <p style={{ color: "var(--lz-text-muted)", margin: "0 0 1rem 0" }}>
                  by {project.owner?.name || project.owner?.username || "Unknown"} • v{project.version}
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span style={{
                  padding: "0.5rem 1rem",
                  background: project.status === "checked-out" ? "var(--lz-orange)" : "var(--lz-green)",
                  color: "white",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: "600"
                }}>
                  {project.status === "checked-out" ? " Checked Out" : " Available"}
                </span>
                {project.status === "checked-out" && project.checkedOutBy && (
                  <span style={{ fontSize: "0.875rem", color: "var(--lz-text-muted)" }}>
                    by {project.checkedOutBy.name || project.checkedOutBy.username}
                  </span>
                )}
              </div>
            </div>

            <p style={{ marginBottom: "1rem", color: "var(--lz-text-secondary)" }}>
              {project.description}
            </p>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              {project.languages?.map((lang, index) => (
                <span key={index} style={{
                  background: "var(--lz-primary)",
                  color: "white",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: "600"
                }}>
                  #{lang}
                </span>
              ))}
            </div>

            <div style={{ fontSize: "0.875rem", color: "var(--lz-text-muted)" }}>
              <div> Type: {project.type}</div>
              <div> Members: {project.members?.map((m) => m.name || m.username).join(", ") || "None"}</div>
              <div> Created: {new Date(project.createdAt).toLocaleDateString()}</div>
              <div> Last Updated: {new Date(project.lastUpdated).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {/* Check-out button */}
          {canCheckOut && (
            <button onClick={handleCheckOut} style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.75rem 1.5rem", background: "var(--lz-primary)",
              color: "white", border: "none", borderRadius: "6px",
              fontSize: "0.9rem", fontWeight: "600", cursor: "pointer"
            }}>
              📤 Check Out Project
            </button>
          )}

          {/* Check-in controls */}
          {canCheckIn && (
            <div style={{ display: "flex", gap: "1rem", alignItems: "end", flex: 1, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <input
                  type="text"
                  value={checkInMessage}
                  onChange={(e) => setCheckInMessage(e.target.value)}
                  placeholder="Describe your changes..."
                  style={{
                    width: "100%", padding: "0.75rem",
                    background: "var(--lz-surface)",
                    border: "1px solid var(--lz-border)",
                    borderRadius: "6px",
                    color: "var(--lz-text-primary)"
                  }}
                />
              </div>
              <div style={{ width: "120px" }}>
                <input
                  type="text"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  placeholder="Version"
                  style={{
                    width: "100%", padding: "0.75rem",
                    background: "var(--lz-surface)",
                    border: "1px solid var(--lz-border)",
                    borderRadius: "6px",
                    color: "var(--lz-text-primary)"
                  }}
                />
              </div>
              <button onClick={handleCheckIn} style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.75rem 1.5rem", background: "var(--lz-green)",
                color: "white", border: "none", borderRadius: "6px",
                fontSize: "0.9rem", fontWeight: "600", cursor: "pointer",
                whiteSpace: "nowrap"
              }}>
                📥 Check In
              </button>
            </div>
          )}

          {/* Member actions */}
          {canAddMembers && (
            <button onClick={() => setShowAddMember(!showAddMember)} style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.75rem 1.5rem", background: "transparent",
              color: "var(--lz-primary)", border: "2px solid var(--lz-primary)",
              borderRadius: "6px", fontSize: "0.9rem", fontWeight: "600",
              cursor: "pointer"
            }}>
               Add Member
            </button>
          )}

          {canAddFiles && (
            <button onClick={() => setShowAddFiles(!showAddFiles)} style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.75rem 1.5rem", background: "transparent",
              color: "var(--lz-primary)", border: "2px solid var(--lz-primary)",
              borderRadius: "6px", fontSize: "0.9rem", fontWeight: "600",
              cursor: "pointer"
            }}>
               Add Files
            </button>
          )}

          {/* Owner only actions */}
          {isOwner && (
          <button onClick={handleDeleteProject} style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.75rem 1.5rem", background: "var(--lz-red)",
            color: "white", border: "none", borderRadius: "6px",
            fontSize: "0.9rem", fontWeight: "600", cursor: "pointer"
          }}>
             Delete Project
          </button>
          )}
        </div>

        {/* Add Member Form */}
        {showAddMember && canAddMembers && (
          <div style={{
            marginTop: "1rem", padding: "1rem",
            background: "var(--lz-surface)", borderRadius: "6px",
            border: "1px solid var(--lz-border)"
          }}>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--lz-text-primary)" }}>Add Member (Friends Only)</h4>
            <p style={{ margin: "0 0 1rem 0", fontSize: "0.875rem", color: "var(--lz-text-muted)" }}>
              Members can edit the project, check-in/out, add files, and invite other friends.
            </p>
            <div style={{ display: "flex", gap: "1rem", alignItems: "end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "250px" }}>
                <select
                  value={selectedFriend}
                  onChange={(e) => setSelectedFriend(e.target.value)}
                  style={{
                    width: "100%", padding: "0.75rem",
                    background: "var(--lz-surface-elevated)",
                    border: "1px solid var(--lz-border)",
                    borderRadius: "6px",
                    color: "var(--lz-text-primary)",
                    cursor: "pointer"
                  }}
                >
                  <option value="">Select a friend...</option>
                  {friends.length === 0 ? (
                    <option disabled>No friends available to add</option>
                  ) : (
                    friends.map(friend => (
                      <option key={friend._id} value={friend._id}>
                        {friend.name} (@{friend.username})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <button 
                onClick={handleAddMember}
                disabled={!selectedFriend}
                style={{
                  padding: "0.75rem 1.5rem", 
                  background: selectedFriend ? "var(--lz-green)" : "var(--lz-surface)",
                  color: selectedFriend ? "white" : "var(--lz-text-muted)", 
                  border: selectedFriend ? "none" : "1px solid var(--lz-border)", 
                  borderRadius: "6px", 
                  cursor: selectedFriend ? "pointer" : "not-allowed",
                  fontWeight: "600",
                  opacity: selectedFriend ? 1 : 0.6
                }}
              >
                Add Member
              </button>
              <button onClick={() => { setShowAddMember(false); setSelectedFriend(""); }} style={{
                padding: "0.75rem 1rem", 
                background: "var(--lz-surface-elevated)",
                color: "var(--lz-text-primary)", 
                border: "1px solid var(--lz-border)",
                borderRadius: "6px", 
                cursor: "pointer",
                fontWeight: "500"
              }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add Files Form */}
        {showAddFiles && canAddFiles && (
          <div style={{
            marginTop: "1rem", padding: "1rem",
            background: "var(--lz-surface)", borderRadius: "6px",
            border: "1px solid var(--lz-border)"
          }}>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--lz-text-primary)" }}>Upload Project Files</h4>
            <p style={{ margin: "0 0 1rem 0", fontSize: "0.875rem", color: "var(--lz-text-muted)" }}>
              Upload files for this project. All members will have access to download these files.
            </p>
            <div style={{ display: "flex", gap: "1rem", alignItems: "end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "250px" }}>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  style={{
                    width: "100%", padding: "0.75rem",
                    background: "var(--lz-surface-elevated)",
                    border: "1px solid var(--lz-border)",
                    borderRadius: "6px",
                    color: "var(--lz-text-primary)",
                    cursor: "pointer"
                  }}
                />
                {files.length > 0 && (
                  <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "var(--lz-text-muted)" }}>
                    ✓ {files.length} file(s) selected ({files.map(f => f.name).join(", ")})
                  </p>
                )}
              </div>
              <button 
                onClick={handleAddFiles}
                disabled={files.length === 0}
                style={{
                  padding: "0.75rem 1.5rem", 
                  background: files.length > 0 ? "var(--lz-green)" : "var(--lz-surface)",
                  color: files.length > 0 ? "white" : "var(--lz-text-muted)", 
                  border: files.length > 0 ? "none" : "1px solid var(--lz-border)", 
                  borderRadius: "6px", 
                  cursor: files.length > 0 ? "pointer" : "not-allowed",
                  fontWeight: "600",
                  opacity: files.length > 0 ? 1 : 0.6
                }}
              >
                Upload Files
              </button>
              <button onClick={() => { setShowAddFiles(false); setFiles([]); }} style={{
                padding: "0.75rem 1rem", 
                background: "var(--lz-surface-elevated)",
                color: "var(--lz-text-primary)", 
                border: "1px solid var(--lz-border)",
                borderRadius: "6px", 
                cursor: "pointer",
                fontWeight: "500"
              }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", borderBottom: "2px solid var(--lz-border)" }}>
          {["overview", "files", "members", "history"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: "transparent", border: "none",
              borderBottom: activeTab === tab ? "3px solid var(--lz-primary)" : "3px solid transparent",
              padding: "0.75rem 0", marginBottom: "-2px",
              color: activeTab === tab ? "var(--lz-primary)" : "var(--lz-text-secondary)",
              fontSize: "1rem", fontWeight: "600", cursor: "pointer",
              textTransform: "capitalize"
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
            <div className="card">
              <h3 style={{ marginBottom: "1rem" }}>Project Details</h3>
              <div style={{ display: "grid", gap: "0.75rem", fontSize: "0.9rem" }}>
                <div><strong>Name:</strong> {project.name}</div>
                <div><strong>Description:</strong> {project.description}</div>
                <div><strong>Type:</strong> {project.type}</div>
                <div><strong>Version:</strong> {project.version}</div>
                <div><strong>Status:</strong> <span style={{
                  color: project.status === "checked-out" ? "var(--lz-orange)" : "var(--lz-green)",
                  fontWeight: "600"
                }}>
                  {project.status === "checked-out" ? "Checked Out" : "Available"}
                </span></div>
                <div><strong>Owner:</strong> {project.owner?.name || project.owner?.username}</div>
                <div><strong>Members:</strong> {project.members?.map((m) => m.name || m.username).join(", ") || "None"}</div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: "1rem" }}>Quick Stats</h3>
              <div style={{ display: "grid", gap: "0.75rem", fontSize: "0.9rem" }}>
                <div>📁 {project.files?.length || 0} files</div>
                <div>💬 {project.checkIns?.length || 0} check-ins</div>
                <div>👥 {project.members?.length || 0} members</div>
                <div>🏷️ {project.languages?.length || 0} languages</div>
              </div>
            </div>
          </div>
        )}

        {/* Files Tab - UPDATED */}
        {activeTab === "files" && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0 }}>Project Files ({project.files?.length || 0})</h3>
              {canAddFiles && (
                <button onClick={() => setShowAddFiles(true)} style={{
                  padding: "0.5rem 1rem",
                  background: "var(--lz-primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  cursor: "pointer"
                }}>
                  + Add Files
                </button>
              )}
            </div>

            {(!project.files || project.files.length === 0) ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--lz-text-muted)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📁</div>
                <p>No files uploaded yet</p>
                {canAddFiles && (
                  <button onClick={() => setShowAddFiles(true)} style={{
                    marginTop: "1rem",
                    padding: "0.5rem 1rem",
                    background: "var(--lz-primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}>
                    Upload First File
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {project.files.map((file) => (
                  <div
                    key={file._id}
                    style={{
                      padding: "0.75rem",
                      background: "var(--lz-surface-elevated)",
                      borderRadius: "6px",
                      border: "1px solid var(--lz-border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                        📄 {file.name}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--lz-text-muted)" }}>
                        {file.size} • Uploaded by {file.uploadedBy?.name || file.uploadedBy?.username || "Unknown"}
                        {file.uploadedAt && ` • ${new Date(file.uploadedAt).toLocaleDateString()}`}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button 
                        onClick={() => handlePreviewFile(file._id)}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "transparent",
                          color: "var(--lz-primary)",
                          border: "1px solid var(--lz-primary)",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          cursor: "pointer"
                        }}
                      >
                        👁️ Preview
                      </button>
                      <button 
                        onClick={() => handleDownloadFile(file._id, file.name)}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "var(--lz-primary)",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          cursor: "pointer"
                        }}
                      >
                        ⬇️ Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0 }}>Project Members ({project.members?.length || 0})</h3>
              {canAddMembers && (
                <button onClick={() => setShowAddMember(true)} style={{
                  padding: "0.5rem 1rem",
                  background: "var(--lz-primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  cursor: "pointer"
                }}>
                  + Add Member
                </button>
              )}
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              {/* Owner */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem",
                  background: "var(--lz-surface-elevated)",
                  borderRadius: "8px",
                }}
              >
                <img
                  src={project.owner?.profileImage || "/placeholder.svg"}
                  alt={project.owner?.name}
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.src = "/placeholder.svg";
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600" }}>
                    {project.owner?.name || project.owner?.username}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--lz-text-muted)" }}>
                    @{project.owner?.username}
                  </div>
                </div>
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    background: "var(--lz-purple)",
                    color: "white",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                  }}
                >
                   Owner
                </span>
              </div>

              {/* Other Members */}
              {project.members?.filter(m => 
                (m._id || m.id) !== (project.owner?._id || project.owner?.id)
              ).map((member) => (
                <div
                  key={member._id || member.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem",
                    background: "var(--lz-surface-elevated)",
                    borderRadius: "8px",
                  }}
                >
                  <img
                    src={member.profileImage || "/placeholder.svg"}
                    alt={member.name}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.src = "/placeholder.svg";
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600" }}>{member.name || member.username}</div>
                    <div style={{ fontSize: "0.875rem", color: "var(--lz-text-muted)" }}>
                      @{member.username}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      background: "var(--lz-primary)",
                      color: "white",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                    }}
                  >
                    Member
                  </span>
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveMember(member._id || member.id, member.name || member.username)}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "transparent",
                        color: "var(--lz-red)",
                        border: "1px solid var(--lz-red)",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        cursor: "pointer"
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="card">
            <h3 style={{ marginBottom: "1rem" }}>Check-in History ({project.checkIns?.length || 0})</h3>

            {(!project.checkIns || project.checkIns.length === 0) ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--lz-text-muted)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📝</div>
                <p>No check-in history yet</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {project.checkIns.map((checkIn) => (
                  <div
                    key={checkIn._id}
                    style={{
                      padding: "1rem",
                      background: "var(--lz-surface-elevated)",
                      borderRadius: "8px",
                      borderLeft: "4px solid var(--lz-primary)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <div>
                        <strong>{checkIn.user?.name || checkIn.user?.username}</strong> checked in
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            padding: "0.125rem 0.375rem",
                            background: "var(--lz-primary)",
                            color: "white",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                          }}
                        >
                          v{checkIn.version}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.8rem", color: "var(--lz-text-muted)" }}>
                        {new Date(checkIn.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontStyle: "italic", color: "var(--lz-text-secondary)" }}>
                      "{checkIn.message}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      {showPreview && previewFile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem"
          }}
          onClick={() => setShowPreview(false)}
        >
          <div
            style={{
              background: "var(--lz-surface-elevated)",
              borderRadius: "8px",
              maxWidth: "900px",
              width: "100%",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Header */}
            <div style={{
              padding: "1rem",
              borderBottom: "1px solid var(--lz-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0, color: "var(--lz-text-primary)" }}>
                  📄 {previewFile.name}
                </h3>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "var(--lz-text-muted)" }}>
                  {previewFile.size} • {previewFile.type}
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "transparent",
                  color: "var(--lz-text-muted)",
                  border: "1px solid var(--lz-border)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "1rem"
                }}
              >
                ✕ Close
              </button>
            </div>

            {/* Preview Content */}
            <div style={{
              flex: 1,
              overflow: "auto",
              padding: "1rem"
            }}>
              <pre style={{
                background: "var(--lz-surface)",
                padding: "1rem",
                borderRadius: "4px",
                overflow: "auto",
                fontFamily: "var(--font-mono)",
                fontSize: "0.875rem",
                lineHeight: "1.5",
                color: "var(--lz-text-primary)",
                margin: 0
              }}>
                <code>{previewFile.content}</code>
              </pre>
            </div>

            {/* Preview Footer */}
            <div style={{
              padding: "1rem",
              borderTop: "1px solid var(--lz-border)",
              display: "flex",
              gap: "1rem",
              justifyContent: "flex-end"
            }}>
              <button
                onClick={() => handleDownloadFile(previewFile._id || previewFile.id, previewFile.name)}
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
                ⬇️ Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProjectPage;