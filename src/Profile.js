// src/Profile.js
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "./LogoutButton";

export default function Profile() {
  const { user } = useAuth0();

  /**
   * Where we read country/timezone from:
   * 1) Primary source: namespaced custom claims we set in the Post-Login Action:
   *      api.idToken.setCustomClaim('https://cruise0.app/country', country)
   *      api.idToken.setCustomClaim('https://cruise0.app/timezone', timezone)
   * 2) Fallback: app_metadata (also written in the Action) so you can see it in Dashboard.
   */
  const country =
    user?.["https://cruise0.app/country"] ||
    user?.app_metadata?.country;

  const timezone =
    user?.["https://cruise0.app/timezone"] ||
    user?.app_metadata?.timezone;

  /**
   * Small helper styles for key–value rows, so you don’t need extra CSS.
   * (If you prefer CSS, you can move these into .kv in App.css later.)
   */
  const row = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  };
  const keyStyle = { opacity: 0.75 };
  const valStyle = { fontWeight: 700 };

  return (
    <div className="app-background">
      <div className="card-xl">
        {/* Header */}
        <div className="card-header">
          <h2>Welcome aboard, {user?.name || "traveler"} 👋</h2>
          <p className="subtle">Your Cruise0 profile</p>
        </div>

        {/* Body */}
        <div className="card-body">
          {/* Email */}
          <div style={row}>
            <span style={keyStyle}>Email</span>
            <strong style={valStyle}>{user?.email}</strong>
          </div>

          {/* Email verified */}
          <div style={row}>
            <span style={keyStyle}>Email verified</span>
            <strong style={valStyle}>{String(user?.email_verified)}</strong>
          </div>

          {/* Country (from namespaced claim or app_metadata) */}
          {country && (
            <div style={row}>
              <span style={keyStyle}>Country</span>
              <strong style={valStyle}>{country}</strong>
            </div>
          )}

          {/* Time zone (optional, if Action set it) */}
          {timezone && (
            <div style={row}>
              <span style={keyStyle}>Time zone</span>
              <strong style={valStyle}>{timezone}</strong>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="card-footer">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
