import React from "react";
import { useState, useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import Header from "./components/Header"
import SplashPage from "./pages/SplashPage"
import HomePage from "./pages/HomePage"
import ProfilePage from "./pages/ProfilePage"
import ProjectPage from "./pages/ProjectPage"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem("authToken")
    const user = localStorage.getItem("currentUser")
    if (token && user) {
      setIsAuthenticated(true)
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setCurrentUser(userData)
    localStorage.setItem("authToken", userData.token)
    localStorage.setItem("currentUser", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    localStorage.removeItem("authToken")
    localStorage.removeItem("currentUser")
  }

  return (
    <div className="lz-body">
      {isAuthenticated && <Header currentUser={currentUser} onLogout={handleLogout} />}

      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <SplashPage onLogin={handleLogin} />}
        />
        <Route
          path="/home"
          element={isAuthenticated ? <HomePage currentUser={currentUser} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/profile/:userId"
          element={isAuthenticated ? <ProfilePage currentUser={currentUser} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/project/:projectId"
          element={isAuthenticated ? <ProjectPage currentUser={currentUser} /> : <Navigate to="/" replace />}
        />
      </Routes>
    </div>
  )
}

export default App
