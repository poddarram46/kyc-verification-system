import { useState, useEffect } from "react";
import * as faceapi from "@vladmandic/face-api";

function KYCForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    mobile: "",
    email: "",
    address: "",
    documentType: "",
    documentNumber: "",
  });

  const [document, setDocument] = useState(null);
  const [selfie, setSelfie] = useState(null);

  const [selfieDescriptor, setSelfieDescriptor] = useState(null);
  const [faceMatchResult, setFaceMatchResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // ==========================================
  // Load Face Recognition Models
  // ==========================================

  useEffect(() => {
    const loadFaceModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");

        setModelsLoaded(true);

        console.log(
          "Face recognition models loaded successfully."
        );
      } catch (error) {
        console.error(
          "Face model loading error:",
          error
        );
      }
    };

    loadFaceModels();
  }, []);

  // ==========================================
  // Handle Input Change
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================
  // Identity Document Validation
  // ==========================================

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Document size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Only JPG, JPEG, PNG and PDF files are allowed."
      );

      e.target.value = "";
      return;
    }

    setDocument(file);

    // Reset previous matching result
    setFaceMatchResult(null);
  };

  // ==========================================
  // Selfie Validation + Face Descriptor
  // ==========================================

  const handleSelfieChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!modelsLoaded) {
      alert(
        "Face recognition models are still loading. Please wait a moment and try again."
      );

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Selfie size must be less than 5MB.");

      e.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Selfie must be JPG, JPEG or PNG.");

      e.target.value = "";
      return;
    }

    try {
      // Convert selfie into image
      const image = await faceapi.bufferToImage(file);

      // Detect face + landmarks + descriptor
      const detection =
        await faceapi
          .detectSingleFace(
            image,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

      // No face detected
      if (!detection) {
        alert(
          "No face detected. Please upload a clear selfie showing your face."
        );

        e.target.value = "";
        setSelfie(null);
        setSelfieDescriptor(null);

        return;
      }

      // Save descriptor
      setSelfieDescriptor(
        detection.descriptor
      );

      setSelfie(file);

      console.log(
        "Selfie face descriptor generated successfully."
      );

      alert(
        "Face detected successfully. Selfie accepted."
      );

    } catch (error) {
      console.error(
        "Face detection error:",
        error
      );

      alert(
        "Unable to verify the selfie. Please try another clear image."
      );

      e.target.value = "";
      setSelfie(null);
      setSelfieDescriptor(null);
    }
  };

  // ==========================================
  // Compare Document Face With Selfie
  // ==========================================

  const compareFaces = async () => {
    if (!document) {
      alert(
        "Please upload your identity document."
      );
      return false;
    }

    if (!selfieDescriptor) {
      alert(
        "Please upload your selfie first."
      );
      return false;
    }

    // PDF face matching not supported in browser here
    if (document.type === "application/pdf") {
      alert(
        "PDF document uploaded. Face matching is available for JPG/PNG documents."
      );

      return true;
    }

    try {
      // Convert document into image
      const documentImage =
        await faceapi.bufferToImage(
          document
        );

      // Detect face from document
      const documentDetection =
        await faceapi
          .detectSingleFace(
            documentImage,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

      // No face in document
      if (!documentDetection) {
        alert(
          "No face detected in the identity document."
        );

        setFaceMatchResult("failed");

        return false;
      }

      // Compare selfie and document
      const distance =
        faceapi.euclideanDistance(
          selfieDescriptor,
          documentDetection.descriptor
        );

      console.log(
        "Face distance:",
        distance
      );

      // Threshold
      const MATCH_THRESHOLD = 0.6;

      if (distance <= MATCH_THRESHOLD) {
        setFaceMatchResult("matched");

        alert(
          "Face matched successfully with the identity document."
        );

        return true;
      }

      setFaceMatchResult("not-matched");

      alert(
        "Face does not match the identity document."
      );

      return false;

    } catch (error) {
      console.error(
        "Face matching error:",
        error
      );

      setFaceMatchResult("failed");

      alert(
        "Unable to compare faces. Please try again."
      );

      return false;
    }
  };

  // ==========================================
  // Submit KYC
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!document) {
      alert(
        "Please upload your identity document."
      );
      return;
    }

    if (!selfie) {
      alert(
        "Please upload your selfie for face verification."
      );
      return;
    }

    if (!selfieDescriptor) {
      alert(
        "Face verification is not complete."
      );
      return;
    }

    setLoading(true);

    try {
      // ==========================================
      // STEP 0: Face Matching
      // ==========================================

      const matched = await compareFaces();

      if (!matched) {
        setLoading(false);
        return;
      }

      // ==========================================
      // STEP 1: Save KYC Details
      // ==========================================

      const kycResponse = await fetch(
        "http://localhost:5000/api/kyc",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const kycResult =
        await kycResponse.json();

      if (
        !kycResponse.ok ||
        !kycResult.success
      ) {
        alert(
          kycResult.message ||
            "Failed to save KYC details."
        );

        return;
      }

      console.log(
        "KYC saved:",
        kycResult
      );

      const applicationId =
        kycResult.id;

      // ==========================================
      // STEP 2: Upload Identity Document
      // ==========================================

      const documentData =
        new FormData();

      documentData.append(
        "document",
        document
      );

      documentData.append(
        "userId",
        applicationId
      );

      const uploadResponse =
        await fetch(
          "http://localhost:5000/api/upload-document",
          {
            method: "POST",
            body: documentData,
          }
        );

      const uploadResult =
        await uploadResponse.json();

      if (
        !uploadResponse.ok ||
        !uploadResult.success
      ) {
        alert(
          "KYC saved, but identity document upload failed."
        );

        console.error(
          "Document upload error:",
          uploadResult
        );

        return;
      }

      console.log(
        "Identity document uploaded:",
        uploadResult
      );

      // ==========================================
      // STEP 3: Upload Selfie
      // ==========================================

      const selfieData =
        new FormData();

      selfieData.append(
        "selfie",
        selfie
      );

      selfieData.append(
        "userId",
        applicationId
      );

      const selfieResponse =
        await fetch(
          "http://localhost:5000/api/upload-selfie",
          {
            method: "POST",
            body: selfieData,
          }
        );

      const selfieResult =
        await selfieResponse.json();

      if (
        !selfieResponse.ok ||
        !selfieResult.success
      ) {
        alert(
          "KYC and document saved, but selfie upload failed."
        );

        console.error(
          "Selfie upload error:",
          selfieResult
        );

        return;
      }

      console.log(
        "Selfie uploaded:",
        selfieResult
      );

      // ==========================================
      // SUCCESS
      // ==========================================

      alert(
        `KYC submitted successfully!\nApplication ID: ${applicationId}\nFace Match: Successful\nStatus: Pending`
      );

      // Reset form
      setFormData({
        fullName: "",
        dob: "",
        gender: "",
        mobile: "",
        email: "",
        address: "",
        documentType: "",
        documentNumber: "",
      });

      setDocument(null);
      setSelfie(null);
      setSelfieDescriptor(null);
      setFaceMatchResult(null);

      e.target.reset();

    } catch (error) {
      console.error(
        "KYC submission error:",
        error
      );

      alert(
        "Connection error. Please make sure the backend server is running."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="kyc-form">

      <h1>KYC Verification</h1>

      <p>
        Please enter your details for identity verification.
      </p>

      <form onSubmit={handleSubmit}>

        {/* Full Name */}
        <div className="form-group">
          <label>Full Name</label>

          <input
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        {/* Date of Birth */}
        <div className="form-group">
          <label>Date of Birth</label>

          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />
        </div>

        {/* Gender */}
        <div className="form-group">
          <label>Gender</label>

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Gender
            </option>

            <option value="Male">
              Male
            </option>

            <option value="Female">
              Female
            </option>

            <option value="Other">
              Other
            </option>
          </select>
        </div>

        {/* Mobile */}
        <div className="form-group">
          <label>Mobile Number</label>

          <input
            type="tel"
            name="mobile"
            placeholder="Enter mobile number"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Address */}
        <div className="form-group">
          <label>Address</label>

          <textarea
            name="address"
            placeholder="Enter your address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        {/* Document Type */}
        <div className="form-group">
          <label>Document Type</label>

          <select
            name="documentType"
            value={formData.documentType}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Document
            </option>

            <option value="Aadhaar">
              Aadhaar Card
            </option>

            <option value="PAN">
              PAN Card
            </option>

            <option value="Passport">
              Passport
            </option>

            <option value="Driving License">
              Driving License
            </option>
          </select>
        </div>

        {/* Document Number */}
        <div className="form-group">
          <label>Document Number</label>

          <input
            type="text"
            name="documentNumber"
            placeholder="Enter document number"
            value={formData.documentNumber}
            onChange={handleChange}
            required
          />
        </div>

        {/* Identity Document */}
        <div className="form-group">
          <label>
            Upload Identity Document
          </label>

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            required
          />

          <small>
            Allowed: JPG, JPEG, PNG, PDF | Max size: 5MB
          </small>
        </div>

        {/* Selfie */}
        <div className="form-group">
          <label>
            Upload Selfie for Face Verification
          </label>

          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            capture="user"
            onChange={handleSelfieChange}
            required
          />

          <small>
            Face recognition enabled | JPG, JPEG, PNG | Max size: 5MB
          </small>
        </div>

        {/* Face Match Status */}
        {faceMatchResult === "matched" && (
          <p>
            ✅ Face matched successfully
          </p>
        )}

        {faceMatchResult === "not-matched" && (
          <p>
            ❌ Face does not match
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading
            ? "Verifying..."
            : "Continue Verification →"}
        </button>

      </form>

    </div>
  );
}

export default KYCForm;