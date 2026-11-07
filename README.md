# KYC Verification System

This is a project I built to learn how a KYC verification system works in a real-world application.

In this project, users can fill out a form with their personal details, upload an identity document and a selfie, and check their application status. There is also an admin panel where submitted applications can be checked and approved or rejected.

## Features

### User

- Fill out the KYC registration form
- Enter personal details like name, date of birth, gender and address
- Add mobile number and email
- Select an ID proof (Aadhaar, PAN, Passport or Driving License)
- Upload an identity document
- Upload a selfie
- Get a KYC application ID
- Check application status

### Admin

- Admin login
- View all submitted applications
- Check applicant details
- View uploaded documents
- Check face verification status
- Approve or reject applications
- View pending, approved and rejected applications
- Refresh the application list

## Technologies Used

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

## How It Works

1. A user opens the KYC form and enters their details.
2. The user selects an ID proof and enters its number.
3. The user uploads the document and a selfie.
4. The form data is sent to the backend.
5. The application details are saved in MySQL.
6. The admin logs in and checks the submitted application.
7. After reviewing the details, the admin can approve or reject it.
8. The user can check the application status using their application ID.

## Folder Structure

```text
KYC-Verification-System/
│
├── frontend/
├── backend/
└── README.md
```

## What I Learned

While building this project, I got practical experience with React, Node.js, Express, MySQL and file uploads. I also learned how frontend and backend communicate through APIs and how application data is stored and managed.

## Developer

Ram Kumar

GitHub: https://github.com/poddarram46
