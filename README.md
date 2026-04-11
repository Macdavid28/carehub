# CareHub - Healthcare Management System

CareHub is a modern, full-stack healthcare management platform designed to streamline interactions between patients, doctors, and hospital administrators. It provides a robust set of tools for appointment scheduling, medical record management, and automated hospital workflows.

---

## 🚀 Key Features

### 👤 Patient Portal
- **Secure Authentication**: Seamless registration and login for patients.
- **Appointment Booking**: Search for doctors by specialty and book appointments at your convenience.
- **Medical History**: View personal medical records, prescriptions, and past visit summaries.
- **Profile Management**: Maintain personal details and contact information.

### 🩺 Doctor Dashboard
- **Patient Management**: Access patient history and medical records.
- **Digital Prescriptions**: Create and manage prescriptions with automated image processing.
- **Appointment Control**: Accept or cancel patient requests and manage your daily schedule.
- **Statistics**: Personalized dashboard showing active patients and appointment trends.

### ⚙️ Admin Control Center
- **User Management**: Oversee all doctors, patients, and staff.
- **Department Tracking**: Manage hospital departments (Cardiology, Pediatrics, etc.) with image support.
- **Live Stats**: Real-time hospital-wide metrics (Total Patients, Doctors, Appointments by Status).
- **System Configuration**: Manage core hospital settings and staff registration.

---

## 🤖 Automated Workflows (Cron Jobs)
CareHub features an intelligent automated status management system to ensure data accuracy:
- **Auto-Expiration**: Appointments that remain `Pending` after the scheduled time has passed are automatically marked as `Expired`.
- **Auto-Completion (Grace Period)**: `Confirmed` appointments are automatically moved to `Completed` after a **24-hour grace period**, ensuring hospital statistics accurately reflect appointments that "held".

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Task Scheduling**: Node-Cron
- **Image Processing**: Multer & Sharp
- **Security**: JWT (JSON Web Tokens) & BcryptJS

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or via Atlas)
- npm or yarn

### 1. Backend Setup
```bash
cd server
npm install
```
Configure your `.env` file in the root directory:
```env
MONGO_URI=your mongodb uri
JWT_SECRET=your_jwt_secret
SERVER_PORT=8000
CLIENT_LINK=http://localhost:5173
```

### 2. Frontend Setup
```bash
cd client
npm install
```

### 3. Running the App
**Run Backend:**
```bash
cd server
npm run server
```
**Run Frontend:**
```bash
cd client
npm run dev
```

---

## 📁 Project Structure
```text
carehub/
├── client/           # React + Vite frontend
├── server/           # Node.js + Express backend
│   ├── controllers/  # Business logic
│   ├── email/  # email logic
│   ├── logs/  # logging logic
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API endpoints
│   ├── utils/        # Cron jobs, token generation, seeders
│   └── middleware/   # Auth, Upload, and Error handlers
└── .env              # Global configuration
```

---

## 📄 License
This project is licensed under the MIT License.
