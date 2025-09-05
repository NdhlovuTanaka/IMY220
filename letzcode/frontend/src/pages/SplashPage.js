import React, { useState } from "react";
import SignInForm from "../components/auth/SignInForm";
import SignUpForm from "../components/auth/SignUpForm";

export default function SplashPage({ onLogin }) {
    const [activeForm, setActiveForm] = useState("signin");

    function handleSuccess(data) {
        // Pass the user data to the App component
        const userData = {
            id: data.user?.id || "u123",
            name: data.user?.name || data.user?.email || "User",
            email: data.user?.email,
            token: data.token
        };
        onLogin(userData);
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(135deg, var(--lz-black) 0%, #1a1a2e 50%, var(--lz-purple) 100%)",
            }}
        >
            {/* Hero Section */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "2rem",
                    textAlign: "center",
                }}
            >
                <div style={{ maxWidth: "1200px", width: "100%" }}>
                    <div style={{ marginBottom: "3rem" }}>
                        <h1
                            style={{
                                fontSize: "4rem",
                                fontWeight: "800",
                                margin: "0 0 1rem 0",
                                background: "linear-gradient(45deg, var(--lz-white), var(--lz-purple))",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            LetzCode
                        </h1>
                        <p
                            style={{
                                fontSize: "1.5rem",
                                color: "var(--lz-muted)",
                                margin: "0 0 2rem 0",
                                maxWidth: "600px",
                                marginLeft: "auto",
                                marginRight: "auto",
                            }}
                        >
                            Collaborate on code projects with version control made simple. Share, track, and manage your development
                            workflow.
                        </p>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                gap: "2rem",
                                margin: "3rem 0",
                            }}
                        >
                            <div className="card" style={{ textAlign: "left" }}>
                                <h3 style={{ color: "var(--lz-purple)", marginBottom: "1rem" }}>🔄 Version Control</h3>
                                <p style={{ color: "var(--lz-muted)" }}>
                                    Check in and check out projects with ease. Track changes and collaborate safely.
                                </p>
                            </div>

                            <div className="card" style={{ textAlign: "left" }}>
                                <h3 style={{ color: "var(--lz-purple)", marginBottom: "1rem" }}>👥 Team Collaboration</h3>
                                <p style={{ color: "var(--lz-muted)" }}>
                                    Add friends, share projects, and work together on code with built-in messaging.
                                </p>
                            </div>

                            <div className="card" style={{ textAlign: "left" }}>
                                <h3 style={{ color: "var(--lz-purple)", marginBottom: "1rem" }}>📊 Project Management</h3>
                                <p style={{ color: "var(--lz-muted)" }}>
                                    Organize your projects, track activity, and manage your development workflow.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Auth Forms */}
                    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "2rem" }}>
                            <button
                                onClick={() => setActiveForm("signin")}
                                style={{
                                    background: activeForm === "signin" ? "var(--lz-purple)" : "transparent",
                                    border: "1px solid var(--lz-purple)",
                                }}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setActiveForm("signup")}
                                style={{
                                    background: activeForm === "signup" ? "var(--lz-purple)" : "transparent",
                                    border: "1px solid var(--lz-purple)",
                                }}
                            >
                                Sign Up
                            </button>
                        </div>

                        <div className="card" style={{ maxWidth: "400px", margin: "0 auto" }}>
                            {activeForm === "signin" ? (
                                <div>
                                    <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Sign In</h3>
                                    <SignInForm onSuccess={handleSuccess} />
                                </div>
                            ) : (
                                <div>
                                    <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Sign Up</h3>
                                    <SignUpForm onSuccess={handleSuccess} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer
                style={{
                    padding: "2rem",
                    textAlign: "center",
                    borderTop: "1px solid #1d1d27",
                    color: "var(--lz-muted)",
                }}
            >
                <p>&copy; 2025 LetzCode. .</p>
            </footer>
        </div>
    );
}