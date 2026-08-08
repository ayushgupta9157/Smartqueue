import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Login.css";
import socket from "./socket";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();

    if (!email || !password) {
      toast.warning("Please enter email and password");
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(
        "https://smartqueue-backend-vjuh.onrender.com/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      if (response.ok) {

        toast.success("Login Successful");

        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "role",
          data.user.role
        );

        localStorage.setItem(
          "userId",
          data.user._id
        );

        socket.emit(
          "joinRoom",
          data.user._id
        );

        console.log(
          "Saved Role:",
          localStorage.getItem("role")
        );

        if (data.user.role === "admin") {

          navigate("/admin-dashboard");

        } else if (data.user.role === "doctor") {

          navigate("/doctor-dashboard");

        } else {

          navigate("/dashboard");

        }

      } else {

        toast.error(
          data.message ||
          data.error ||
          "Login failed"
        );

      }

    } catch (error) {

      console.log(error);

      toast.error("Unable to connect to server");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="login-page">

      <div className="login-left">

        <div className="brand-section">

          <div className="brand-icon">
            🏥
          </div>

          <h1>
            Smart Queue
          </h1>

          <p>
            Smart Hospital Appointment &
            Queue Management System
          </p>

        </div>

      </div>

      <div className="login-right">

        <div className="login-card">

          <div className="login-header">

            <h2>
              Welcome Back
            </h2>

            <p>
              Login to continue to Smart Queue
            </p>

          </div>

          <form onSubmit={handleLogin}>

            <div className="input-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>

            <div className="input-group">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >

              {loading
                ? "Logging in..."
                : "Login"
              }

            </button>

          </form>

          <div className="login-footer">

            <span>
              Secure Hospital Management
            </span>

            <span>
              🔒 Protected Login
            </span>

          </div>

          <p style={{ marginTop: "20px", textAlign: "center" }}>
            New patient?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              style={{
                border: "none",
                background: "none",
                color: "#2563eb",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Create Account
            </button>
          </p>

        </div>

      </div>

    </div>

  );

}

export default Login;