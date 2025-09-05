import React, { useState } from "react";
import { signin } from "../../api";

export default function SignInForm({ onSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");

    const emailOk = /.+@.+\..+/.test(email);
    const passOk = password.length >= 1;
    const valid = emailOk && passOk;

    async function handleSubmit(e){
        e.preventDefault();
        if(!valid) return setErr("Please enter valid email and password");
        
        const data = await signin({ email, password });
        if(data?.ok){
            localStorage.setItem("token", data.token);
            localStorage.setItem("email", data.user?.email || email);
            onSuccess?.(data);
        } else {
            setErr("Sign in failed. Please try again.");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>Email <input value={email} onChange={e=>setEmail(e.target.value)} required type="email"/></label>
            <label>Password <input value={password} onChange={e=>setPassword(e.target.value)} required type="password"/></label>
            {!emailOk && email && <small>Enter a valid email</small>}
            {err && <p style={{color:"crimson"}}>{err}</p>}
            <button type="submit" disabled={!valid}>Sign In</button>
        </form>
    );
}