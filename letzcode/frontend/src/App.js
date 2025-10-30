import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { getCurrentUser } from "./api";
import { showToast } from "./utils/toast";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import SplashPage from "./pages/SplashPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ProjectPage from "./pages/ProjectPage";
import FriendsPage from "./pages/FriendsPage";
import FriendProfilePage from "./pages/FriendProfilePage";
import HistoryPage from "./pages/HistoryPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState("dark");
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
      } else {
        localStorage.clear();
      }
    }
    setIsLoading(false);
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData.user);
    localStorage.setItem("token", userData.token);
    localStorage.setItem("userId", userData.user.id);
    
    if (!userData.user.profileCompleted) {
      navigate(`/profile/${userData.user.id}`);
    } else {
      navigate("/home");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.clear();
    navigate("/");
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    showToast.success(`Switched to ${newTheme} mode`);
  };

  const handleSearch = (searchTerm) => {
    navigate(`/friends?search=${encodeURIComponent(searchTerm)}`);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        background: "var(--lz-background)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
          <div style={{ color: "var(--lz-text-primary)" }}>Loading LetzCode...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="lz-body">
      <Toaster />
      
      {isAuthenticated && (
        <>
          <Header 
            currentUser={currentUser} 
            onLogout={handleLogout}
            onSearch={handleSearch}
          />
          <div style={{ display: "flex" }}>
            <Sidebar 
              currentUser={currentUser}
              onThemeToggle={handleThemeToggle}
            />
            <div style={{ flex: 1, minHeight: "calc(100vh - 64px)", padding: "2rem" }}>
              <Routes>
                <Route path="/home" element={<HomePage currentUser={currentUser} />} />
                <Route path="/profile/:userId" element={<ProfilePage currentUser={currentUser} />} />
                <Route path="/project/:projectId" element={<ProjectPage currentUser={currentUser} />} />
                <Route path="/friends" element={<FriendsPage currentUser={currentUser} />} />
                <Route path="/friend/:friendId" element={<FriendProfilePage currentUser={currentUser} />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </div>
          </div>
        </>
      )}

      {!isAuthenticated && (
        <Routes>
          <Route path="/" element={<SplashPage onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  );
}

export default App;