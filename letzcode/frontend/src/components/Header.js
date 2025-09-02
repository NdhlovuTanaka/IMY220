import React from "react";
import {Link} from "react-router-dom";

export default function Header({siteName, user}){
    return (
            <header style={{display:"flex",gap:"1rem",padding:"12px",borderBottom:"1px solid #ddd"}}>
            <strong>{siteName}</strong>
            <nav style={{display:"flex",gap:"1rem"}}>
            <Link to="/home">Home</Link>
            <Link to={`/profile/${user?.id || "guest"}`}>Profile</Link>
            </nav>
            <span style={{marginLeft:"auto"}}>Signed in as: {user?.email || "Guest"}</span>
            </header>
    );
}