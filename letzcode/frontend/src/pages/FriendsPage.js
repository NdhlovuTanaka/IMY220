import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, searchUsers, getProjects } from "../api";
import { showToast } from "../utils/toast";

const FriendsPage = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mutualProjects, setMutualProjects] = useState({});

  useEffect(() => {
    fetchFriendsData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchFriendsData = async () => {
    setIsLoading(true);
    const data = await getFriends();
    
    if (data.ok) {
      setFriends(data.friends);
      setFriendRequests(data.friendRequests);
      
      // Fetch projects to calculate mutual projects
      const projectsData = await getProjects("my");
      if (projectsData.ok) {
        calculateMutualProjects(data.friends, projectsData.projects);
      }
    } else {
      showToast.error(data.message || "Failed to load friends");
    }
    
    setIsLoading(false);
  };

  const calculateMutualProjects = (friendsList, projects) => {
    const mutual = {};
    
    friendsList.forEach(friend => {
      const sharedProjects = projects.filter(project => 
        project.members && project.members.some(member => 
          member.id === friend.id || member._id === friend.id
        )
      );
      mutual[friend.id] = sharedProjects.length;
    });
    
    setMutualProjects(mutual);
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    
    setIsSearching(true);
    const data = await searchUsers(searchQuery.trim());
    
    if (data.ok) {
      setSearchResults(data.users);
    } else {
      showToast.error(data.message || "Failed to search users");
    }
    
    setIsSearching(false);
  };

  const handleSendRequest = async (userId) => {
    const data = await sendFriendRequest(userId);
    
    if (data.ok) {
      showToast.success("Friend request sent");
      // Update search results to reflect new status
      setSearchResults(results =>
        results.map(user =>
          user.id === userId ? { ...user, friendStatus: 'outgoing' } : user
        )
      );
    } else {
      showToast.error(data.message || "Failed to send friend request");
    }
  };

  const handleAcceptRequest = async (userId) => {
    const data = await acceptFriendRequest(userId);
    
    if (data.ok) {
      showToast.success("Friend request accepted");
      fetchFriendsData(); // Refresh data
    } else {
      showToast.error(data.message || "Failed to accept friend request");
    }
  };

  const handleRejectRequest = async (userId) => {
    const data = await rejectFriendRequest(userId);
    
    if (data.ok) {
      showToast.success("Friend request rejected");
      setFriendRequests(requests => requests.filter(req => req.id !== userId));
    } else {
      showToast.error(data.message || "Failed to reject friend request");
    }
  };

  const handleRemoveFriend = async (friendId, friendName) => {
    const confirmed = window.confirm(`Are you sure you want to remove ${friendName} from your friends?`);
    
    if (!confirmed) return;
    
    const data = await removeFriend(friendId);
    
    if (data.ok) {
      showToast.success("Friend removed");
      setFriends(friends => friends.filter(friend => friend.id !== friendId));
    } else {
      showToast.error(data.message || "Failed to remove friend");
    }
  };

  const getFriendActionButton = (user) => {
    switch (user.friendStatus) {
      case 'friends':
        return null;
      case 'incoming':
        return (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => handleAcceptRequest(user.id)}
              style={{
                padding: "0.5rem 1rem",
                background: "var(--lz-primary)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.875rem",
                cursor: "pointer"
              }}
            >
              Accept
            </button>
            <button
              onClick={() => handleRejectRequest(user.id)}
              style={{
                padding: "0.5rem 1rem",
                background: "transparent",
                color: "var(--lz-text-secondary)",
                border: "1px solid var(--lz-border)",
                borderRadius: "6px",
                fontSize: "0.875rem",
                cursor: "pointer"
              }}
            >
              Reject
            </button>
          </div>
        );
      case 'outgoing':
        return (
          <button
            disabled
            style={{
              padding: "0.5rem 1rem",
              background: "var(--lz-surface)",
              color: "var(--lz-text-muted)",
              border: "1px solid var(--lz-border)",
              borderRadius: "6px",
              fontSize: "0.875rem",
              cursor: "not-allowed"
            }}
          >
            Request Sent
          </button>
        );
      default:
        return (
          <button
            onClick={() => handleSendRequest(user.id)}
            style={{
              padding: "0.5rem 1rem",
              background: "var(--lz-primary)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.875rem",
              cursor: "pointer"
            }}
          >
            Add Friend
          </button>
        );
    }
  };

  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem", fontSize: "2rem", color: "var(--lz-text-primary)" }}>
        Friends
      </h1>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by name, username, or email..."
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            background: "var(--lz-surface)",
            border: "1px solid var(--lz-border)",
            borderRadius: "6px",
            color: "var(--lz-text-primary)",
            fontSize: "1rem"
          }}
        />
        
        {isSearching && (
          <div style={{ marginTop: "1rem", color: "var(--lz-text-muted)" }}>
            Searching...
          </div>
        )}
        
        {searchResults.length > 0 && (
          <div style={{ marginTop: "1rem", display: "grid", gap: "0.75rem" }}>
            {searchResults.map((user) => (
              <div
                key={user.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem",
                  background: "var(--lz-surface-elevated)",
                  borderRadius: "8px"
                }}
              >
                <Link
                  to={`/profile/${user.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    textDecoration: "none",
                    flex: 1
                  }}
                >
                  <img
                    src={user.profileImage || "/placeholder.svg"}
                    alt={user.name}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      objectFit: "cover"
                    }}
                  />
                  <div>
                    <div style={{ color: "var(--lz-text-primary)", fontWeight: "600" }}>
                      {user.name}
                    </div>
                    <div style={{ color: "var(--lz-text-muted)", fontSize: "0.875rem" }}>
                      @{user.username}
                    </div>
                    {user.work && (
                      <div style={{ color: "var(--lz-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                        {user.work}
                      </div>
                    )}
                  </div>
                </Link>
                {getFriendActionButton(user)}
              </div>
            ))}
          </div>
        )}
        
        {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
          <div style={{ marginTop: "1rem", color: "var(--lz-text-muted)", textAlign: "center" }}>
            No users found
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "1.5rem", borderBottom: "2px solid var(--lz-border)" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setActiveTab("friends")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "friends" ? "3px solid var(--lz-primary)" : "3px solid transparent",
              color: activeTab === "friends" ? "var(--lz-primary)" : "var(--lz-text-secondary)",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: "-2px"
            }}
          >
            My Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === "requests" ? "3px solid var(--lz-primary)" : "3px solid transparent",
              color: activeTab === "requests" ? "var(--lz-primary)" : "var(--lz-text-secondary)",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
              marginBottom: "-2px"
            }}
          >
            Requests ({friendRequests.length})
          </button>
        </div>
      </div>

      {/* Friends List */}
      {activeTab === "friends" && (
        <div>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--lz-text-muted)" }}>
              Loading friends...
            </div>
          ) : friends.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👥</div>
              <h3 style={{ marginBottom: "0.5rem", color: "var(--lz-text-primary)" }}>No friends yet</h3>
              <p style={{ color: "var(--lz-text-muted)" }}>
                Search for users above to connect with other developers
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {friends.map((friend) => (
                <div key={friend.id} className="card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link
                      to={`/friend/${friend.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        textDecoration: "none",
                        flex: 1
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
                      />
                      <div>
                        <div style={{ color: "var(--lz-text-primary)", fontWeight: "600", fontSize: "1.1rem" }}>
                          {friend.name}
                        </div>
                        <div style={{ color: "var(--lz-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                          @{friend.username}
                        </div>
                        {friend.work && (
                          <div style={{ color: "var(--lz-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                            {friend.work}
                          </div>
                        )}
                        {mutualProjects[friend.id] > 0 && (
                          <div style={{ color: "var(--lz-primary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                            {mutualProjects[friend.id]} mutual project{mutualProjects[friend.id] !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={() => handleRemoveFriend(friend.id, friend.name)}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "transparent",
                        color: "#ef4444",
                        border: "1px solid #ef4444",
                        borderRadius: "6px",
                        fontSize: "0.875rem",
                        cursor: "pointer"
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Friend Requests */}
      {activeTab === "requests" && (
        <div>
          {friendRequests.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📬</div>
              <h3 style={{ marginBottom: "0.5rem", color: "var(--lz-text-primary)" }}>No friend requests</h3>
              <p style={{ color: "var(--lz-text-muted)" }}>
                When someone sends you a friend request, it will appear here
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {friendRequests.map((request) => (
                <div key={request.id} className="card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link
                      to={`/profile/${request.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        textDecoration: "none",
                        flex: 1
                      }}
                    >
                      <img
                        src={request.profileImage || "/placeholder.svg"}
                        alt={request.name}
                        style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "50%",
                          objectFit: "cover"
                        }}
                      />
                      <div>
                        <div style={{ color: "var(--lz-text-primary)", fontWeight: "600", fontSize: "1.1rem" }}>
                          {request.name}
                        </div>
                        <div style={{ color: "var(--lz-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                          @{request.username}
                        </div>
                        {request.work && (
                          <div style={{ color: "var(--lz-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                            {request.work}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        style={{
                          padding: "0.5rem 1.5rem",
                          background: "var(--lz-primary)",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "0.875rem",
                          cursor: "pointer"
                        }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        style={{
                          padding: "0.5rem 1rem",
                          background: "transparent",
                          color: "var(--lz-text-secondary)",
                          border: "1px solid var(--lz-border)",
                          borderRadius: "6px",
                          fontSize: "0.875rem",
                          cursor: "pointer"
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default FriendsPage;