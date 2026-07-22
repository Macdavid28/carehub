# CareHub Test Credentials & Seeded Data

This document contains all test accounts, credentials, and initial demo data created by the database seeder script (`server/utils/seeder.js`).

---

## 🔑 User Accounts & Passwords

### 🛠️ 1. Administrator Account
- **Role:** `admin`
- **Email:** `admin@carehub.com`
- **Password:** `Admin@123`
- **Permissions:** Full system access (Manage Departments, Doctors, Patients, Appointments, Records).

---

### 👨‍⚕️ 2. Doctor Accounts
> **Default Password for all Doctors:** `Password123!`

| Name | Specialization | Department | Email | Password |
|---|---|---|---|---|
| **Dr. Sarah Jenkins** | Cardiologist | Cardiology | `doctor.cardio@carehub.com` | `Password123!` |
| **Dr. Robert Chen** | Neurologist | Neurology | `doctor.neuro@carehub.com` | `Password123!` |
| **Dr. Emily Taylor** | Pediatrician | Pediatrics | `doctor.peds@carehub.com` | `Password123!` |
| **Dr. Marcus Vance** | Orthopedic Surgeon | Orthopedics | `doctor.ortho@carehub.com` | `Password123!` |

---

### 🏥 3. Patient Accounts
> **Default Password for all Patients:** `Password123!`

| Name | Gender | Blood Group | Email | Password |
|---|---|---|---|---|
| **John Doe** | Male | O+ | `patient.john@carehub.com` | `Password123!` |
| **Alice Smith** | Female | A+ | `patient.alice@carehub.com` | `Password123!` |
| **Michael Brown** | Male | B- | `patient.michael@carehub.com` | `Password123!` |

---

## 🏢 Seeded Departments

1. **Cardiology** (Head: Dr. Sarah Jenkins)
2. **Neurology** (Head: Dr. Robert Chen)
3. **Pediatrics** (Head: Dr. Emily Taylor)
4. **Orthopedics** (Head: Dr. Marcus Vance)
5. **Dermatology**

---

## 📅 Seeded Appointments & Clinical Records

- **Appointments:** Pre-configured appointments connecting patients with doctors across Pending, Confirmed, and Completed states.
- **Medical Records:** Pre-populated diagnostic notes and vitals for chronic migraine and essential hypertension evaluations.
- **Prescriptions:** Pre-populated prescriptions including Sumatriptan 50mg and Lisinopril 10mg with active refill tracking.

---

## 🔄 Re-seeding the Database
To reset and re-seed the MongoDB database with these exact credentials anytime:
```bash
cd server
npm run admin
```
