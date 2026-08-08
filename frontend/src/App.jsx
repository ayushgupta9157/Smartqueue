import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import QueueStatus from "./pages/QueueStatus";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStats from "./pages/AdminStats";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorHistory from "./pages/DoctorHistory";
import ProtectedRoute from "./pages/ProtectedRouted";
import NotFound from "./pages/NotFound";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="patient">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book-appointment"
          element={
            <ProtectedRoute allowedRole="patient">
              <BookAppointment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute allowedRole="patient">
              <MyAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/queue-status"
          element={
            <ProtectedRoute allowedRole="patient">
              <QueueStatus />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-stats"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminStats />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-history"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorHistory />
            </ProtectedRoute>
          }
        />

        {/* 404 Page */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;