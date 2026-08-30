import { useState } from "react";

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      // First read response as TEXT
      const text = await response.text();

      console.log("Status:", response.status);
      console.log("Response:", text);

      // Check HTML response
      if (text.trim().startsWith("<")) {
        alert(
          "Backend HTML return kar raha hai.\n\n" +
          "Status: " +
          response.status +
          "\n\n" +
          "Response:\n" +
          text.substring(0, 300)
        );
        return;
      }

      // Convert JSON
      let data;

      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error("JSON parse error:", error);
        alert("Backend returned invalid JSON");
        return;
      }

      console.log("Login response:", data);

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      if (data.success) {
        alert("Admin login successful");
        onLogin();
      }
    } catch (error) {
      console.error("Admin login error:", error);

      alert("Connection error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Admin Login</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label>Admin Email</label>
          <br />

          <input
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Password</label>
          <br />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <br />

      <small>
        Demo Admin: admin@kyc.com / admin123
      </small>
    </div>
  );
}

export default AdminLogin;