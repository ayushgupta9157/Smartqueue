import { useNavigate, NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("appointmentId");

    navigate("/");
  };

  const getRoleName = () => {
    if (role === "patient") return "Patient";
    if (role === "doctor") return "Doctor";
    if (role === "admin") return "Admin";
    return "";
  };

  return (
  <nav className="navbar">

    {/* Logo */}
    <div
      className="navbar-logo"
      onClick={() => {
        if (role === "patient") {
          navigate("/dashboard");
        } else if (role === "doctor") {
          navigate("/doctor-dashboard");
        } else if (role === "admin") {
          navigate("/admin-dashboard");
        }
      }}
    >
        <span className="logo-icon">🏥</span>
        <span className="logo-text">Smart Queue</span>
      </div>

      {/* Navigation */}
      <div className="navbar-links">

        {role === "patient" && (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/book-appointment"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Book Appointment
            </NavLink>

            <NavLink
              to="/my-appointments"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              My Appointments
            </NavLink>

            <NavLink
              to="/queue-status"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Queue Status
            </NavLink>
          </>
        )}

        {role === "doctor" && (
          <>
            <NavLink
              to="/doctor-dashboard"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/doctor-history"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              History
            </NavLink>
          </>
        )}

        {role === "admin" && (
          <>
            <NavLink
              to="/admin-dashboard"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/admin-stats"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Analytics
            </NavLink>
          </>
        )}

      </div>

      {/* Right Side */}
      <div className="navbar-right">

        {role && (
          <span className="role-badge">
            {getRoleName()}
          </span>
        )}

        <button
          className="logout-btn"
          onClick={logout}
        >
          Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;