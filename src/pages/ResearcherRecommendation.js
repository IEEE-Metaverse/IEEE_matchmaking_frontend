import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/researcher.css";

export default function ResearcherRecommendation() {
  const [mutualItems, setMutualItems] = useState([]);
  const [chatgptItems, setChatgptItems] = useState([]);
  const [anthropicItems, setAnthropicItems] = useState([]);
  const [lamaItems, setLamaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Step 1: Get the logged-in user
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error getting user:", error);
        setLoading(false);
        return;
      }
      if (data?.user) {
        setUser(data.user);
        fetchRecommendations(data.user.id);
      } else {
        console.log("No user logged in");
        setLoading(false);
      }
    };

    getUser();
  }, []);

  // Step 2: Fetch all recommendation columns
  const fetchRecommendations = async (userId) => {
    const { data, error } = await supabase
      .from("questionnaire_responses")
      .select(
        "mutual_recommendation, Chatgpt_recommendation, anthropic_recommendation, lama_recommendation"
      )
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching recommendations:", error);
      setLoading(false);
      return;
    }

    const parseJSON = (value) => {
      if (!value) return [];
      try {
        return typeof value === "string" ? JSON.parse(value) : value;
      } catch (err) {
        console.error("Error parsing JSON:", err, value);
        return [];
      }
    };

    setMutualItems(parseJSON(data.mutual_recommendation));
    setChatgptItems(parseJSON(data.Chatgpt_recommendation));
    setAnthropicItems(parseJSON(data.anthropic_recommendation));
    setLamaItems(parseJSON(data.lama_recommendation));

    setLoading(false);
  };

  if (loading) return <p className="loading">Loading recommendations...</p>;
  if (!user) return <p>Please log in to view your recommendations.</p>;

  // Step 3: Reusable card rendering function
  const renderCards = (title, items) => (
    <div className="recommendation-section">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p>No recommendations found for this section.</p>
      ) : (
        <div className="card-container">
          {items.map((item, idx) => (
            <article className="card" key={item.id || idx}>
              <div className="card-head">
                <img
                  className="avatar"
                  src={
                    item.photo && item.photo !== "not found"
                      ? item.photo
                      : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
                  }
                  alt={item.name || "Researcher"}
                />
                <div className="card-info">
                  <h3>{item.name}</h3>
                  <div className="field">{item.field}</div>
                </div>
              </div>

              <p className="summary">{item.summary}</p>

              {item.why && item.why.length > 0 && (
                <div className="why-attend">
                  <h4>Why to meet?</h4>
                  <ul>
                    {item.why.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="card-footer">
                <span>
                  Email:{" "}
                  {item.Email ? (
                    <a
                      href={`mailto:${item.Email}`}
                      style={{
                        fontWeight: "bold",
                        textDecoration: "none",
                        color: "#e2e8f0",
                      }}
                    >
                      {item.Email}
                    </a>
                  ) : (
                    <strong>Email not available</strong>
                  )}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );

  // Step 4: Render all four sections
  return (
    <div className="researcher-page">
      {renderCards("Mutual Recommendations", mutualItems)}
      {renderCards("ChatGPT Recommendations", chatgptItems)}
      {renderCards("Anthropic Recommendations", anthropicItems)}
      {renderCards("Llama Recommendations", lamaItems)}
    </div>
  );
}
