import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import jsPDF from "jspdf";

import Navbar from "../components/Navbar";
import "./MyAppointments.css";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ratingAppointment, setRatingAppointment] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/appointment/my-appointments",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      console.log("My Appointments:", data);

      if (response.ok) {
        setAppointments(data.appointments || []);
      } else {
        toast.error(data.message || data.error);
      }
    } catch (error) {
      console.log(error);
      toast.error("Unable to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const viewQueue = (appointmentId) => {
    localStorage.setItem("appointmentId", appointmentId);
    navigate("/queue-status");
  };

  const submitFeedback = async () => {
    if (!ratingAppointment) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/appointment/feedback/${ratingAppointment._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            rating,
            feedback
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Feedback submitted successfully ⭐");

        setRatingAppointment(null);
        setRating(5);
        setFeedback("");

        fetchAppointments();
      } else {
        toast.error(data.message || data.error);
      }
    } catch (error) {
      console.log(error);
      toast.error("Unable to submit feedback");
    }
  };

  const downloadAppointmentSlip = (appointment) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("Smart Queue", 20, 25);

    doc.setFontSize(16);
    doc.text("Appointment Slip", 20, 38);

    doc.setFontSize(12);

    doc.text(`Doctor: ${appointment.doctorId?.name || "Not Assigned"}`, 20, 55);
    doc.text(`Appointment Date: ${appointment.date}`, 20, 67);
    doc.text(`Token Number: #${appointment.tokenNumber}`, 20, 79);
    doc.text(`Patient Type: ${appointment.patientType || "normal"}`, 20, 91);
    doc.text(`Status: ${appointment.status}`, 20, 103);

    if (appointment.patientType === "emergency") {
      doc.text(`Emergency Level: ${appointment.emergencyLevel || "N/A"}`, 20, 115);
    }

    doc.setFontSize(10);
    doc.text("Please keep this slip for your appointment.", 20, 140);
    doc.text("Thank you for using Smart Queue.", 20, 150);

    doc.save(`SmartQueue_Token_${appointment.tokenNumber}.pdf`);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "appointment-status confirmed";
      case "completed":
        return "appointment-status completed";
      case "cancelled":
        return "appointment-status cancelled";
      default:
        return "appointment-status pending";
    }
  };

  return (
    <div className="my-appointments-page">
      <Navbar />

      <main className="my-appointments-container">
        {/* Header */}
        <section className="appointments-header">
          <div>
            <p className="appointments-label">APPOINTMENTS</p>
            <h1>My Appointments</h1>
            <p>View and track all your hospital appointments in one place.</p>
          </div>

          <div className="appointments-icon">📋</div>
        </section>

        {/* Loading */}
        {loading ? (
          <div className="appointments-loading">
            <div className="appointments-loader"></div>
            <p>Loading your appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-appointments">
            <div className="empty-appointments-icon">📅</div>
            <h2>No Appointments Found</h2>
            <p>You don't have any appointments yet.</p>

            <button
              className="book-now-btn"
              onClick={() => navigate("/book-appointment")}
            >
              Book an Appointment
            </button>
          </div>
        ) : (
          <section className="appointments-list-section">
            <div className="list-header">
              <div>
                <p className="small-label">YOUR BOOKINGS</p>
                <h2>Appointment History</h2>
              </div>

              <span className="appointment-count">
                {appointments.length} Appointments
              </span>
            </div>

            <div className="appointments-list">
              {appointments.map((appointment) => (
                <div className="appointment-card" key={appointment._id}>
                  <div className="appointment-card-top">
                    <div className="appointment-title">
                      <div className="doctor-avatar">
                        {appointment.doctorId?.name?.charAt(0)?.toUpperCase() ||
                          "D"}
                      </div>

                      <div>
                        <p className="small-label">DOCTOR</p>
                        <h3>{appointment.doctorId?.name || "Not Assigned"}</h3>
                      </div>
                    </div>

                    <span className={getStatusClass(appointment.status)}>
                      {appointment.status}
                    </span>
                  </div>

                  <div className="appointment-details">
                    <div className="detail-box">
                      <span>Appointment Date</span>
                      <strong>{appointment.date}</strong>
                    </div>

                    <div className="detail-box token-detail">
                      <span>Token Number</span>
                      <strong>#{appointment.tokenNumber}</strong>
                    </div>

                    <div className="detail-box">
                      <span>Patient Type</span>
                      <strong className="capitalize">
                        {appointment.patientType || "normal"}
                      </strong>
                    </div>
                  </div>

                  {appointment.patientType === "emergency" && (
                    <div className="emergency-note">
                      🚨 Emergency Appointment
                      {appointment.emergencyVerified && (
                        <span> • Level {appointment.emergencyLevel}</span>
                      )}
                    </div>
                  )}

                  <div className="appointment-actions">

  {appointment.status !== "completed" &&
    appointment.status !== "cancelled" && (
      <button
        className="action-btn queue-action"
        onClick={() => viewQueue(appointment._id)}
      >
        <span>📊</span>
        Queue Status
      </button>
    )}

  {appointment.status === "completed" &&
    !appointment.feedbackSubmitted && (
      <button
        className="action-btn rate-action"
        onClick={() => setRatingAppointment(appointment)}
      >
        <span>⭐</span>
        Rate Consultation
      </button>
    )}

  {appointment.status !== "cancelled" && (
    <button
      className="action-btn slip-action"
      onClick={() => downloadAppointmentSlip(appointment)}
    >
      <span>📄</span>
      Appointment Slip
    </button>
  )}

  {appointment.status === "completed" &&
    appointment.feedbackSubmitted && (
      <div className="feedback-submitted">
        ✓ Feedback Submitted
      </div>
    )}

</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Feedback Modal */}
        {ratingAppointment && (
          <div className="feedback-overlay">
            <div className="feedback-modal">
              <h2>Rate Your Consultation ⭐</h2>
              <p>How was your experience with the doctor?</p>

              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={star <= rating ? "star active" : "star"}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Write your feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />

              <div className="feedback-actions">
                <button
                  className="cancel-feedback-btn"
                  onClick={() => setRatingAppointment(null)}
                >
                  Cancel
                </button>

                <button className="submit-feedback-btn" onClick={submitFeedback}>
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MyAppointments;
