
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// ===============================
// Middleware
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// Home & Test Routes
// ===============================

app.get("/", (req, res) => {
  res.send("KYC Backend Running");
});

app.get("/test", (req, res) => {
  res.send("Backend is working");
});

// ===============================
// Upload Folder
// ===============================

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// NOTE: Public uploads are suitable only for dummy demo files.
// Do not upload real identity documents.
app.use("/uploads", express.static(uploadDir));

// ===============================
// Multer Storage
// ===============================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");

    cb(null, uniqueName);
  }
});

// ===============================
// File Validation
// ===============================

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const allowedExtensions = /\.(jpeg|jpg|png|pdf)$/i;
    const ext = path.extname(file.originalname);

    if (allowedExtensions.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, PNG and PDF files are allowed"));
    }
  }
});

// ===============================
// MySQL Connection
// ===============================

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("MySQL connection failed:", err.message);
    return;
  }

  console.log("MySQL connected successfully");
  connection.release();
});

// ===============================
// KYC Submission API
// ===============================

app.post("/api/kyc", (req, res) => {
  const {
    fullName,
    dob,
    gender,
    mobile,
    email,
    address,
    documentType,
    documentNumber
  } = req.body;

  if (
    !fullName ||
    !dob ||
    !gender ||
    !mobile ||
    !email ||
    !address ||
    !documentType
  ) {
    return res.status(400).json({
      success: false,
      message: "Please fill all required fields"
    });
  }

  if (fullName.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Full name must contain at least 2 characters"
    });
  }

  const mobileRegex = /^[0-9]{10}$/;

  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Mobile number must contain exactly 10 digits"
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address"
    });
  }

  const allowedGenders = ["Male", "Female", "Other"];

  if (!allowedGenders.includes(gender)) {
    return res.status(400).json({
      success: false,
      message: "Invalid gender selected"
    });
  }

  const allowedDocuments = [
    "Aadhaar",
    "PAN",
    "Passport",
    "Driving License"
  ];

  if (!allowedDocuments.includes(documentType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid document type selected"
    });
  }

  if (
    documentNumber &&
    documentNumber.trim().length < 4
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid document number"
    });
  }

  const sql = `
    INSERT INTO users
    (
      full_name,
      dob,
      gender,
      mobile,
      email,
      address,
      document_type,
      document_number,
      verification_status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    fullName.trim(),
    dob,
    gender,
    mobile,
    email.trim(),
    address.trim(),
    documentType,
    documentNumber || null,
    "Pending"
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log("Database insert error:", err.message);

      return res.status(500).json({
        success: false,
        message: "Failed to save KYC data"
      });
    }

    console.log("KYC saved successfully. ID:", result.insertId);

    res.json({
      success: true,
      message: "KYC data saved successfully",
      id: result.insertId
    });
  });
});

// ===============================
// Document Upload API
// ===============================

app.post(
  "/api/upload-document",
  upload.single("document"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document uploaded"
      });
    }

    const userId = req.body.userId;

    if (!userId || !/^[0-9]+$/.test(userId)) {
      fs.unlink(req.file.path, () => {});

      return res.status(400).json({
        success: false,
        message: "Valid User ID is required"
      });
    }

    const filePath = `/uploads/${req.file.filename}`;

    const sql = `
      UPDATE users
      SET document_path = ?
      WHERE id = ?
    `;

    db.query(sql, [filePath, userId], (err, result) => {
      if (err) {
        console.log("Document database update error:", err.message);

        fs.unlink(req.file.path, () => {});

        return res.status(500).json({
          success: false,
          message: "Failed to save document information"
        });
      }

      if (result.affectedRows === 0) {
        fs.unlink(req.file.path, () => {});

        return res.status(404).json({
          success: false,
          message: "KYC application not found"
        });
      }

      res.json({
        success: true,
        message: "Document uploaded successfully",
        file: req.file.filename,
        path: filePath,
        userId
      });
    });
  }
);

// ===============================
// Selfie Upload API
// ===============================

app.post(
  "/api/upload-selfie",
  upload.single("selfie"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No selfie uploaded"
      });
    }

    const userId = req.body.userId;

    if (!userId || !/^[0-9]+$/.test(userId)) {
      fs.unlink(req.file.path, () => {});

      return res.status(400).json({
        success: false,
        message: "Valid User ID is required"
      });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      fs.unlink(req.file.path, () => {});

      return res.status(400).json({
        success: false,
        message: "Only image files are allowed for selfie"
      });
    }

    const selfiePath = `/uploads/${req.file.filename}`;

    const sql = `
      UPDATE users
      SET selfie_path = ?
      WHERE id = ?
    `;

    db.query(sql, [selfiePath, userId], (err, result) => {
      if (err) {
        console.log("Selfie database update error:", err.message);

        fs.unlink(req.file.path, () => {});

        return res.status(500).json({
          success: false,
          message: "Failed to save selfie information"
        });
      }

      if (result.affectedRows === 0) {
        fs.unlink(req.file.path, () => {});

        return res.status(404).json({
          success: false,
          message: "KYC application not found"
        });
      }

      res.json({
        success: true,
        message: "Selfie uploaded successfully",
        file: req.file.filename,
        path: selfiePath,
        userId
      });
    });
  }
);

// ===============================
// KYC Status API
// ===============================

app.get("/api/kyc/status/:id", (req, res) => {
  const applicationId = req.params.id;

  if (!/^[0-9]+$/.test(applicationId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid application ID"
    });
  }

  const sql = `
    SELECT id, full_name, verification_status
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [applicationId], (err, results) => {
    if (err) {
      console.log("Status fetch error:", err.message);

      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "KYC application not found"
      });
    }

    res.json({
      success: true,
      applicationId: results[0].id,
      fullName: results[0].full_name,
      status: results[0].verification_status
    });
  });
});

