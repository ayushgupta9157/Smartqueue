import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Navbar from "../components/Navbar";
import socket from "./socket";
import "./Dashboard.css";

function Dashboard() {

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {

    fetchAppointment();

    const token = localStorage.getItem("token");

    if (token) {

      try {

        const payload = JSON.parse(
          atob(token.split(".")[1])
        );

        socket.emit("joinRoom", payload.id);

        socket.on(
          "appointmentUpdated",
          (data) => {

            toast.info(
              data.message ||
              `Appointment status changed to ${data.status}`
            );

            fetchAppointment();

          }
        );

      } catch (error) {

        console.log(error);

      }

    }

    return () => {

      socket.off("appointmentUpdated");

    };

  }, []);

  const fetchAppointment = async () => {

    const token = localStorage.getItem("token");

    try {

      const response = await fetch(
        "https://smartqueue-backend-vjuh.onrender.com/api/appointment/my-appointments",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      console.log("Patient Appointments:", data);

      if (response.ok) {

        const appointments =
          data.appointments || [];

        if (appointments.length > 0) {

          const latestAppointment =
            appointments[appointments.length - 1];

          setAppointment(latestAppointment);

          localStorage.setItem(
            "appointmentId",
            latestAppointment._id
          );

        }

      } else {

        toast.error(
          data.message || "Unable to load appointment"
        );

      }

    } catch (error) {

      console.log(error);

      toast.error(
        "Unable to connect to server"
      );

    } finally {

      setLoading(false);

    }

  };

  const getStatusClass = (status) => {

    switch (status) {

      case "confirmed":
        return "status confirmed";

      case "completed":
        return "status completed";

      case "cancelled":
        return "status cancelled";

      default:
        return "status pending";

    }

  };
  return (

  <div className="dashboard-page">

    <Navbar />

    <main className="dashboard-container">

      {/* Welcome Section */}

      <section className="welcome-section">

        <div>

          <p className="welcome-label">
            PATIENT PORTAL
          </p>

          <h1>
            Welcome to Smart Queue 👋
          </h1>

          <p className="welcome-text">
            Manage your appointment and track your
            queue in real time.
          </p>

        </div>

        <div className="hospital-icon">
          🏥
        </div>

      </section>

      {/* Loading */}

      {loading ? (

        <div className="loading-card">

          <div className="loader"></div>

          <p>
            Loading your appointment...
          </p>

        </div>

      ) : appointment ? (

        <>

          {/* Appointment Card */}

          <section className="appointment-card">

            <div className="card-header">

              <div>

                <p className="section-label">
                  CURRENT APPOINTMENT
                </p>

                <h2>
                  Your Appointment
                </h2>

              </div>

              <span className={getStatusClass(appointment.status)}>
                {appointment.status}
              </span>

            </div>

            <div className="appointment-grid">

              <div className="info-box">

                <span className="info-label">
                  Doctor
                </span>

                <span className="info-value">
                  {appointment.doctorId?.name || "Not Assigned"}
                </span>

              </div>

              <div className="info-box">

                <span className="info-label">
                  Appointment Date
                </span>

                <span className="info-value">
                  {appointment.date}
                </span>

              </div>

              <div className="info-box token-box">

                <span className="info-label">
                  Token Number
                </span>

                <span className="token-number">
                  #{appointment.tokenNumber}
                </span>

              </div>

              <div className="info-box">

                <span className="info-label">
                  Patient Type
                </span>

                <span className="info-value">
                  {appointment.patientType || "normal"}
                </span>

              </div>

            </div>

            <div className="appointment-action">

              <button
                className="primary-btn"
                onClick={() => navigate("/queue-status")}
              >

                View Live Queue
                <span>→</span>

              </button>

            </div>

          </section>
                  {/* Quick Actions */}

        <section className="quick-section">

          <h2>
            Quick Actions
          </h2>

          <div className="quick-grid">

            <button
              className="quick-card"
              onClick={() =>
                navigate("/book-appointment")
              }
            >

              <span className="quick-icon">
                📅
              </span>

              <span>
                Book New Appointment
              </span>

            </button>

            <button
              className="quick-card"
              onClick={() =>
                navigate("/my-appointments")
              }
            >

              <span className="quick-icon">
                📋
              </span>

              <span>
                My Appointments
              </span>

            </button>

            <button
              className="quick-card"
              onClick={() =>
                navigate("/queue-status")
              }
            >

              <span className="quick-icon">
                🤖
              </span>

              <span>
                AI Queue Prediction
              </span>

            </button>

          </div>

        </section>

        </>

      ) : (

        <section className="no-appointment-card">

          <div className="empty-icon">
            📅
          </div>

          <h2>
            No Appointment Booked
          </h2>

          <p>
            You currently don't have an active appointment.
          </p>

          <button
            className="primary-btn"
            onClick={() =>
              navigate("/book-appointment")
            }
          >

            Book Appointment

          </button>

        </section>

      )}

    </main>

  </div>

);

}

export default Dashboard;