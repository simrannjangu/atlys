// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// function SignIn() {
//   const navigate = useNavigate();

//   const [isRegister, setIsRegister] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: ""
//   });

//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   function handleChange(e) {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value
//     });

//     setError("");
//     setMessage("");
//   }

//   function handleSubmit(e) {
//     e.preventDefault();

//     setError("");
//     setMessage("");

//     const users = JSON.parse(
//       localStorage.getItem("visagoUsers") || "[]"
//     );

//     // REGISTER
//     if (isRegister) {
//       if (!form.name || !form.email || !form.phone || !form.password) {
//         setError("Please fill in all fields.");
//         return;
//       }

//       const existingUser = users.find(
//         (user) => user.email.toLowerCase() === form.email.toLowerCase()
//       );

//       if (existingUser) {
//         setError("An account with this email already exists.");
//         return;
//       }

//       const newUser = {
//         id: Date.now(),
//         name: form.name,
//         email: form.email,
//         phone: form.phone,
//         password: form.password
//       };

//       users.push(newUser);

//       localStorage.setItem(
//         "visagoUsers",
//         JSON.stringify(users)
//       );

//       localStorage.setItem(
//         "visagoCurrentUser",
//         JSON.stringify(newUser)
//       );

//       setMessage("Account created successfully!");

//       setTimeout(() => {
//         navigate("/");
//       }, 800);

//       return;
//     }

//     // LOGIN
//     if (!form.email || !form.password) {
//       setError("Please enter your email and password.");
//       return;
//     }

//     const user = users.find(
//       (user) =>
//         user.email.toLowerCase() === form.email.toLowerCase() &&
//         user.password === form.password
//     );

//     if (!user) {
//       setError("Invalid email or password.");
//       return;
//     }

//     localStorage.setItem(
//       "visagoCurrentUser",
//       JSON.stringify(user)
//     );

//     setMessage(`Welcome back, ${user.name}!`);

//     setTimeout(() => {
//       navigate("/");
//     }, 800);
//   }

//   return (
//     <div className="auth-page">

//       <div className="auth-card">

//         <Link to="/" className="auth-logo">
//           Visa<span>Go</span>
//         </Link>

//         <div className="auth-heading">
//           <p className="auth-eyebrow">
//             {isRegister ? "CREATE ACCOUNT" : "WELCOME BACK"}
//           </p>

//           <h1>
//             {isRegister
//               ? "Create your account."
//               : "Sign in to VisaGo."}
//           </h1>

//           <p>
//             {isRegister
//               ? "Create an account to manage your visa journey."
//               : "Continue your visa journey with VisaGo."}
//           </p>
//         </div>

//         <form onSubmit={handleSubmit}>

//           {isRegister && (
//             <>
//               <div className="auth-field">
//                 <label>Full name</label>

//                 <input
//                   type="text"
//                   name="name"
//                   placeholder="Enter your name"
//                   value={form.name}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div className="auth-field">
//                 <label>Phone number</label>

//                 <input
//                   type="tel"
//                   name="phone"
//                   placeholder="Enter your phone number"
//                   value={form.phone}
//                   onChange={handleChange}
//                 />
//               </div>
//             </>
//           )}

//           <div className="auth-field">
//             <label>Email</label>

//             <input
//               type="email"
//               name="email"
//               placeholder="you@example.com"
//               value={form.email}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="auth-field">
//             <label>Password</label>

//             <input
//               type="password"
//               name="password"
//               placeholder="Enter your password"
//               value={form.password}
//               onChange={handleChange}
//             />
//           </div>

//           {error && (
//             <div className="auth-error">
//               {error}
//             </div>
//           )}

//           {message && (
//             <div className="auth-success">
//               {message}
//             </div>
//           )}

//           <button
//             type="submit"
//             className="auth-submit"
//           >
//             {isRegister ? "Create account" : "Sign in"}
//           </button>

//         </form>

//         <div className="auth-switch">

//           <span>
//             {isRegister
//               ? "Already have an account?"
//               : "Don't have an account?"}
//           </span>

//           <button
//             type="button"
//             onClick={() => {
//               setIsRegister(!isRegister);
//               setError("");
//               setMessage("");
//               setForm({
//                 name: "",
//                 email: "",
//                 phone: "",
//                 password: ""
//               });
//             }}
//           >
//             {isRegister ? "Sign in" : "Create account"}
//           </button>

//         </div>

//         <p className="auth-home">
//           <Link to="/">← Back to VisaGo</Link>
//         </p>

//       </div>

//     </div>
//   );
// }

// export default SignIn;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignIn() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

    setError("");
    setMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      // =========================
      // REGISTER
      // =========================
      if (isRegister) {
        if (
          !form.name ||
          !form.email ||
          !form.phone ||
          !form.password
        ) {
          setError("Please fill in all fields.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "https://atlys-backend-cr9i.onrender.com/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              phone: form.phone,
              password: form.password
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Registration failed."
          );
        }

        setMessage(
          data.message || "Account created successfully!"
        );

        setForm({
          name: "",
          email: "",
          phone: "",
          password: ""
        });

        setTimeout(() => {
          setIsRegister(false);
          setMessage("");
        }, 1200);

        return;
      }

      // =========================
      // LOGIN
      // =========================
      if (!form.email || !form.password) {
        setError("Please enter your email and password.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "https://atlys-backend-cr9i.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password."
        );
      }

      // Save whatever user/token your backend returns
      if (data.token) {
        localStorage.setItem("visagoToken", data.token);
      }

      if (data.user) {
        localStorage.setItem(
          "visagoCurrentUser",
          JSON.stringify(data.user)
        );
      }

      setMessage(
        data.message || "Login successful!"
      );

      setTimeout(() => {
        navigate("/");
      }, 800);

    } catch (err) {
      console.error("Authentication error:", err);

      setError(
        err.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsRegister(!isRegister);

    setError("");
    setMessage("");

    setForm({
      name: "",
      email: "",
      phone: "",
      password: ""
    });
  }

  return (
    <div className="auth-page">

      <div className="auth-card">

        <Link to="/" className="auth-logo">
          Visa<span>Go</span>
        </Link>

        <div className="auth-heading">

          <p className="auth-eyebrow">
            {isRegister
              ? "CREATE ACCOUNT"
              : "WELCOME BACK"}
          </p>

          <h1>
            {isRegister
              ? "Create your account."
              : "Sign in to VisaGo."}
          </h1>

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

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-success">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create account"
                : "Sign in"}
          </button>

        </form>

        <div className="auth-switch">

          <span>
            {isRegister
              ? "Already have an account?"
              : "Don't have an account?"}
          </span>

          <button
            type="button"
            onClick={switchMode}
          >
            {isRegister
              ? "Sign in"
              : "Create account"}
          </button>

        </div>

        <p className="auth-home">
          <Link to="/">
            ← Back to VisaGo
          </Link>
        </p>

      </div>

    </div>
  );
}

export default SignIn;