const API_BASE_URL = "";

// Auth APIs
export async function signup(credentials) {
    try {
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Sign up failed"
            };
        }
        
        return data;
    } catch (error) {
        console.error("API signup error:", error);
        return {
            ok: false,
            message: "Network error. Please check your connection."
        };
    }
}

export async function signin(credentials) {
    try {
        const res = await fetch("/api/auth/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Sign in failed"
            };
        }
        
        return data;
    } catch (error) {
        console.error("API signin error:", error);
        return {
            ok: false,
            message: "Network error. Please check your connection."
        };
    }
}

export async function getCurrentUser(){
    try {
        const token = localStorage.getItem("token");
        if (!token) return null;
        
        const res = await fetch("/api/auth/me", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        if (!res.ok) return null;
        
        const data = await res.json();
        return data.user;
    } catch (error) {
        console.error("Get current user error:", error);
        return null;
    }
}

// Profile APIs
export async function getUserProfile(userId){
    try {
        const res = await fetch(`/api/profile/${userId}`);
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to fetch profile"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Get profile error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function updateProfile(profileData){
    try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to update profile"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Update profile error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function deleteProfile(){
    try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/profile", {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to delete profile"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Delete profile error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

// Project APIs
export async function createProject(projectData) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/projects", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(projectData)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to create project"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Create project error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function getProjects(type = null, userId = null) {
    try {
        const token = localStorage.getItem("token");
        let url = "/api/projects";
        const params = new URLSearchParams();
        
        if (type) params.append("type", type);
        if (userId) params.append("userId", userId);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        const res = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to fetch projects"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Get projects error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function getProject(projectId) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/projects/${projectId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to fetch project"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Get project error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function updateProject(projectId, projectData) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/projects/${projectId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(projectData)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to update project"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Update project error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function deleteProject(projectId) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/projects/${projectId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to delete project"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Delete project error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function checkoutProject(projectId) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/projects/${projectId}/checkout`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to checkout project"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Checkout project error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function checkinProject(projectId, checkinData) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/projects/${projectId}/checkin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(checkinData)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to checkin project"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Checkin project error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

// Activity APIs
export async function getActivityFeed(type = "local", sort = "date", limit = 50) {
    try {
        const token = localStorage.getItem("token");
        const params = new URLSearchParams({ type, sort, limit: limit.toString() });
        
        const res = await fetch(`/api/activity?${params.toString()}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to fetch activity feed"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Get activity feed error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

// Friend APIs
export async function sendFriendRequest(userId) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/friends/request", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ userId })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to send friend request"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Send friend request error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function acceptFriendRequest(userId) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/friends/accept", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ userId })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to accept friend request"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Accept friend request error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function rejectFriendRequest(userId) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/friends/reject", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ userId })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to reject friend request"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Reject friend request error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function removeFriend(friendId) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/friends/${friendId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to remove friend"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Remove friend error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function cancelFriendRequest(userId) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/friends/cancel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ userId })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to cancel friend request"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Cancel friend request error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function getFriends() {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/friends", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to fetch friends"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Get friends error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function searchUsers(query) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/friends/search?query=${encodeURIComponent(query)}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to search users"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Search users error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function getMutualData(friendId) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/friends/${friendId}/mutual`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to fetch mutual data"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Get mutual data error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

// Notification APIs
export async function getNotifications() {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/notifications", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to fetch notifications"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Get notifications error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function markNotificationRead(notificationId) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/notifications/${notificationId}/read`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to mark notification as read"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Mark notification read error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function markAllNotificationsRead() {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/notifications/read-all", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to mark all notifications as read"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Mark all notifications read error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}

export async function deleteNotification(notificationId) {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/notifications/${notificationId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            return {
                ok: false,
                message: data.message || "Failed to delete notification"
            };
        }
        
        return data;
    } catch (error) {
        console.error("Delete notification error:", error);
        return {
            ok: false,
            message: "Network error"
        };
    }
}