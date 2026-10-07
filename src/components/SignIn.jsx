import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";

const API = "https://atlys-backend-cr9i.onrender.com/api/auth";

function getSavedUser() {
  try {
    const raw = localStorage.getItem("visagoCurrentUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return (
    !!localStorage.getItem("visagoToken") ||
    !!localStorage.getItem("visagoCurrentUser")
  );
}

function SignIn() {
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [currentUser, setCurrentUser] = useState(getSavedUser());

  const [isRegister, setIsRegister] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
    setMessage("");
  }

  function handleLogout() {
    localStorage.removeItem("visagoToken");
    localStorage.removeItem("visagoCurrentUser");

    setCurrentUser(null);
    setLoggedIn(false);
    setIsRegister(false);
    setMessage("");
    setError("");
    setForm({ name: "", email: "", phone: "", password: "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      // REGISTER
      if (isRegister) {
        if (!form.name || !form.email || !form.phone || !form.password) {
          setError("Please fill in all fields.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Registration failed.");
        }

        setMessage(data.message || "Account created successfully!");
        setForm({ name: "", email: "", phone: "", password: "" });

        setTimeout(() => {
          setIsRegister(false);
          setMessage("");
        }, 1200);

        return;
      }

      // LOGIN
      if (!form.email || !form.password) {
        setError("Please enter your email and password.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      if (data.token) {
        localStorage.setItem("visagoToken", data.token);
      }

      // Save the user. If the backend sends none, keep the email at least,
      // so the app can tell that someone is logged in.
      const userToSave = data.user || { email: form.email };
      localStorage.setItem("visagoCurrentUser", JSON.stringify(userToSave));

      setMessage(data.message || "Login successful!");

      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsRegister(!isRegister);
    setError("");
    setMessage("");
    setForm({ name: "", email: "", phone: "", password: "" });
  }

  /* =========================================
     ALREADY SIGNED IN → SHOW LOGOUT
  ========================================= */
  if (loggedIn) {
    const displayName =
      currentUser?.name || currentUser?.fullName || currentUser?.email || "Traveller";

    return (
      <div className="auth-page">
        <div className="auth-card">
          <div style={{ marginBottom: 32 }}><Logo size="md" /></div>

          <div className="auth-heading">
            <p className="auth-eyebrow">SIGNED IN</p>
            <h1>You’re signed in.</h1>
            <p>Welcome back, {displayName}.</p>
          </div>

          <div className="auth-user">
            <div className="auth-user-avatar">
              {String(displayName).charAt(0).toUpperCase()}
            </div>

            <div className="auth-user-info">
              <strong>{displayName}</strong>
              {currentUser?.email && <span>{currentUser.email}</span>}
              {currentUser?.phone && <span>{currentUser.phone}</span>}
            </div>
          </div>

          <button
            type="button"
            className="auth-submit"
            onClick={() => navigate("/")}
          >
            Continue to VisaGo
          </button>

          <button
            type="button"
            className="auth-logout"
            onClick={handleLogout}
          >
            Log out
          </button>

          <p className="auth-home">
            <Link to="/">← Back to VisaGo</Link>
          </p>
        </div>
      </div>
    );
  }

  /* =========================================
     SIGN IN / REGISTER FORM
  ========================================= */
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ marginBottom: 32 }}><Logo size="md" /></div>

        <div className="auth-heading">
          <p className="auth-eyebrow">
            {isRegister ? "CREATE ACCOUNT" : "WELCOME BACK"}
          </p>

          <h1>{isRegister ? "Create your account." : "Sign in to VisaGo."}</h1>

          <p>
            {isRegister
              ? "Create an account to manage your visa journey."
              : "Continue your visa journey with VisaGo."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="auth-field">
                <label>Full name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="auth-field">
                <label>Phone number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegister
              ? "Create account"
              : "Sign in"}
          </button>
        </form>

        <div className="auth-switch">
          <span>
            {isRegister ? "Already have an account?" : "Don't have an account?"}
          </span>

          <button type="button" onClick={switchMode}>
            {isRegister ? "Sign in" : "Create account"}
          </button>
        </div>

        <p className="auth-home">
          <Link to="/">← Back to VisaGo</Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;