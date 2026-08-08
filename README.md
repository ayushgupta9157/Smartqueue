# 🏥 Smart Queue – AI-Based Hospital Appointment & Queue Management System

Smart Queue is a full-stack web application that solves a simple but everyday problem — patients waiting in hospitals with **no idea how long their turn will take**. Instead of guessing, patients can log in, book an appointment, and see their **live token status, people ahead of them, and an AI-predicted wait time** — all updated in real time.

---

## 🚀 Features

### 👤 Patient
- Register/login and book an appointment with a doctor
- View live token number and queue status
- See **AI-estimated wait time** before their turn
- Mark appointment as **Normal or Emergency**
- View appointment history

### 🩺 Doctor
- View and manage today's queue
- Call the next patient / complete consultation
- Verify emergency requests and assign priority level
- View consultation history
- Doctor accounts are created by Admin only (no public doctor signup)

### 🛠️ Admin
- Dashboard with total patients, doctors, and appointments
- **Analytics section** with patient/doctor/appointment stats
- Add/manage doctors
- Confirm or cancel appointments
- Date-wise appointment filtering

### ⚡ Real-Time & Smart
- **Live queue updates** via Socket.IO — no manual refresh needed
- **Emergency priority system** — emergencies (levels 1–3) are served before regular tokens
- **AI-powered wait time prediction** using a trained Random Forest model

### 📧 Email Notifications
- Sent automatically when an appointment is confirmed
- Sent as a reminder when a patient's turn is near

---

## 🧠 How the AI Prediction Works

A **Random Forest Regression model** predicts a patient's estimated wait time based on:
- Time of day / hour
- Day of the week
- Doctor's current queue load
- Average consultation time (calculated from completed appointments)

**Flow:** `React → Node.js/Express → Flask ML API → Random Forest Model → Prediction → back to React`

The React frontend never talks to the ML model directly — all predictions are routed through the Node.js backend for a clean separation of concerns.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, React Router, CSS, Socket.IO Client |
| **Backend** | Node.js, Express.js, JWT, bcrypt, Socket.IO, Axios |
| **Database** | MongoDB Atlas + Mongoose |
| **Machine Learning** | Python, Flask, Scikit-learn (Random Forest) |

---

## 🔐 Authentication & Security

- JWT-based authentication with role (`patient` / `doctor` / `admin`) embedded in the token
- Role-based protected routes on the frontend
- Passwords hashed using `bcrypt` before being stored in MongoDB

---

## 📋 Appointment Workflow

```
Register/Login
   → Select Doctor & Date
   → Book Appointment (token generated, status: pending)
   → Admin confirms/cancels
   → Doctor calls next patient
   → Consultation
   → Marked as completed
```

Token numbers are generated per **doctor + date**, so tokens can repeat across different doctors.

---

## 📂 Project Structure

```
Smart Queue/
├── frontend/        # React app (patient, doctor, admin dashboards)
├── backend/         # Node.js + Express API, MongoDB models, Socket.IO
├── ml/              # Flask ML API, Random Forest model, training script
└── queue/           # Socket testing utilities
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js
- Python 3.x
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/ayushgupta9157/Smartqueue.git
cd Smartqueue
```

### 2. Backend Setup
```bash
cd backend
npm install
# create a .env file with MONGO_URI, JWT_SECRET, PORT, ML_API_URL
npm start
```

### 3. ML API Setup
```bash
cd ml
pip install -r requirements.txt
python predict_api.py
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm start
```

---

## 📌 Future Improvements
- SMS notifications alongside email
- Video call appointment option for patients who can't visit in person
- Mobile app version

---

## 👨‍💻 Author

**Ayush Gupta**
B.Tech CSE (AI & ML), PSIT Kanpur
GitHub: [@ayushgupta9157](https://github.com/ayushgupta9157)
