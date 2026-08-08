import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Register.css";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {

    e.preventDefault();

    if (!name || !email || !password) {

      toast.warning("Please fill all fields");
      return;

    }

    setLoading(true);

    try {

      const response = await fetch(
        "https://smartqueue-backend-vjuh.onrender.com/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {

        toast.success("Registration Successful");

        setName("");
        setEmail("");
        setPassword("");

        setTimeout(() => {
          navigate("/");
        }, 1200);

      } else {

        toast.error(
          data.message ||
          data.error ||
          "Registration failed"
        );

      }

    } catch (error) {

      console.log(error);

      toast.error("Server Error");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="register-page">

      <div className="register-card">

        <div className="register-icon">
          🏥
        </div>

        <h1>
          Create Patient Account
        </h1>

        <p>
          Register to book appointments and
          track your hospital queue.
        </p>

        <form onSubmit={handleRegister}>

          <label>
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

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

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Create password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Register"}
          </button>

        </form>

        <div className="register-login">

          Already have an account?

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            Login
          </button>

        </div>

      </div>

    </div>

  );

}

export default Register;