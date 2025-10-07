// src/pages/LoginSignup.js
import React, { useState } from "react";
import "../styles/auth.css";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const LoginSignup = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state
  const navigate = useNavigate();

  const toggleForm = () => setIsLogin(!isLogin);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (onSuccess) onSuccess();
        navigate("/questionnaire", { replace: true });
      } else {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
        if (signUpError) throw signUpError;

        alert("Signup successful! Please check your email to confirm your account.");

        setIsLogin(true);
        setFullName("");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  const goToForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">{isLogin ? "Login" : "Signup"}</h2>

        <div className="tab-toggle">
          <button onClick={() => setIsLogin(true)} className={isLogin ? "active" : ""}>
            Login
          </button>
          <button onClick={() => setIsLogin(false)} className={!isLogin ? "active" : ""}>
            Signup
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="full-name-input"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="show-password-wrapper">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPassword">Show Password</label>
          </div>


          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Login" : "Signup"}
          </button>
        </form>

        {isLogin && (
          <p className="forgot-password">
            <span onClick={goToForgotPassword} className="toggle-link">Forgot password?</span>
          </p>
        )}

        <p className="toggle-text">
          {isLogin ? (
            <>Don't have an account? <span onClick={toggleForm} className="toggle-link">Signup</span></>
          ) : (
            <>Already have an account? <span onClick={toggleForm} className="toggle-link">Login</span></>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginSignup;
