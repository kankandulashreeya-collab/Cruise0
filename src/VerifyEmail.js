import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
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

export default function VerifyEmail() {
  const { user, logout } = useAuth0();
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  // Optional: call your /api/resend-verification serverless endpoint
  const resend = async () => {
    try {
      setMsg("");
      setSending(true);
      const r = await fetch("/api/resend-verification", { method: "POST" });
      if (!r.ok) throw new Error("Failed to resend");
      setMsg("Verification email sent. Please check your inbox.");
    } catch (e) {
      setMsg("Could not resend email. Please try again in a minute.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={backgroundStyle}>
      <div className="card-xl">
        <div className="card-header">
          <span className="badge">Action required</span>
          <h2>Verify your email</h2>
          <p className="subtle">
            We’ve sent a verification link to{" "}
            <span className="email">{user?.email}</span>. Please click the link
            to verify your account.
          </p>
          <p className="tiny mt-8">
            Tip: If you don’t see it, check <strong>Spam</strong> or{" "}
            <strong>Promotions</strong>, or try the button below to resend.
          </p>
        </div>

        <div className="card-body">
          {msg && <div className="notice success">{msg}</div>}
        </div>

        <div className="card-footer" style={{ gap: 12 }}>
          <button
            className="btn-primary"
            onClick={resend}
            disabled={sending}
            aria-busy={sending}
          >
            {sending ? "Sending…" : "Resend verification email"}
          </button>

          <button
            className="btn-link"
            onClick={() =>
              logout({ returnTo: window.location.origin + "/" })
            }
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}