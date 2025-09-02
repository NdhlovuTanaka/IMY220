import React, {useState} from "react";
import { signin } from "../../api";

export default function SignInForm({ onSuccess }){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const[err, setErr] = useState("");

    const valid = /.+@.+\..+/.test(email) && password.length >= 6;

    async function handleSubmit(e){
        e.preventDefault();
        if(!valid) return setErr("Please enter a valid email and 6+ char password");
        const data = await signin({ email, password });
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
    {err && <p style={{color:"crimson"}}>{err}</p>}
    <button type="submit" disabled={!valid}>Sign In</button>
    </form>
    );
}