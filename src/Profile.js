import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "./LogoutButton";
import "./App.css";

export default function Profile() {
  const { user } = useAuth0();

  return (
    <div className="page-bg verify-bg">
      <div className="bg-overlay" />

      <div className="card card-xl" style={{ zIndex: 2, position: "relative", width: "min(680px, 96vw)" }}>
        <div className="card-header">
          <h2 className="h2" style={{ marginBottom: 6 }}>
            Welcome aboard, {user?.email}
          </h2>
          <p className="subtle">Your Cruise0 profile</p>
        </div>

        <div className="table" style={{ width: "100%" }}>
          <div className="row">
            <div className="cell label">Email</div>
            <div className="cell"><strong>{user?.email}</strong></div>
          </div>
          <div className="row">
            <div className="cell label">Email verified</div>
            <div className="cell"><strong>{String(user?.email_verified)}</strong></div>
          </div>
          <div className="row">
            <div className="cell label">Country</div>
            <div className="cell"><strong>{user?.["https://cruise0.app/country"] ?? "—"}</strong></div>
          </div>
          <div className="row">
            <div className="cell label">Time zone</div>
            <div className="cell"><strong>{user?.["https://cruise0.app/timezone"] ?? "—"}</strong></div>
          </div>
        </div>

        <div className="card-actions" style={{ justifyContent: "flex-end", marginTop: 24 }}>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
