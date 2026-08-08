import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

import "./AdminStats.css";

function AdminStats() {

  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {

    const token = localStorage.getItem("token");

    try {

      const response = await fetch(
        "https://smartqueue-backend-vjuh.onrender.com/api/admin/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      console.log("Admin Analytics:", data);

      if (response.ok) {
        setStats(data);
      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };


  if (loading) {

    return (
      <div className="admin-stats-page">

        <Navbar />

        <div className="stats-loading">

          <div className="stats-loader"></div>

          <p>
            Loading analytics...
          </p>

        </div>

      </div>
    );

  }


  return (

    <div className="admin-stats-page">

      <Navbar />

      <main className="admin-stats-container">

        {/* HEADER */}

        <section className="stats-header">

          <div>

            <p className="stats-label">
              ADMIN ANALYTICS
            </p>

            <h1>
              Hospital Analytics 📊
            </h1>

            <p>
              Overview of patients, doctors,
              appointments and queue activity.
            </p>

          </div>

          <div className="stats-header-icon">
            📈
          </div>

        </section>


        {/* MAIN STATS */}

        <section className="stats-grid">

          <div className="analytics-card">

            <div className="analytics-icon patients-icon">
              👥
            </div>

            <div className="analytics-content">

              <span>
                Total Patients
              </span>

              <strong>
                {stats.totalPatients || 0}
              </strong>

              <small>
                Registered patients
              </small>

            </div>

          </div>


          <div className="analytics-card">

            <div className="analytics-icon doctors-icon">
              👨‍⚕️
            </div>

            <div className="analytics-content">

              <span>
                Total Doctors
              </span>

              <strong>
                {stats.totalDoctors || 0}
              </strong>

              <small>
                Active doctor accounts
              </small>

            </div>

          </div>


          <div className="analytics-card">

            <div className="analytics-icon appointments-icon">
              📋
            </div>

            <div className="analytics-content">

              <span>
                Total Appointments
              </span>

              <strong>
                {stats.totalAppointments || 0}
              </strong>

              <small>
                All appointment records
              </small>

            </div>

          </div>


          <div className="analytics-card">

            <div className="analytics-icon queue-icon">
              ⏱️
            </div>

            <div className="analytics-content">

              <span>
                Today's Queue
              </span>

              <strong>
                {stats.todayQueue || 0}
              </strong>

              <small>
                Pending + confirmed
              </small>

            </div>

          </div>

        </section>


        {/* WEEKLY PATIENT TREND */}

        <section className="chart-card">

          <div className="chart-header">

            <div>

              <p className="small-label">
                PATIENT ACTIVITY
              </p>

              <h2>
                Weekly Patient Trend
              </h2>

              <p>
                Appointment activity over the last 7 days.
              </p>

            </div>

            <div className="chart-icon">
              📈
            </div>

          </div>


          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={320}
            >

              <LineChart
                data={stats.weeklyPatients || []}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="day"
                />

                <YAxis
                  allowDecimals={false}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="count"
                  name="Patients"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </section>


        {/* DOCTOR LOAD */}

        <section className="chart-card">

          <div className="chart-header">

            <div>

              <p className="small-label">
                DOCTOR ACTIVITY
              </p>

              <h2>
                Doctor-wise Appointment Load
              </h2>

              <p>
                Total appointments handled by each doctor.
              </p>

            </div>

            <div className="chart-icon">
              👨‍⚕️
            </div>

          </div>


          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height={320}
            >

              <BarChart
                data={stats.doctorLoad || []}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="doctor"
                />

                <YAxis
                  allowDecimals={false}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  name="Appointments"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </section>


        {/* QUEUE OVERVIEW */}

        <section className="queue-overview-card">

          <div className="queue-overview-header">

            <div>

              <p className="small-label">
                TODAY
              </p>

              <h2>
                Queue Overview
              </h2>

            </div>

            <span className="live-status">

              <span className="live-dot"></span>

              Live

            </span>

          </div>


          <div className="queue-overview-body">

            <div className="queue-number">
              {stats.todayQueue || 0}
            </div>

            <div>

              <h3>
                Patients in Today's Queue
              </h3>

              <p>
                Pending and confirmed appointments
                scheduled for today.
              </p>

            </div>

          </div>


          <div className="queue-bar">

            <div
              className="queue-bar-fill"
              style={{
                width:
                  stats.todayQueue > 0
                    ? "100%"
                    : "0%"
              }}
            ></div>

          </div>

        </section>


        {/* QUICK SUMMARY */}

        <section className="summary-grid">

          <div className="summary-card">

            <span className="summary-icon">
              🏥
            </span>

            <div>

              <h3>
                Hospital Workforce
              </h3>

              <p>
                {stats.totalDoctors || 0} doctors
                are registered in the system.
              </p>

            </div>

          </div>


          <div className="summary-card">

            <span className="summary-icon">
              📅
            </span>

            <div>

              <h3>
                Appointment Activity
              </h3>

              <p>
                {stats.totalAppointments || 0}
                appointment records are stored.
              </p>

            </div>

          </div>


          <div className="summary-card">

            <span className="summary-icon">
              👤
            </span>

            <div>

              <h3>
                Patient Base
              </h3>

              <p>
                {stats.totalPatients || 0}
                registered patients use Smart Queue.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>

  );

}

export default AdminStats;