// ===============================
// Admin Login API
// ===============================

app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (
    ADMIN_EMAIL &&
    ADMIN_PASSWORD &&
    email.trim() === ADMIN_EMAIL &&
    password === ADMIN_PASSWORD
  ) {
    return res.status(200).json({
      success: true,
      message: "Admin login successful"
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid admin credentials"
  });
});

// ===============================
// Admin - Get All KYC
// ===============================

app.get("/api/admin/kyc", (req, res) => {
  const sql = `
    SELECT
      id,
      full_name,
      dob,
      gender,
      mobile,
      email,
      address,
      document_type,
      document_number,
      document_path,
      verification_status
    FROM users
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Admin KYC fetch error:", err.message);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch KYC applications"
      });
    }

    res.json({
      success: true,
      applications: results
    });
  });
});

// ===============================
// Admin - Approve / Reject
// ===============================

app.put("/api/admin/kyc/:id/status", (req, res) => {
  const applicationId = req.params.id;
  const { status } = req.body;

  if (!/^[0-9]+$/.test(applicationId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid application ID"
    });
  }

  if (status !== "Approved" && status !== "Rejected") {
    return res.status(400).json({
      success: false,
      message: "Status must be Approved or Rejected"
    });
  }

  const sql = `
    UPDATE users
    SET verification_status = ?
    WHERE id = ?
  `;

  db.query(sql, [status, applicationId], (err, result) => {
    if (err) {
      console.error("Status update error:", err.message);

      return res.status(500).json({
        success: false,
        message: "Failed to update KYC status"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "KYC application not found"
      });
    }

    res.json({
      success: true,
      message: `KYC application ${status.toLowerCase()} successfully`,
      applicationId,
      status
    });
  });
});

// ===============================
// Error Handling
// ===============================

app.use((err, req, res, next) => {
  console.log("Server error:", err.message);

  res.status(400).json({
    success: false,
    message: err.message
  });
});

// ===============================
// Start Server
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

