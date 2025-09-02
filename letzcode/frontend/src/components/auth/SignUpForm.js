import React, { useState } from "react";
import { signup } from "../../api";


export default function SignUpForm({ onSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [err, setErr] = useState("");


    const emailOk = /.+@.+\..+/.test(email);
    const passOk = password.length >= 6;
    const match = password === confirm;
    const valid = emailOk && passOk && match;


    async function handleSubmit(e){
        e.preventDefault();
        if(!valid) return setErr("Check email, password length, and matching passwords");
        const data = await signup({ email, password });
        if(data?.ok){
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.user?.email || email);
        onSuccess?.(data);
        }
    }


    return (
        <form onSubmit={handleSubmit}>
        <label>Email <input value={email} onChange={e=>setEmail(e.target.value)} required type="email"/></label>
        <label>Password <input value={password} onChange={e=>setPassword(e.target.value)} required type="password" minLength={6}/></label>
        <label>Confirm <input value={confirm} onChange={e=>setConfirm(e.target.value)} required type="password"/></label>
        {!emailOk && <small>Enter a valid email</small>}
        {!passOk && <small>Password must be 6+ chars</small>}
        {!match && <small>Passwords must match</small>}
        {err && <p style={{color:"crimson"}}>{err}</p>}
        <button type="submit" disabled={!valid}>Sign Up</button>
        </form>
    );
}