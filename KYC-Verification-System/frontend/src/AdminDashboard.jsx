import { useEffect, useState } from "react";

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // ==========================================
  // Fetch All KYC Applications
  // ==========================================

  const fetchApplications = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/kyc"
      );

      const data = await response.json();

      if (data.success) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // ==========================================
  // Approve / Reject Application
  // ==========================================

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/kyc/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update status");
        return;
      }

      if (data.success) {
        alert(data.message);
        fetchApplications();

        // Update selected application if open
        if (
          selectedApplication &&
          selectedApplication.id === id
        ) {
          setSelectedApplication({
            ...selectedApplication,
            verification_status: status,
          });
        }
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert("Connection error");
    }
  };

  // ==========================================
  // Status Class
  // ==========================================

  const getStatusClass = (status) => {
    if (status === "Approved") {
      return "status approved";
    }

    if (status === "Rejected") {
      return "status rejected";
    }

    return "status pending";
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <h2>Loading applications...</h2>
          <p>Please wait</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // Statistics
  // ==========================================

  const totalApplications = applications.length;

  const approvedApplications = applications.filter(
    (application) =>
      application.verification_status === "Approved"
  ).length;

  const pendingApplications = applications.filter(
    (application) =>
      application.verification_status === "Pending"
  ).length;

  const rejectedApplications = applications.filter(
    (application) =>
      application.verification_status === "Rejected"
  ).length;

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="admin-page">

      {/* ======================================
          Header
      ====================================== */}

      <div className="admin-header">
        <div>
          <h1>KYC Admin Dashboard</h1>

          <p>
            Manage and review KYC verification applications
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchApplications}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ======================================
          Statistics Cards
      ====================================== */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">📋</div>

          <div>
            <span>Total Applications</span>
            <h2>{totalApplications}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>

          <div>
            <span>Pending</span>
            <h2>{pendingApplications}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>

          <div>
            <span>Approved</span>
            <h2>{approvedApplications}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✕</div>

          <div>
            <span>Rejected</span>
            <h2>{rejectedApplications}</h2>
          </div>
        </div>

      </div>

      {/* ======================================
          Applications Table
      ====================================== */}

      <div className="applications-card">

        <div className="section-header">
          <div>
            <h2>KYC Applications</h2>
            <p>
              Review applicant information and verification status
            </p>
          </div>
        </div>

        <div className="table-container">

          <table className="applications-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Applicant</th>
                <th>DOB</th>
                <th>Gender</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Document</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {applications.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="empty-state"
                  >
                    No KYC applications found.
                  </td>
                </tr>
              ) : (

                applications.map((application) => (

                  <tr key={application.id}>

                    {/* ID */}
                    <td>
                      <span className="application-id">
                        #{application.id}
                      </span>
                    </td>

                    {/* Name */}
                    <td>
                      <strong>
                        {application.full_name}
                      </strong>
                    </td>

                    {/* DOB */}
                    <td>
                      {application.dob
                        ? new Date(
                            application.dob
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* Gender */}
                    <td>
                      {application.gender}
                    </td>

                    {/* Mobile */}
                    <td>
                      {application.mobile}
                    </td>

                    {/* Email */}
                    <td>
                      {application.email}
                    </td>

                    {/* Document */}
                    <td>
                      <span className="document-badge">
                        {application.document_type}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={getStatusClass(
                          application.verification_status
                        )}
                      >
                        {application.verification_status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>

                      <div className="action-buttons">

                        {/* View */}
                        <button
                          className="view-btn"
                          onClick={() =>
                            setSelectedApplication(
                              application
                            )
                          }
                        >
                          View
                        </button>

                        {/* Approve */}
                        <button
                          className="approve-btn"
                          onClick={() =>
                            updateStatus(
                              application.id,
                              "Approved"
                            )
                          }
                          disabled={
                            application.verification_status ===
                            "Approved"
                          }
                        >
                          Approve
                        </button>

                        {/* Reject */}
                        <button
                          className="reject-btn"
                          onClick={() =>
                            updateStatus(
                              application.id,
                              "Rejected"
                            )
                          }
                          disabled={
                            application.verification_status ===
                            "Rejected"
                          }
                        >
                          Reject
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ======================================
          Application Details Modal
      ====================================== */}

      {selectedApplication && (

        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedApplication(null)
          }
        >

          <div
            className="details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h2>Application Details</h2>

                <p>
                  Application #
                  {selectedApplication.id}
                </p>
              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setSelectedApplication(null)
                }
              >
                ×
              </button>

            </div>

            {/* Details */}

            <div className="details-grid">

              <div className="detail-item">
                <span>Full Name</span>
                <strong>
                  {selectedApplication.full_name}
                </strong>
              </div>

              <div className="detail-item">
                <span>Date of Birth</span>
                <strong>
                  {selectedApplication.dob
                    ? new Date(
                        selectedApplication.dob
                      ).toLocaleDateString()
                    : "-"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Gender</span>
                <strong>
                  {selectedApplication.gender}
                </strong>
              </div>

              <div className="detail-item">
                <span>Mobile</span>
                <strong>
                  {selectedApplication.mobile}
                </strong>
              </div>

              <div className="detail-item">
                <span>Email</span>
                <strong>
                  {selectedApplication.email}
                </strong>
              </div>

              <div className="detail-item">
                <span>Document Type</span>
                <strong>
                  {selectedApplication.document_type}
                </strong>
              </div>

              <div className="detail-item full-width">
                <span>Address</span>
                <strong>
                  {selectedApplication.address}
                </strong>
              </div>

              <div className="detail-item">
                <span>Document Number</span>
                <strong>
                  {selectedApplication.document_number ||
                    "Not provided"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Verification Status</span>

                <span
                  className={getStatusClass(
                    selectedApplication.verification_status
                  )}
                >
                  {selectedApplication.verification_status}
                </span>
              </div>

            </div>

            {/* Uploaded Document */}

            {selectedApplication.document_path && (

              <div className="document-section">

                <h3>Identity Document</h3>

                <a
                  href={`http://localhost:5000${selectedApplication.document_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="document-link"
                >
                  📄 View Uploaded Document
                </a>

              </div>

            )}

            {/* Modal Actions */}

            <div className="modal-actions">

              <button
                className="approve-btn large"
                onClick={() =>
                  updateStatus(
                    selectedApplication.id,
                    "Approved"
                  )
                }
                disabled={
                  selectedApplication.verification_status ===
                  "Approved"
                }
              >
                ✓ Approve Application
              </button>

              <button
                className="reject-btn large"
                onClick={() =>
                  updateStatus(
                    selectedApplication.id,
                    "Rejected"
                  )
                }
                disabled={
                  selectedApplication.verification_status ===
                  "Rejected"
                }
              >
                ✕ Reject Application
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminDashboard;