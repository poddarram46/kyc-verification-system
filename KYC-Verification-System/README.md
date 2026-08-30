# KYC Verification System

This is a full-stack KYC verification project built to understand how an online identity verification system works.

The project allows a user to submit their personal details, upload an identity document and selfie, and check their KYC application status. An admin can view the submitted applications and approve or reject them.

## Features

### User Side

- KYC registration form
- Personal details submission
- Gender and date of birth
- Mobile number and email
- Address details
- Aadhaar, PAN, Passport and Driving License selection
- Identity document upload
- Selfie upload for face verification
- KYC application ID
- Application status checking

### Admin Side

- Admin login
- View submitted KYC applications
- View applicant details
- View uploaded documents
- Check face verification status
- Approve applications
- Reject applications
- View pending, approved and rejected applications
- Refresh application data

## Tech Stack

**Frontend**
- React.js
- JavaScript
- HTML
- CSS

**Backend**
- Node.js
- Express.js
- Multer
- CORS

**Database**
- MySQL

## How the Project Works

1. User fills in the KYC form.
2. User selects the document type and enters the document number.
3. User uploads an identity document.
4. User uploads a selfie.
5. The application is submitted to the backend.
6. Application details are stored in MySQL.
7. Admin can see the application from the dashboard.
8. Admin reviews the submitted information.
9. Admin can approve or reject the application.
10. User can check the current application status.

## Project Structure

```text
KYC-Verification-System/
│
├── frontend/
│
├── backend/
│
└── README.md