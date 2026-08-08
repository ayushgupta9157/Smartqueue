import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import "./BookAppointment.css";

function BookAppointment() {

  const [date, setDate] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");

  const [patientType, setPatientType] =
    useState("normal");

  const [emergencyLevel, setEmergencyLevel] =
    useState(1);

  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] =
    useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {

    try {

      setDoctorsLoading(true);

      const response = await fetch(
        "https://smartqueue-backend-vjuh.onrender.com/api/doctor"
      );

      const data = await response.json();

      if (response.ok) {

        setDoctors(data.doctors || []);

      } else {

        toast.error(data.message || "Unable to load doctors");

      }

    } catch (error) {

      console.log(error);

      toast.error("Unable to load doctors");

    } finally {

      setDoctorsLoading(false);

    }

  };

  const bookAppointment = async () => {

    const token = localStorage.getItem("token");

    if (!date || !doctorId) {

      toast.warning("Please select doctor and date");
      return;

    }

    setLoading(true);

    try {

      const response = await fetch(
        "https://smartqueue-backend-vjuh.onrender.com/api/appointment",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            date,
            doctorId,
            patientType,
            emergencyLevel:
              patientType === "emergency"
                ? Number(emergencyLevel)
                : 0
          })
        }
      );

      const data = await response.json();

      if (response.ok) {

        localStorage.setItem(
          "appointmentId",
          data.appointment._id
        );

        toast.success("Appointment Booked Successfully");

        setTimeout(() => {
          navigate("/queue-status");
        }, 1200);

      } else {

        toast.error(
          data.message ||
          data.error ||
          "Booking Failed"
        );

      }

    } catch (error) {

      console.log(error);

      toast.error("Unable to book appointment");

    } finally {

      setLoading(false);

    }

  };
    return (
    <div className="book-page">

      <Navbar />

      <main className="book-container">

        {/* Header */}

        <section className="book-header">

          <div>

            <p className="book-label">
              APPOINTMENT
            </p>

            <h1>
              Book an Appointment
            </h1>

            <p>
              Choose your doctor, appointment date
              and patient type.
            </p>

          </div>

          <div className="book-icon">
            📅
          </div>

        </section>

        {/* Form */}

        <section className="booking-card">

          <div className="form-group">

            <label>
              Select Doctor
            </label>

            <select
              value={doctorId}
              onChange={(e) =>
                setDoctorId(e.target.value)
              }
              disabled={doctorsLoading}
            >

              <option value="">
                {doctorsLoading
                  ? "Loading doctors..."
                  : "Select Doctor"}
              </option>

              {doctors.map((doctor) => (

                <option
                  key={doctor._id}
                  value={doctor._id}
                >
                  {doctor.name}
                </option>

              ))}

            </select>

          </div>

          <div className="form-group">

            <label>
              Appointment Date
            </label>

            <input
              type="date"
              value={date}
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(e) =>
                setDate(e.target.value)
              }
            />

          </div>

          <div className="form-group">

            <label>
              Patient Type
            </label>

            <select
              value={patientType}
              onChange={(e) =>
                setPatientType(e.target.value)
              }
            >

              <option value="normal">
                Normal
              </option>

              <option value="emergency">
                Emergency
              </option>

            </select>

          </div>

          {patientType === "emergency" && (

            <div className="emergency-box">

              <div className="emergency-title">
                🚨 Emergency Appointment
              </div>

              <p>
                Your emergency request will be
                reviewed and verified by the doctor.
              </p>

              <div className="form-group">

                <label>
                  Emergency Level
                </label>

                <select
                  value={emergencyLevel}
                  onChange={(e) =>
                    setEmergencyLevel(
                      Number(e.target.value)
                    )
                  }
                >

                  <option value={1}>
                    Level 1
                  </option>

                  <option value={2}>
                    Level 2
                  </option>

                  <option value={3}>
                    Level 3 - Critical
                  </option>

                </select>

              </div>

            </div>

          )}

          {/* Summary */}

          <div className="booking-summary">

            <div>

              <span>
                Doctor
              </span>

              <strong>

                {
                  doctors.find(
                    (doctor) =>
                      doctor._id === doctorId
                  )?.name || "Not selected"
                }

              </strong>

            </div>

            <div>

              <span>
                Date
              </span>

              <strong>
                {date || "Not selected"}
              </strong>

            </div>

            <div>

              <span>
                Type
              </span>

              <strong>
                {patientType}
              </strong>

            </div>

          </div>

          <button
            className="book-btn"
            onClick={bookAppointment}
            disabled={loading}
          >

            {loading
              ? "Booking Appointment..."
              : "Book Appointment"}

          </button>

        </section>

      </main>

    </div>

  );

}

export default BookAppointment;