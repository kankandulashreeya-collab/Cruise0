import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "./LogoutButton";
import bgImage from "./assets/cruise-bg.jpeg";
import "./App.css";

const backgroundStyle = {
  backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${bgImage})',
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
};

export default function Profile() {
  const { user } = useAuth0();

  return (
    <div style={backgroundStyle}>
      <div className="card-xl">
        <div className="card-header">
          <h2 style={{ marginBottom: 6 }}>
            Welcome aboard, {user?.email}
          </h2>
          <p className="subtle">Your Cruise0 profile</p>
        </div>

        <div className="card-body">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "10px 0", opacity: 0.8 }}>Email</td>
                <td style={{ padding: "10px 0", fontWeight: 600 }}>
                  {user?.email}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px 0", opacity: 0.8 }}>Email verified</td>
                <td style={{ padding: "10px 0", fontWeight: 600 }}>
                  {String(user?.email_verified)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px 0", opacity: 0.8 }}>Country</td>
                <td style={{ padding: "10px 0", fontWeight: 600 }}>
                  {user?.["https://cruise0.app/country"] ?? "—"}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "10px 0", opacity: 0.8 }}>Time zone</td>
                <td style={{ padding: "10px 0", fontWeight: 600 }}>
                  {user?.["https://cruise0.app/timezone"] ?? "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card-footer" style={{ justifyContent: "flex-end" }}>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}