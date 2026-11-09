# KYC Verification System

A full-stack identity verification platform built to streamline user onboarding, document validation, and administrative approval workflows. Users can submit personal information alongside government ID proofs and selfies, receive a unique tracking ID, and monitor their verification status in real time.

---

## Application Preview



---

## Key Features

### User Workflow
- Structured Onboarding Form: Collects personal details (Name, DOB, Gender, Address) along with contact information (Mobile, Email).
- Multi-ID Support: Supports Aadhaar, PAN, Passport, and Driving License selection with ID number input.
- Secure File Uploads: Handles identity document and selfie uploads using Multer with format validation.
- Real-Time Status Tracking: Generates a unique KYC Application ID upon submission so applicants can check Pending, Approved, or Rejected statuses anytime.

### Admin Workflow
- Dedicated Admin Login: Restricts verification controls to authorized administrators.
- Centralized Application Queue: View and refresh all submitted applications filtered by Pending, Approved, and Rejected states.
- Document & Selfie Inspection: Review applicant details, uploaded ID documents, and selfie verification status before approving or rejecting requests.

---

## Tech Stack

- Frontend: React.js, JavaScript (ES6+), HTML5, CSS3
- Backend: Node.js, Express.js, Multer, CORS
- Database: MySQL

---

## System Architecture

1. Data Submission: User fills out the React form and uploads an ID document and selfie via multipart/form-data.
2. Backend Processing: Express and Multer validate the file formats, store the files, and save applicant records in MySQL with a Pending status.
3. ID Generation: The server generates a unique KYC Application ID and returns it to the user.
4. Admin Verification: Admin logs into the dashboard, inspects the uploaded documents and selfie status, and updates the record to Approved or Rejected.
5. Status Lookup: User queries their Application ID to view the real-time verification decision.

---

## Folder Structure

```text
KYC-Verification-System/
├── frontend/          # React.js client application
├── backend/           # Node.js & Express REST API + Multer file handling
└── README.md          # Project documentation
```

---

## Local Setup & Installation

### Prerequisites
- Node.js (v16+)
- MySQL Server

### 1. Clone the Repository
```bash
git clone https://github.com
cd kyc-verification-system
```

### 2. Database Setup
Open your MySQL client and create the database:
```sql
CREATE DATABASE kyc_db;
```
(Import your MySQL tables into kyc_db before starting the backend server.)

### 3. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file inside the `backend/` folder with your database credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=kyc_db
```
Start the backend server:
```bash
npm start
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```
The app will run locally at `http://localhost:3000`.

---

## Developer
Ram Kumar  
- GitHub: https://github.com/poddarram46  
- LinkedIn: https://www.linkedin.com/in/ram-poddar-815ab9322

