import React, { useState } from "react";
import { signin } from "../../api";

export default function SignInForm({ onSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const emailOk = /.+@.+\..+/.test(email);
    const passOk = password.length >= 1;
    const valid = emailOk && passOk;

    async function handleSubmit(e){
        e.preventDefault();
        setErr(""); // Clear previous errors
        
        if(!valid) {
            return setErr("Please enter valid email and password");
        }
        
        setIsLoading(true);
        
        try {
            const data = await signin({ email, password });
            
            if(data?.ok){
                localStorage.setItem("token", data.token);
                localStorage.setItem("email", data.user?.email || email);
                onSuccess?.(data);
            } else {
                // Display the error message from the server
                setErr(data?.message || "Sign in failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("Sign in error:", error);
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
                />
            </label>
            <label>
                Password 
                <input 
                    value={password} 
                    onChange={e=>setPassword(e.target.value)} 
                    required 
                    type="password"
                    disabled={isLoading}
                />
            </label>
            {!emailOk && email && <small style={{color:"var(--lz-warning)"}}>Enter a valid email</small>}
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
                {isLoading ? "Signing in..." : "Sign In"}
            </button>
        </form>
    );
}