import { useState } from "react";

function KYCStatusPage() {
  const [applicationId, setApplicationId] = useState("");
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkStatus = async () => {
    if (!applicationId) {
      setError("Please enter Application ID");
      return;
    }

    setLoading(true);
    setError("");
    setStatusData(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/kyc/status/${applicationId}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Application not found");
        return;
      }

      setStatusData(data);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>KYC Application Status</h2>

      <input
        type="number"
        placeholder="Enter Application ID"
        value={applicationId}
        onChange={(e) => setApplicationId(e.target.value)}
      />

      <button onClick={checkStatus}>
        {loading ? "Checking..." : "Check Status"}
      </button>

      {error && <p>{error}</p>}

      {statusData && (
        <div>
          <h3>Application ID: {statusData.applicationId}</h3>

          <p>Name: {statusData.fullName}</p>

          <p>
            Status: 🟡 {statusData.status}
          </p>
        </div>
      )}
    </div>
  );
}

export default KYCStatusPage;