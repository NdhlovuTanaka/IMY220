import React from "react";

const HistoryPage = () => {
  return (
    <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem", fontSize: "2rem", color: "var(--lz-text-primary)" }}>
        History
      </h1>
      
      <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📜</div>
        <h3 style={{ marginBottom: "0.5rem", color: "var(--lz-text-primary)" }}>Coming Soon</h3>
        <p style={{ color: "var(--lz-text-muted)" }}>
          Activity history will be available here
        </p>
      </div>
    </main>
  );
};

export default HistoryPage;