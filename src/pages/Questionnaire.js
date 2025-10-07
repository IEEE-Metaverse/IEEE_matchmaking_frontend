// src/pages/Questionnaire.js
import React, { useState, useEffect } from "react";
import questionsData from "../data/questions";
import "../styles/questionnaire.css";
import { supabase } from "../supabaseClient";

export default function Questionnaire() {
  const [sections] = useState(questionsData);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [customOptions, setCustomOptions] = useState({});
  const [showAddInputFor, setShowAddInputFor] = useState(null);
  const [addInputValue, setAddInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  const isShortTextType = (t) =>
    t === "short-text" || t === "short text" || t === "shorttext";

  const mergedOptionsFor = (q) => {
    const predefined = q.options || [];
    const custom = customOptions[q.key] || [];
    const combined = [...predefined];
    for (const c of custom) if (!combined.includes(c)) combined.push(c);
    return combined;
  };

  function LikertInline({ name, value, onChange }) {
    return (
      <div className="likert-inline">
        {[1, 2, 3, 4, 5].map((n) => {
          const isSelected = Number(value) === n;
          return (
            <label key={n} className={`likert-label ${isSelected ? "selected" : ""}`}>
              <input
                type="radio"
                name={name}
                value={n}
                checked={isSelected}
                onChange={() => onChange(n)}
              />
              <span className="likert-value">{n}</span>
            </label>
          );
        })}
      </div>
    );
  }

  const handleChange = (key, value, type) => {
    setFormData((prev) => {
      const next = { ...prev };
      if (type === "multi-select") {
        const current = Array.isArray(next[key]) ? [...next[key]] : [];
        const idx = current.indexOf(value);
        if (idx >= 0) current.splice(idx, 1);
        else current.push(value);
        next[key] = current;
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const addCustomOption = (qKey, value) => {
    if (!value || !value.trim()) return;
    const val = value.trim();
    setCustomOptions((prev) => {
      const next = { ...prev };
      next[qKey] = next[qKey] ? [...next[qKey]] : [];
      if (!next[qKey].includes(val)) next[qKey].push(val);
      return next;
    });

    const q = findQuestionByKey(qKey);
    if (!q) return;

    if (q.type === "multi-select") {
      setFormData((prev) => ({ ...prev, [qKey]: [...(prev[qKey] || []), val] }));
    } else if (q.type === "single-select") {
      setFormData((prev) => ({ ...prev, [qKey]: val }));
    }

    setAddInputValue("");
    setShowAddInputFor(null);
  };

  const findQuestionByKey = (key) => {
    for (const sec of sections) {
      for (const it of sec.items) if (it.key === key) return it;
    }
    return null;
  };

  const validateSection = () => {
    const sec = sections[sectionIndex];
    for (const q of sec.items) {
      if (!q.required) continue;

      if (q.type === "special-research-questions") {
        let anyFilled = false;
        for (let i = 1; i <= 3; i++) {
          const textKey = `${q.key}_q${i}`;
          if (formData[textKey] && formData[textKey].trim()) anyFilled = true;
        }
        if (!anyFilled) {
          alert(`Please fill at least one research question in "${q.question}"`);
          return false;
        }
        continue;
      }

      const val = formData[q.key];
      if (q.type === "multi-select") {
        if (!val || !Array.isArray(val) || val.length === 0) {
          alert(`Please complete: "${q.question}"`);
          return false;
        }
      } else if (q.type === "single-select") {
        if (!val || (val === "Other" && !formData[`${q.key}_other`])) {
          alert(`Please complete: "${q.question}"`);
          return false;
        }
      } else if (isShortTextType(q.type) && (!val || !val.trim())) {
        alert(`Please complete: "${q.question}"`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateSection()) return;
    if (sectionIndex < sections.length - 1) setSectionIndex(sectionIndex + 1);
  };

  const handleBack = () => {
    if (sectionIndex > 0) setSectionIndex(sectionIndex - 1);
  };

  // Load existing user answers and session info
  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("questionnaire_responses")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching questionnaire:", error);
        return;
      }

      if (data) {
        const prefill = { ...data };
        if (data.problems_top_questions) {
          data.problems_top_questions.forEach((q, i) => {
            prefill[`problems_top_questions_q${i + 1}`] = q.question || "";
            prefill[`problems_top_questions_q${i + 1}_readiness`] = q.readiness || null;
            prefill[`problems_top_questions_q${i + 1}_priority`] = q.priority || null;
          });
        }
        if (data.top_3_collab_topics) prefill.top_3_collab_topics = data.top_3_collab_topics;
        prefill.linkedin_url = data.linkedin_url || "";
        setFormData(prefill);
      }
    }
    load();
  }, []);

  const handleSubmit = async () => {
    if (!validateSection()) return;

    try {
      setIsSubmitting(true); // start loading

      // Get current session and user
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) {
        alert("You must be logged in");
        setIsSubmitting(false);
        return;
      }

      const answersPayload = { ...formData };

      // SPECIAL RESEARCH QUESTIONS (problems_top_questions)
      const specialQuestions = [];
      const srq = findQuestionByKey("problems_top_questions");
      if (srq) {
        for (let i = 1; i <= 3; i++) {
          const question = formData[`problems_top_questions_q${i}`];
          if (question && question.trim()) {
            specialQuestions.push({
              question,
              readiness: formData[`problems_top_questions_q${i}_readiness`] || null,
              priority: formData[`problems_top_questions_q${i}_priority`] || null,
            });
          }
        }
      }
      // Directly assign array
      answersPayload.problems_top_questions = specialQuestions;


      // Handle top 3 collaboration topics
      const collabTopics = [];
      const topicsArray = formData.top_3_collab_topics || [];
      for (let i = 0; i < topicsArray.length; i++) {
        const t = topicsArray[i];
        if (t.topic && t.topic.trim()) {
          collabTopics.push({
            topic: t.topic.trim(),
            expertise: t.expertise || null,
            interest: t.interest || null,
            need_have_both: t.need_have_both || null,
          });
        }
      }
      answersPayload.top_3_collab_topics = collabTopics;

      // Send POST request
      const accessToken = sessionData.session?.access_token;
      const res = await fetch("http://localhost:5000/api/questionnaire/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ answers: answersPayload }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("✅ Submitted successfully!");
      } else {
        console.error("Submit failed:", result.error);
        alert("Submit failed: " + result.error);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Submit failed: " + err.message);
    } finally {
      setIsSubmitting(false); // stop loading
    }
  };



  const section = sections[sectionIndex];

  return (
    <div className="questionnaire-container">
      <div className="section-card">
        <h2>{section.section}</h2>
        {section.items.map((q, idx) => {
          const mergedOptions = q.type === "multi-select" || q.type === "single-select" ? mergedOptionsFor(q) : [];
          return (
            <div key={idx} className="question-block">
              <p className="question-text">
                {q.question} {q.required && <span className="required">*</span>}
              </p>

              {/* SHORT TEXT */}
              {isShortTextType(q.type) && (
                <input
                  type="text"
                  className="text-input"
                  placeholder={q.placeholder || ""}
                  value={formData[q.key] || ""}
                  onChange={(e) => handleChange(q.key, e.target.value, q.type)}
                />
              )}

              {/* SINGLE SELECT */}
              {q.type === "single-select" && mergedOptions.length > 0 && (
                <div className="options">
                  {mergedOptions.map((opt, i) => (
                    <label key={i}>
                      <input
                        type="radio"
                        name={q.key}
                        value={opt}
                        checked={formData[q.key] === opt}
                        onChange={(e) => handleChange(q.key, e.target.value, q.type)}
                      />
                      {opt}
                    </label>
                  ))}

                  {/* Other textbox */}
                  {q.allowOther && formData[q.key] === "Other" && (
                    <input
                      type="text"
                      className="text-input"
                      placeholder="Please specify..."
                      value={formData[`${q.key}_other`] || ""}
                      onChange={(e) => handleChange(`${q.key}_other`, e.target.value, "short-text")}
                    />
                  )}

                  {/* Add custom option */}
                  {q.allowCustomOption && (
                    <div className="add-option">
                      {showAddInputFor === q.key ? (
                        <input
                          className="add-option-input"
                          placeholder="Type new option and press Enter..."
                          value={addInputValue}
                          onChange={(e) => setAddInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addCustomOption(q.key, addInputValue);
                            if (e.key === "Escape") {
                              setShowAddInputFor(null);
                              setAddInputValue("");
                            }
                          }}
                        />
                      ) : (
                        <button className="add-option-btn" onClick={() => setShowAddInputFor(q.key)}>
                          + Add option
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* MULTI-SELECT */}
              {q.type === "multi-select" && (
                <>
                  <div className="chip-container">
                    {mergedOptions.map((opt, i) => {
                      const selected = Array.isArray(formData[q.key]) && formData[q.key].includes(opt);
                      return (
                        <div
                          key={i}
                          className={`chip ${selected ? "selected" : ""}`}
                          onClick={() => handleChange(q.key, opt, q.type)}
                        >
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                  {q.allowCustomOption && (
                    <div className="add-option">
                      {showAddInputFor === q.key ? (
                        <input
                          className="add-option-input"
                          placeholder="Type new option and press Enter..."
                          value={addInputValue}
                          onChange={(e) => setAddInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addCustomOption(q.key, addInputValue);
                            if (e.key === "Escape") {
                              setShowAddInputFor(null);
                              setAddInputValue("");
                            }
                          }}
                        />
                      ) : (
                        <button className="add-option-btn" onClick={() => setShowAddInputFor(q.key)}>
                          + Add option
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* TOP 3 COLLABORATION TOPICS */}
              {q.type === "top-3-collab-topics" && (
                <div className="research-questions">
                  {[1, 2, 3].map((n) => {
                    const topicKey = `${q.key}_topic${n}`;
                    const topic = formData[q.key]?.[n - 1] || { topic: "", expertise: 0, interest: 0, need_have_both: "" };

                    return (
                      <div key={n} className="research-question-item">
                        {/* Topic text input */}
                        <input
                          type="text"
                          className="text-input"
                          placeholder={`Topic ${n}`}
                          value={topic.topic}
                          onChange={(e) => {
                            const updated = [...(formData[q.key] || [])];
                            updated[n - 1] = { ...topic, topic: e.target.value };
                            handleChange(q.key, updated, "json");
                          }}
                        />

                        {topic.topic.trim() && (
                          <>
                            {/* Expertise Likert */}
                            <div className="matrix-row small">
                              <div className="matrix-row-label">Expertise (1–5)</div>
                              <LikertInline
                                name={`${topicKey}_expertise`}
                                value={topic.expertise}
                                onChange={(val) => {
                                  const updated = [...(formData[q.key] || [])];
                                  updated[n - 1] = { ...topic, expertise: val };
                                  handleChange(q.key, updated, "json");
                                }}
                              />
                            </div>

                            {/* Interest Likert */}
                            <div className="matrix-row small">
                              <div className="matrix-row-label">Interest to collaborate (1–5)</div>
                              <LikertInline
                                name={`${topicKey}_interest`}
                                value={topic.interest}
                                onChange={(val) => {
                                  const updated = [...(formData[q.key] || [])];
                                  updated[n - 1] = { ...topic, interest: val };
                                  handleChange(q.key, updated, "json");
                                }}
                              />
                            </div>

                            {/* Need / Have / Both */}
                            <div className="matrix-row small">
                              <div className="matrix-row-label">Datasets/Instruments/Materials</div>
                              <div className="radio-group">
                                {["Need", "Have", "Both"].map((option) => (
                                  <label key={option}>
                                    <input
                                      type="radio"
                                      name={`${topicKey}_need_have_both`}
                                      value={option}
                                      checked={topic.need_have_both === option}
                                      onChange={(e) => {
                                        const updated = [...(formData[q.key] || [])];
                                        updated[n - 1] = { ...topic, need_have_both: e.target.value };
                                        handleChange(q.key, updated, "json");
                                      }}
                                    />
                                    {option}
                                  </label>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SPECIAL RESEARCH QUESTIONS */}
              {q.type === "special-research-questions" && (
                <div className="research-questions">
                  {[1, 2, 3].map((n) => {
                    const textKey = `${q.key}_q${n}`;
                    const readinessKey = `${q.key}_q${n}_readiness`;
                    const priorityKey = `${q.key}_q${n}_priority`;

                    return (
                      <div key={n} className="research-question-item">
                        <input
                          type="text"
                          className="text-input"
                          placeholder={`Research question ${n} (one sentence)`}
                          value={formData[textKey] || ""}
                          onChange={(e) => handleChange(textKey, e.target.value, "short-text")}
                        />
                        {formData[textKey] && formData[textKey].trim() && (
                          <>
                            <div className="matrix-row small">
                              <div className="matrix-row-label">Readiness (1-5)</div>
                              <LikertInline
                                name={readinessKey}
                                value={formData[readinessKey] || 0}
                                onChange={(val) => handleChange(readinessKey, val, "Likert")}
                              />
                            </div>
                            <div className="matrix-row small">
                              <div className="matrix-row-label">Priority this year (1-5)</div>
                              <LikertInline
                                name={priorityKey}
                                value={formData[priorityKey] || 0}
                                onChange={(val) => handleChange(priorityKey, val, "Likert")}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="nav-buttons">
          {sectionIndex > 0 && <button className="back-btn" onClick={handleBack}>Back</button>}
          {sectionIndex < sections.length - 1 && <button className="next-btn" onClick={handleNext}>Next</button>}
          {sectionIndex === sections.length - 1 && (
            <button className="submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
