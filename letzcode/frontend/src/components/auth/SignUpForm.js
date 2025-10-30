import React, { useState } from "react";
import { signup } from "../../api";

export default function SignUpForm({ onSuccess }) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [err, setErr] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const emailOk = /.+@.+\..+/.test(email);
    const usernameOk = username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
    const passOk = password.length >= 6;
    const match = password === confirm;
    const valid = emailOk && usernameOk && passOk && match;

    async function handleSubmit(e){
        e.preventDefault();
        setErr(""); // Clear previous errors
        
        if(!emailOk) {
            return setErr("Please enter a valid email address");
        }
        if(!usernameOk) {
            return setErr("Username must be at least 3 characters and contain only letters, numbers, and underscores");
        }
        if(!passOk) {
            return setErr("Password must be at least 6 characters long");
        }
        if(!match) {
            return setErr("Passwords do not match");
        }
        
        setIsLoading(true);
        
        try {
            const data = await signup({ email, username, password });
            
            if(data?.ok){
                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", data.user?.id);
                onSuccess?.(data);
            } else {
                // Display the error message from the server
                setErr(data?.message || "Sign up failed. Please try again.");
            }
        } catch (error) {
            console.error("Sign up error:", error);
            setErr("Network error. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Email 
                <input 
                    value={email} 
                    onChange={e=>setEmail(e.target.value)} 
                    required 
                    type="email"
                    disabled={isLoading}
                    placeholder="your.email@example.com"
                />
            </label>
            
            <label>
                Username 
                <input 
                    value={username} 
                    onChange={e=>setUsername(e.target.value)} 
                    required 
                    type="text"
                    disabled={isLoading}
                    placeholder="johndoe"
                    minLength={3}
                />
            </label>
            
            <label>
                Password 
                <input 
                    value={password} 
                    onChange={e=>setPassword(e.target.value)} 
                    required 
                    type="password" 
                    minLength={6}
                    disabled={isLoading}
                    placeholder="At least 6 characters"
                />
            </label>
            <label>
                Confirm Password 
                <input 
                    value={confirm} 
                    onChange={e=>setConfirm(e.target.value)} 
                    required 
                    type="password"
                    disabled={isLoading}
                    placeholder="Re-enter your password"
                />
            </label>
            
            {/* Validation hints */}
            <div style={{fontSize: "0.85rem", marginTop: "0.5rem"}}>
                {!emailOk && email && (
                    <div style={{color:"#f59e0b", marginBottom: "0.25rem"}}>
                        ⚠️ Enter a valid email
                    </div>
                )}
                {!usernameOk && username && (
                    <div style={{color:"#f59e0b", marginBottom: "0.25rem"}}>
                        ⚠️ Username must be 3+ characters (letters, numbers, underscores only)
                    </div>
                )}
                {!passOk && password && (
                    <div style={{color:"#f59e0b", marginBottom: "0.25rem"}}>
                        ⚠️ Password must be 6+ characters
                    </div>
                )}
                {!match && confirm && (
                    <div style={{color:"#f59e0b", marginBottom: "0.25rem"}}>
                        ⚠️ Passwords must match
                    </div>
                )}
            </div>
            
            {/* Error message */}
            {err && (
                <div style={{
                    color: "white",
                    background: "#ef4444",
                    padding: "0.75rem",
                    borderRadius: "6px",
                    marginTop: "0.5rem",
                    fontSize: "0.9rem"
                }}>
                    ⚠️ {err}
                </div>
            )}
            
            <button type="submit" disabled={!valid || isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
            </button>
        </form>
    );
}