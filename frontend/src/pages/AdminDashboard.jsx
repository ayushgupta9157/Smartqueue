import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";
import { toast } from "react-toastify";

function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [addingDoctor, setAddingDoctor] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, []);

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/appointment/admin/all",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStats = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/appointment/admin/status/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            status
          })
        }
      );

      const data = await response.json();

      alert(data.message || data.error);

      if (response.ok) {
        fetchAppointments();
        fetchStats();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addDoctor = async () => {
    if (!name || !email || !password) {
      alert("Please fill all doctor details");
      return;
    }

    const token = localStorage.getItem("token");

    setAddingDoctor(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/add-doctor",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            name,
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Doctor Added Successfully");

        setName("");
        setEmail("");
        setPassword("");

        fetchStats();
        fetchAppointments();
      } else {
        toast.error(data.message || data.error);
      }
    } catch (error) {
      console.log(error);
      alert("Unable to add doctor");
    } finally {
      setAddingDoctor(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "admin-status confirmed";

      case "completed":
        return "admin-status completed";

      case "cancelled":
        return "admin-status cancelled";

      default:
        return "admin-status pending";
    }
  };

  // Sirf selected date ki appointments
  const filteredAppointments = selectedDate
  ? appointments.filter((appointment) => {

      const search = searchText.toLowerCase();

      const patientName =
        appointment.userId?.name?.toLowerCase() || "";

      const patientEmail =
        appointment.userId?.email?.toLowerCase() || "";

      const doctorName =
        appointment.doctorId?.name?.toLowerCase() || "";

      const token =
        String(appointment.tokenNumber);

      return (
        appointment.date === selectedDate &&
        (
          patientName.includes(search) ||
          patientEmail.includes(search) ||
          doctorName.includes(search) ||
          token.includes(search)
        )
      );

    })
  : [];

  return (
    <div className="admin-page">

      <Navbar />

      <main className="admin-container">

        {/* Header */}

        <section className="admin-header">

          <div>
            <p className="admin-label">
              ADMIN PORTAL
            </p>

            <h1>
              Admin Dashboard 👨‍💼
            </h1>

            <p>
              Manage doctors, appointments and hospital queue.
            </p>
          </div>

          <div className="admin-icon">
            🏥
          </div>

        </section>


        {/* Analytics */}

        <section className="admin-stats">

          <div className="admin-stat-card">

            <div className="admin-stat-icon patients">
              👥
            </div>

            <div>
              <span>Total Patients</span>

              <strong>
                {stats.totalPatients || 0}
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon doctors">
              👨‍⚕️
            </div>

            <div>
              <span>Total Doctors</span>

              <strong>
                {stats.totalDoctors || 0}
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon appointments">
              📋
            </div>

            <div>
              <span>Total Appointments</span>

              <strong>
                {stats.totalAppointments || 0}
              </strong>
            </div>

          </div>


          <div className="admin-stat-card">

            <div className="admin-stat-icon queue">
              ⏱️
            </div>

            <div>
              <span>Today's Queue</span>

              <strong>
                {stats.todayQueue || 0}
              </strong>
            </div>

          </div>

        </section>


        {/* Add Doctor */}

        <section className="add-doctor-card">

          <div className="section-heading">

            <div>

              <p className="small-label">
                DOCTOR MANAGEMENT
              </p>

              <h2>
                Add New Doctor
              </h2>

              <p>
                Create a doctor account for the hospital.
              </p>

            </div>

            <div className="section-icon">
              ➕
            </div>

          </div>


          <div className="doctor-form">

            <div className="admin-input-group">

              <label>
                Doctor Name
              </label>

              <input
                type="text"
                placeholder="Enter doctor name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

            </div>


            <div className="admin-input-group">

              <label>
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter doctor email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>


            <div className="admin-input-group">

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

            </div>

          </div>


          <button
            className="add-doctor-btn"
            onClick={addDoctor}
            disabled={addingDoctor}
          >
            {addingDoctor
              ? "Adding Doctor..."
              : "+ Add Doctor"}
          </button>

        </section>


        {/* Date Filter */}

        <section className="date-filter-card">

          <div>
            <p className="small-label">
              APPOINTMENT FILTER
            </p>

            <h2>
              Select Date
            </h2>

            <p>
              Select a date to view only appointments
              for that date.
            </p>
          </div>
          <div className="search-input-wrapper">

  <label>
    Search Appointment
  </label>

  <input
    type="text"
    placeholder="Patient, email, doctor or token"
    value={searchText}
    onChange={(e) =>
      setSearchText(e.target.value)
    }
  />

</div>

          <div className="date-input-wrapper">

            <label>
              Appointment Date
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(e.target.value)
              }
            />

          </div>

        </section>


        {/* Appointments */}

        <section className="admin-appointments">

          <div className="section-heading appointment-heading">

            <div>

              <p className="small-label">
                APPOINTMENTS
              </p>

              <h2>
                {selectedDate
                  ? `Appointments for ${selectedDate}`
                  : "Appointments"}
              </h2>

            </div>

            <span className="appointment-count">
              {filteredAppointments.length} Records
            </span>

          </div>


          {!selectedDate ? (

            <div className="no-admin-appointments">

              <div>
                📅
              </div>

              <h3>
                Select a Date
              </h3>

              <p>
                Please select a date above to view
                appointments for that day.
              </p>

            </div>

          ) : filteredAppointments.length === 0 ? (

            <div className="no-admin-appointments">

              <div>
                📋
              </div>

              <h3>
                No Appointments Found
              </h3>

              <p>
                No appointments are available for{" "}
                {selectedDate}.
              </p>

            </div>

          ) : (

            <div className="admin-appointments-list">

              {filteredAppointments.map(
                (appointment) => (

                  <div
                    className="admin-appointment-card"
                    key={appointment._id}
                  >

                    <div className="admin-card-top">

                      <div className="patient-heading">

                        <div className="patient-admin-avatar">

                          {appointment.userId?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "P"}

                        </div>

                        <div>

                          <h3>
                            {appointment.userId?.name ||
                              "Patient"}
                          </h3>

                          <p>
                            {appointment.userId?.email ||
                              "No email"}
                          </p>

                        </div>

                      </div>


                      <span
                        className={getStatusClass(
                          appointment.status
                        )}
                      >
                        {appointment.status}
                      </span>

                    </div>


                    <div className="admin-appointment-details">

                      <div className="admin-detail-box">

                        <span>
                          Doctor
                        </span>

                        <strong>
                          {appointment.doctorId?.name ||
                            "Not Assigned"}
                        </strong>

                      </div>


                      <div className="admin-detail-box">

                        <span>
                          Date
                        </span>

                        <strong>
                          {appointment.date}
                        </strong>

                      </div>


                      <div className="admin-detail-box token-box">

                        <span>
                          Token
                        </span>

                        <strong>
                          #{appointment.tokenNumber}
                        </strong>

                      </div>


                      <div className="admin-detail-box">

                        <span>
                          Patient Type
                        </span>

                        <strong className="capitalize">
                          {appointment.patientType ||
                            "normal"}
                        </strong>

                      </div>

                    </div>


                    {appointment.patientType ===
                      "emergency" && (

                      <div className="admin-emergency">

                        🚨 Emergency Appointment

                        {appointment.emergencyVerified && (
                          <span>
                            {" "}
                            • Level{" "}
                            {appointment.emergencyLevel}
                          </span>
                        )}

                      </div>

                    )}


                    <div className="admin-actions">

                      <button
                        className="confirm-btn"
                        onClick={() =>
                          updateStatus(
                            appointment._id,
                            "confirmed"
                          )
                        }
                      >
                        ✓ Confirm
                      </button>


                      


                      <button
                        className="cancel-btn"
                        onClick={() =>
                          updateStatus(
                            appointment._id,
                            "cancelled"
                          )
                        }
                      >
                        ✕ Cancel
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;