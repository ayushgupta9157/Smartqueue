import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./DoctorHistory.css";

function DoctorHistory() {

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {

    const token = localStorage.getItem("token");

    try {

      const response = await fetch(
        "https://smartqueue-backend-vjuh.onrender.com/api/doctor/history",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      console.log("Doctor History:", data);

      if (response.ok) {
        setHistory(data.history || []);
      } else {
        alert(data.message || data.error);
      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="history-page">

      <Navbar />

      <main className="history-container">

        {/* Header */}

        <section className="history-header">

          <div>

            <p className="history-label">
              DOCTOR PORTAL
            </p>

            <h1>
              Completed Patient History 📋
            </h1>

            <p>
              View your previously completed patient
              appointments.
            </p>

          </div>

          <div className="history-icon">
            🩺
          </div>

        </section>


        {/* Loading */}

        {loading ? (

          <div className="history-loading">

            <div className="history-loader"></div>

            <p>
              Loading patient history...
            </p>

          </div>

        ) : history.length === 0 ? (

          /* Empty */

          <div className="history-empty">

            <div className="history-empty-icon">
              📋
            </div>

            <h2>
              No Completed Patients
            </h2>

            <p>
              There are no completed patient
              records available yet.
            </p>

          </div>

        ) : (

          /* History List */

          <section className="history-section">

            <div className="history-section-header">

              <div>

                <p className="small-history-label">
                  RECORDS
                </p>

                <h2>
                  Patient History
                </h2>

              </div>

              <span className="history-count">
                {history.length} Records
              </span>

            </div>


            <div className="history-list">

              {history.map((appointment) => (

                <div
                  className="history-card"
                  key={appointment._id}
                >

                  {/* Patient */}

                  <div className="history-patient">

                    <div className="history-avatar">

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
                          "No email available"}
                      </p>

                    </div>

                  </div>


                  {/* Details */}

                  <div className="history-details">

                    <div className="history-detail">

                      <span>
                        Appointment Date
                      </span>

                      <strong>
                        {appointment.date}
                      </strong>

                    </div>


                    <div className="history-detail">

                      <span>
                        Token Number
                      </span>

                      <strong className="history-token">
                        #{appointment.tokenNumber}
                      </strong>

                    </div>


                    <div className="history-detail">

                      <span>
                        Status
                      </span>

                      <strong className="completed-status">
                        Completed
                      </strong>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default DoctorHistory;