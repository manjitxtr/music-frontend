import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {

  const [email, setEmail] = useState("");

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [isError, setIsError] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();




  // ================= REGISTER =================

  const handleRegister = async () => {

    setMessage("");



    // ================= VALIDATION =================

    if (!email || !username || !password) {

      setIsError(true);

      setMessage(
        "All fields are required"
      );

      return;
    }



    const emailRegex =
      /\S+@\S+\.\S+/;

    if (!emailRegex.test(email)) {

      setIsError(true);

      setMessage(
        "Please enter a valid email"
      );

      return;
    }



    if (password.length < 4) {

      setIsError(true);

      setMessage(
        "Password must be at least 4 characters"
      );

      return;
    }




    try {

      setLoading(true);



      // ================= API CALL =================

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            user_name: username,

            email,

            password
          })
        }
      );



      const data = await res.json();




      // ================= BACKEND ERROR =================

      if (!res.ok) {

        setIsError(true);

        setMessage(
          data.message ||
          "Registration failed"
        );

        return;
      }




      // ================= SUCCESS =================

      setIsError(false);

      setMessage(
        "Registered successfully! Redirecting to login..."
      );




      // ================= REDIRECT TO LOGIN =================

      setTimeout(() => {

        navigate("/login");

      }, 1200);

    } catch (error) {

      console.error(error);

      setIsError(true);

      setMessage(
        "Server error. Please try again."
      );

    } finally {

      setLoading(false);
    }
  };




  return (

    <div className="login-page">

      <div className="split-form">




        {/* ================= LEFT SIDE ================= */}

        <div className="image-side">

          <h2>
            Join Us!
          </h2>

          <p>
            Create your account to get started
          </p>

        </div>




        {/* ================= RIGHT SIDE ================= */}

        <div className="form-side">

          <h2>
            Register
          </h2>




          {/* ================= EMAIL ================= */}

          <input
            type="email"

            placeholder="Email"

            value={email}

            onChange={(e) =>
              setEmail(e.target.value)
            }
          />




          {/* ================= USERNAME ================= */}

          <input
            type="text"

            placeholder="Username"

            value={username}

            onChange={(e) =>
              setUsername(e.target.value)
            }
          />




          {/* ================= PASSWORD ================= */}

          <input
            type="password"

            placeholder="Password"

            value={password}

            onChange={(e) =>
              setPassword(e.target.value)
            }
          />




          {/* ================= BUTTON ================= */}

          <button
            onClick={handleRegister}

            disabled={loading}
          >

            {
              loading
                ? "Registering..."
                : "Register"
            }

          </button>




          {/* ================= MESSAGE ================= */}

          {
            message && (

              <p
                style={{

                  color:
                    isError
                      ? "red"
                      : "#22c55e",

                  marginTop: "10px",

                  textAlign: "center",

                  fontWeight: "500"
                }}
              >
                {message}
              </p>
            )
          }




          {/* ================= LINKS ================= */}

          <p
            className="register-link"

            onClick={() =>
              navigate("/login")
            }
          >
            Already have an account? Login
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

export default Register;