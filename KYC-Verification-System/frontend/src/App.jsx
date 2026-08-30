import { useState } from "react";
import KYCForm from "./KYCForm";
import KYCStatusPage from "./KYCStatusPage";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  return (
    <div>
      {/* ===============================
          User KYC Section
          =============================== */}

      <KYCForm />

      <hr />

      {/* ===============================
          KYC Status Section
          =============================== */}

      <KYCStatusPage />

      <hr />

      {/* ===============================
          Admin Section
          =============================== */}

      {!isAdminLoggedIn ? (
        <AdminLogin
          onLogin={() => setIsAdminLoggedIn(true)}
        />
      ) : (
        <div>
          <AdminDashboard />

          <br />

          <button
            onClick={() => setIsAdminLoggedIn(false)}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;