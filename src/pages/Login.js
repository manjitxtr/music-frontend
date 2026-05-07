import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


  const handleLogin = async () => {

    setMessage("");

    // ✅ Validation
    if (!email || !password) {
      setIsError(true);
      setMessage("All fields are required");
      return;
    }

    try {

      setLoading(true);

      const res = await fetch(
        "http://localhost:3000/auth/login", // ✅ FIXED URL
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await res.json();

      // ✅ FIXED: check backend response properly
      if (!data.success) {
        setIsError(true);
        setMessage("Email or password is invalid");
        return;
      }

      // ✅ Store correct values
      localStorage.setItem(
        "user_name",
        data.username || "Guest"
      );

      localStorage.setItem(
        "user_email",
        email
      );

      localStorage.setItem(
        "subscription",
        "free"
      );

      // ✅ Success message
      setIsError(false);
      setMessage("Login successful! Redirecting...");

      // ✅ Redirect
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1200);

    } catch (error) {

      console.error(error);

      setIsError(true);
      setMessage("Server error. Please try again.");

    } finally {
      setLoading(false);
    }
  };


  return (

    <div className="login-page">

      <div className="split-form">

        {/* LEFT SIDE */}
        <div className="image-side">
          <h2>Welcome Back!</h2>
          <p>
            Login to continue your music journey
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="form-side">

          <h2>Login</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            onClick={handleLogin}
            disabled={loading}
          >
            {
              loading
                ? "Logging in..."
                : "Login"
            }
          </button>

          {/* MESSAGE */}
          {
            message && (
              <p
                style={{
                  color: isError ? "red" : "#22c55e",
                  marginTop: "12px",
                  textAlign: "center",
                  fontWeight: "500"
                }}
              >
                {message}
              </p>
            )
          }

          {/* LINKS */}
          <p
            className="register-link"
            onClick={() =>
              navigate("/register")
            }
          >
            Don't have an account? Register
          </p>

          <p
            className="register-link"
            onClick={() =>
              navigate("/")
            }
          >
            Back to Home
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;