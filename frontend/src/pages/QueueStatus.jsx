import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import socket from "./socket";
import "./QueueStatus.css";
import { toast } from "react-toastify";

function QueueStatus() {

  const [queue, setQueue] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchQueueStatus = async () => {

    const token = localStorage.getItem("token");
    const appointmentId =
      localStorage.getItem("appointmentId");

    if (!appointmentId) {
      setLoading(false);
      toast.error("No active appointment found.");
      return;
    }

    try {

      const response = await fetch(
        `http://localhost:5000/api/appointment/queue/${appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      console.log("Queue Status:", data);

      if (response.ok) {
  setQueue(data);
  setRemainingTime(data.remainingMinutes || 0);
} else {
  toast.error(data.message || data.error);
}

    } catch (error) {

  console.log(error);
  toast.error("Unable to load queue status");

} finally {
  setLoading(false);
}

  };

useEffect(() => {

  fetchQueueStatus();

  const interval = setInterval(() => {
    fetchQueueStatus();
  }, 60000); // every 1 minute

  socket.on("queueUpdated", () => {
    fetchQueueStatus();
  });

  socket.on("appointmentUpdated", () => {
    fetchQueueStatus();
  });

  return () => {

    clearInterval(interval);

    socket.off("queueUpdated");
    socket.off("appointmentUpdated");

  };

}, []);

useEffect(() => {

    const timer = setInterval(() => {

        setRemainingTime((prev) => {

            if (prev <= 0) {
                return 0;
            }

            return prev - 1;

        });

    }, 60000);

    return () => clearInterval(timer);

}, []);

  return (

    <div className="queue-page">

      <Navbar />

      <main className="queue-container">

        {/* Header */}

        <section className="queue-header">

          <div>

            <p className="queue-label">
              LIVE QUEUE
            </p>

            <h1>
              Your Queue Status
            </h1>

            <p>
              Track your position and get AI-powered
              waiting time estimates.
            </p>

          </div>

          <div className="queue-icon">
            ⏱️
          </div>

        </section>


        {/* Loading */}

        {loading ? (

          <div className="queue-loading">

            <div className="queue-loader"></div>

            <p>
              Loading your queue status...
            </p>

          </div>

        ) : !queue ? (

          <div className="no-queue-card">

            <div className="no-queue-icon">
              📋
            </div>

            <h2>
              No Active Appointment
            </h2>

            <p>
              We could not find an active appointment
              for your account.
            </p>

          </div>

        ) : (

          <>

            {/* Main Queue Card */}

            <section className="queue-main-card">

              <div className="queue-card-top">

                <div>

                  <p className="small-label">
                    YOUR TOKEN
                  </p>

                  <div className="token-display">
                    #{queue.tokenNumber}
                  </div>

                </div>

                <div className="live-badge">
                  <span className="live-dot"></span>
                  LIVE
                </div>

              </div>


              {/* Stats */}

              <div className="queue-stats">

                <div className="queue-stat">

                  <span className="stat-icon">
                    👥
                  </span>

                  <span className="stat-label">
                    People Ahead
                  </span>

                  <span className="stat-value">
                    {queue.peopleAhead}
                  </span>

                </div>


                <div className="queue-stat ai-stat">

                  <span className="stat-icon">
                    🤖
                  </span>

                  <span className="stat-label">
                    AI Estimated Wait
                  </span>

                  <span className="stat-value ai-value">
                    {remainingTime} minutes
                  </span>

                </div>


                <div className="queue-stat">

                  <span className="stat-icon">
                    ⏱️
                  </span>

                  <span className="stat-label">
                    Avg. Consultation
                  </span>

                  <span className="stat-value">
                    {queue.averageConsultationTime} min
                  </span>

                </div>

              </div>


              {/* AI Status */}

              {queue.predictionSource ===
                "machine-learning" && (

                <div className="ai-status">

                  <div className="ai-status-icon">
                    🤖
                  </div>

                  <div>

                    <strong>
                      AI Prediction Enabled
                    </strong>

                    <p>
                      Wait time is being estimated
                      using the machine-learning model.
                    </p>

                  </div>

                </div>

              )}


              {/* Turn Message */}

              {queue.peopleAhead === 0 ? (

                <div className="turn-now">

                  <div className="turn-icon">
                    🎉
                  </div>

                  <div>

                    <h2>
                      Your Turn is Coming Now!
                    </h2>

                    <p>
                      Please be ready for your
                      consultation.
                    </p>

                  </div>

                </div>

              ) : (

                <div className="waiting-message">

                  <div className="waiting-icon">
                    🕐
                  </div>

                  <div>

                    <h3>
                      Please Wait
                    </h3>

                    <p>
                      There are{" "}
                      <strong>
                        {queue.peopleAhead}
                      </strong>{" "}
                      patient(s) ahead of you.
                    </p>

                  </div>

                </div>

              )}

            </section>


            {/* Information */}

            <section className="queue-info-grid">

              <div className="info-card">

                <div className="info-card-icon">
                  🤖
                </div>

                <div>

                  <h3>
                    AI Prediction
                  </h3>

                  <p>
                    Our machine-learning model
                    estimates your waiting time
                    based on queue conditions and
                    historical data.
                  </p>

                </div>

              </div>


              <div className="info-card">

                <div className="info-card-icon">
                  ⚡
                </div>

                <div>

                  <h3>
                    Real-Time Updates
                  </h3>

                  <p>
                    Your queue position updates
                    automatically when the queue
                    changes.
                  </p>

                </div>

              </div>

            </section>

          </>

        )}

      </main>

    </div>

  );

}

export default QueueStatus;