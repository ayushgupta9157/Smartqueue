import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./DoctorDashboard.css";
import { toast } from "react-toastify";

function DoctorDashboard() {
  const [dashboard, setDashboard] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshDashboard();
  }, []);

  const getToken = () => localStorage.getItem("token");

  const fetchDashboard = async () => {
    try {
      const response = await fetch(
        "https://smartqueue-backend-vjuh.onrender.com/api/doctor/dashboard",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setDashboard(data);
      } else {
        toast.error(data.message || data.error || "Unable to load dashboard");
      }
    } catch (error) {
      console.log(error);
      toast.error("Unable to load dashboard");
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch(
        "https://smartqueue-backend-vjuh.onrender.com/api/doctor/appointments",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
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

  const fetchHistory = async () => {
    try {
      const response = await fetch(
        "https://smartqueue-backend-vjuh.onrender.com/api/doctor/history",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setHistory(data.history || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const refreshDashboard = async () => {
    setLoading(true);

    await Promise.all([
      fetchDashboard(),
      fetchAppointments(),
      fetchHistory()
    ]);

    setLoading(false);
  };

  const callNextPatient = async () => {
    try {
      const response = await fetch(
        "https://smartqueue-backend-vjuh.onrender.com/api/doctor/call-next",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Next patient called");
        refreshDashboard();
      } else {
        toast.error(data.message || data.error || "Unable to call patient");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const completePatient = async (id) => {
    try {
      const response = await fetch(
        `https://smartqueue-backend-vjuh.onrender.com/api/doctor/complete/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Patient consultation completed");
        refreshDashboard();
      } else {
        toast.error(data.message || data.error);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const verifyEmergency = async (id, emergencyLevel) => {
    try {
      const response = await fetch(
        `https://smartqueue-backend-vjuh.onrender.com/api/doctor/verify-emergency/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            emergencyLevel
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(
          data.message || `Emergency Level ${emergencyLevel} verified`
        );
        refreshDashboard();
      } else {
        toast.error(data.message || data.error);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="doctor-page">
        <Navbar />

        <div className="doctor-loading">
          <div className="doctor-loader"></div>
          <p>Loading Doctor Dashboard...</p>
        </div>
      </div>
    );
  }

  const currentPatient = dashboard.currentPatient;
  const nextPatient = dashboard.nextPatient;

  return (
    <div className="doctor-page">
      <Navbar />

      <main className="doctor-container">

        {/* HEADER */}

        <section className="doctor-header">
          <div>
            <p className="doctor-label">DOCTOR PORTAL</p>

            <h1>
              {dashboard.doctorName || "Doctor"} Dashboard
            </h1>

            <p>
              Manage today's queue and patient consultations
              efficiently.
            </p>
          </div>

          <div className="doctor-icon">
            👨‍⚕️
          </div>
        </section>


        {/* STATS */}

        <section className="doctor-stats">

          <div className="doctor-stat-card">
            <div className="doctor-stat-icon waiting">
              👥
            </div>

            <div>
              <span>Waiting Patients</span>

              <strong>
                {dashboard.waitingPatients || 0}
              </strong>
            </div>
          </div>


          <div className="doctor-stat-card">
            <div className="doctor-stat-icon completed">
              ✓
            </div>

            <div>
              <span>Completed Today</span>

              <strong>
                {dashboard.completedPatients || 0}
              </strong>
            </div>
          </div>


          <div className="doctor-stat-card">
            <div className="doctor-stat-icon queue">
              📋
            </div>

            <div>
              <span>Today's Appointments</span>

              <strong>
                {appointments.length}
              </strong>
            </div>
          </div>

        </section>


        {/* CURRENT + NEXT */}

        <section className="patient-panels">

          {/* CURRENT PATIENT */}

          <div className="patient-card current-card">

            <div className="patient-card-header">
              <div>
                <p className="small-label">
                  CURRENT PATIENT
                </p>

                <h2>Currently Serving</h2>
              </div>

              <span className="serving-badge">
                ● SERVING
              </span>
            </div>


            {currentPatient ? (
              <div>

                <div className="patient-info">

                  <div className="patient-avatar">
                    {currentPatient.userId?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "P"}
                  </div>

                  <div>
                    <h3>
                      {currentPatient.userId?.name || "Patient"}
                    </h3>

                    <p>
                      {currentPatient.userId?.email || "Patient"}
                    </p>
                  </div>

                </div>


                <div className="patient-details">

                  <div>
                    <span>Token Number</span>

                    <strong className="token-value">
                      #{currentPatient.tokenNumber}
                    </strong>
                  </div>

                  <div>
                    <span>Patient Type</span>

                    <strong className="capitalize">
                      {currentPatient.patientType}
                    </strong>
                  </div>

                </div>


                <button
                  className="complete-btn"
                  onClick={() =>
                    completePatient(currentPatient._id)
                  }
                >
                  ✓ Complete Patient
                </button>

              </div>
            ) : (

              <div className="empty-patient">
                <span>🪑</span>
                <p>No Current Patient</p>
              </div>

            )}

          </div>


          {/* NEXT PATIENT */}

          <div className="patient-card next-card">

            <div className="patient-card-header">

              <div>
                <p className="small-label">
                  NEXT IN QUEUE
                </p>

                <h2>Next Patient</h2>
              </div>

              <span className="next-badge">
                NEXT
              </span>

            </div>


            {nextPatient ? (
              <div>

                <div className="patient-info">

                  <div className="patient-avatar next-avatar">
                    {nextPatient.userId?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "P"}
                  </div>

                  <div>
                    <h3>
                      {nextPatient.userId?.name || "Patient"}
                    </h3>

                    <p>
                      Token #{nextPatient.tokenNumber}
                    </p>
                  </div>

                </div>


                <div className="next-details">

                  <span
                    className={
                      nextPatient.patientType === "emergency"
                        ? "type-badge emergency-type"
                        : "type-badge normal-type"
                    }
                  >
                    {nextPatient.patientType}
                  </span>

                </div>

              </div>
            ) : (

              <div className="empty-patient">
                <span>💤</span>
                <p>No Patient Waiting</p>
              </div>

            )}


            <button
              className="call-next-btn"
              onClick={callNextPatient}
              disabled={
                Boolean(currentPatient) ||
                !nextPatient
              }
            >
              📢 Call Next Patient
            </button>

          </div>

        </section>


        {/* TODAY'S PATIENTS */}

        <section className="appointments-section">

          <div className="section-title">

            <div>
              <p className="small-label">
                TODAY
              </p>

              <h2>Today's Patients</h2>
            </div>

            <span className="appointment-count">
              {appointments.length} Patients
            </span>

          </div>


          {appointments.length === 0 ? (

            <div className="no-appointments">
              <div>📋</div>

              <h3>
                No appointments today
              </h3>

              <p>
                There are no patients scheduled for today.
              </p>
            </div>

          ) : (

            <div className="appointments-list">

              {appointments.map((appointment) => (

                <div
                  className="appointment-row"
                  key={appointment._id}
                >

                  <div className="row-patient">

                    <div className="row-avatar">
                      {appointment.userId?.name
                        ?.charAt(0)
                        ?.toUpperCase() || "P"}
                    </div>

                    <div>
                      <strong>
                        {appointment.userId?.name || "Patient"}
                      </strong>

                      <span>
                        Token #{appointment.tokenNumber}
                      </span>
                    </div>

                  </div>


                  <div className="row-type">

                    <span
                      className={
                        appointment.patientType === "emergency"
                          ? "type-badge emergency-type"
                          : "type-badge normal-type"
                      }
                    >
                      {appointment.patientType}
                    </span>

                  </div>


                  <div className="row-status">

                    <span
                      className={`appointment-status ${appointment.status}`}
                    >
                      {appointment.status}
                    </span>

                  </div>


                  <div className="row-emergency">

                    {appointment.patientType === "emergency" ? (

                      appointment.emergencyVerified ? (

                        <span className="verified-badge">
                          🚨 Level {appointment.emergencyLevel}
                        </span>

                      ) : (

                        <span className="pending-emergency">
                          Verification Pending
                        </span>

                      )

                    ) : (

                      <span className="normal-label">
                        Standard
                      </span>

                    )}

                  </div>


                  {appointment.patientType === "emergency" &&
                    !appointment.emergencyVerified && (

                      <div className="verify-actions">

                        <button
                          onClick={() =>
                            verifyEmergency(
                              appointment._id,
                              1
                            )
                          }
                        >
                          Level 1
                        </button>

                        <button
                          onClick={() =>
                            verifyEmergency(
                              appointment._id,
                              2
                            )
                          }
                        >
                          Level 2
                        </button>

                        <button
                          onClick={() =>
                            verifyEmergency(
                              appointment._id,
                              3
                            )
                          }
                        >
                          Level 3
                        </button>

                      </div>

                    )}

                </div>

              ))}

            </div>

          )}

        </section>


        {/* CONSULTATION HISTORY */}

        <section className="appointments-section">

          <div className="section-title">

            <div>
              <p className="small-label">
                HISTORY
              </p>

              <h2>Consultation History</h2>
            </div>

            <span className="appointment-count">
              {history.length} Records
            </span>
          </div>


          {history.length === 0 ? (

            <div className="no-appointments">
              <div>📊</div>

              <h3>No consultation history</h3>

              <p>
                Completed consultations will appear here.
              </p>
            </div>

          ) : (

            <div className="history-list">

              {history.map((item) => (

                <div
                  className="history-row"
                  key={item._id}
                >

                  <div className="history-patient">

                    <div className="row-avatar">
                      {item.userId?.name
                        ?.charAt(0)
                        ?.toUpperCase() || "P"}
                    </div>

                    <div>
                      <strong>
                        {item.userId?.name || "Patient"}
                      </strong>

                      <span>
                        Consultation Completed
                      </span>
                    </div>

                  </div>


                  <div className="history-rating">
                    ⭐ {item.rating || "No Rating"}
                  </div>


                  <div className="history-feedback">
                    {item.feedback || "No feedback provided"}
                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>
    </div>
  );
}

export default DoctorDashboard;