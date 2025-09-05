import React from "react";
import { useState, useEffect } from "react";
import ProjectPreview from "./project/ProjectPreview";

const Feed = ({ feedType = "local", currentUser }) => {
  const [activities, setActivities] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [isLoading, setIsLoading] = useState(true);

  // Dummy data for demo
  const dummyActivities = [
    {
      id: 1,
      type: "check-in",
      user: "John Doe",
      project: {
        id: 1,
        name: "React Todo App",
        description: "A simple todo application built with React",
        owner: "John Doe",
        languages: ["JavaScript", "CSS", "HTML"],
        status: "checked-in",
        createdAt: "2024-09-01T10:00:00Z",
        image: "/react-app-interface.png",
      },
      message: "Added user authentication and improved UI",
      timestamp: "2024-09-05T14:30:00Z",
    },
    {
      id: 2,
      type: "check-out",
      user: "Jane Smith",
      project: {
        id: 2,
        name: "Python Data Analyzer",
        description: "Data analysis tool for CSV files",
        owner: "Jane Smith",
        languages: ["Python", "Pandas"],
        status: "checked-out",
        createdAt: "2024-08-28T09:15:00Z",
        image: "/python-data-visualization.png",
      },
      message: "Working on new visualization features",
      timestamp: "2024-09-05T12:15:00Z",
    },
    {
      id: 3,
      type: "create",
      user: "Mike Johnson",
      project: {
        id: 3,
        name: "Mobile Game Engine",
        description: "Cross-platform game engine for mobile devices",
        owner: "Mike Johnson",
        languages: ["C++", "OpenGL"],
        status: "checked-in",
        createdAt: "2024-09-04T16:45:00Z",
        image: "/placeholder-hhxef.png",
      },
      message: "Initial project setup and core architecture",
      timestamp: "2024-09-04T16:45:00Z",
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setActivities(dummyActivities);
      setIsLoading(false);
    }, 1000);
  }, [feedType]);

  const sortedActivities = [...activities].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    return 0;
  });

  const getActivityIcon = (type) => {
    switch (type) {
      case "check-in":
        return "📥";
      case "check-out":
        return "📤";
      case "create":
        return "✨";
      default:
        return "📋";
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case "check-in":
        return `checked in "${activity.project.name}"`;
      case "check-out":
        return `checked out "${activity.project.name}"`;
      case "create":
        return `created new project "${activity.project.name}"`;
      default:
        return `updated "${activity.project.name}"`;
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "var(--lz-text-muted)" }}>
        Loading {feedType} activity...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ color: "var(--lz-text-primary)" }}>
          {feedType === "local" ? "Your Activity Feed" : "Global Activity Feed"}
        </h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ width: "auto", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--lz-border)" }}
        >
          <option value="date">Sort by Date</option>
          <option value="popularity">Sort by Popularity</option>
        </select>
      </div>

      <div className="grid" style={{ gap: "1rem" }}>
        {sortedActivities.map((activity) => (
          <div key={activity.id} className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "1.5rem" }}>{getActivityIcon(activity.type)}</span>
              <div>
                <p style={{ margin: 0, color: "var(--lz-text-primary)" }}>
                  <strong>{activity.user}</strong> {getActivityText(activity)}
                </p>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--lz-text-muted)" }}>
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            {activity.message && (
              <p className="activity-description">"{activity.message}"</p>
            )}

            <ProjectPreview project={activity.project} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;