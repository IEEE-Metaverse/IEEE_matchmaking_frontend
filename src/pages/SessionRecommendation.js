import React, { useEffect, useState } from "react";
import "../styles/schedule.css";
import { demoSessions } from "../data/sessions"; // fallback if API not working

const SessionRecommendation = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from Python backend
    fetch("http://localhost:5000/api/schedule")
      .then((res) => res.json())
      .then((data) => {
        setScheduleData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API error, using demo data:", err);
        setScheduleData(demoSessions); // fallback to local data
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="loading">Loading schedule...</p>;
  }

  return (
    <div className="schedule-container">
      <h2>Conference Schedule</h2>
      {scheduleData.map((day, index) => (
        <div className="schedule-day" key={index}>
          <div className="day-label">{day.date}</div>

          {day.sessions.map((session, idx) => (
            <div
              key={idx}
              className={`session ${session.recommended ? "recommended" : ""}`}
            >
              <div className="session-title">{session.title}</div>
              <div className="session-time">⏰ {session.time}</div>
              <div className="session-location">📍 {session.location}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SessionRecommendation;
