// src/VerifyEmail.js
import React, { useEffect, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const { user, getAccessTokenSilently, logout } = useAuth0();
  const navigate = useNavigate();

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Auto-check timer UI
  const [secondsToNextCheck, setSecondsToNextCheck] = useState(15);
  const [checksRemaining, setChecksRemaining] = useState(8); // 8 * 15s ≈ 2 minutes

  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const countdownRef = useRef(null);
  const tickRef = useRef(null);

  const checkStatus = async () => {
    try {
      setErr("");
      setBusy(true);

      // Get fresh /userinfo (skip cache so we see newly-verified status)
      const token = await getAccessTokenSilently({ cacheMode: "off" });
      const res = await fetch(`https://${domain}/userinfo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("userinfo fetch failed");
      const fresh = await res.json();

      if (fresh.email_verified) {
        setMsg("Verified! Taking you to your profile…");
        clearTimers();
        setTimeout(() => navigate("/profile", { replace: true }), 600);
        return true;
      }
      return false;
    } catch {
      setErr("Could not check verification status. Try again in a moment.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const manualRefresh = async () => {
    setMsg("");
    await checkStatus();
    // Reset the gentle timer after a manual check
    setSecondsToNextCheck(15);
  };

  const resendVerification = async () => {
    setErr("");
    setMsg("");
    try {
      const resp = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email }),
      });
      if (!resp.ok) throw new Error("resend failed");
      setMsg("Verification email sent. Give it a minute and check spam too.");
    } catch {
      setErr("Could not resend right now. Please try again in a moment.");
    }
  };

  const clearTimers = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (tickRef.current) clearTimeout(tickRef.current);
    countdownRef.current = null;
    tickRef.current = null;
  };

  useEffect(() => {
    // Start a gentle auto-check loop:
    // - countdown every 1s
    // - when it hits 0, perform a check
    // - do this up to `checksRemaining` times (≈2 minutes)
    countdownRef.current = setInterval(() => {
      setSecondsToNextCheck((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    const loop = async () => {
      setSecondsToNextCheck(15);
      const verified = await checkStatus();
      if (verified) return; // timers cleared inside checkStatus

      setChecksRemaining((n) => {
        const next = n - 1;
        if (next <= 0) {
          clearTimers(); // stop after budget is exhausted
        } else {
          // schedule next check in ~15s
          tickRef.current = setTimeout(loop, 15000);
        }
        return next;
      });
    };

    // kick off first check in 15s
    tickRef.current = setTimeout(loop, 15000);

    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-background">
      <div className="card-xl">
        <div className="card-header">
          <div className="badge">Action required</div>
          <h2>Verify your email</h2>
          <p className="subtle">We sent a verification link to</p>
          <p className="email">{user?.email}</p>
        </div>

        <div className="card-body">
          <button className="btn-primary w-100" onClick={manualRefresh} disabled={busy}>
            {busy ? "Checking…" : "I’ve verified — refresh status"}
          </button>

          <button className="btn-ghost w-100 mt-8" onClick={resendVerification}>
            Resend verification email
          </button>

          {/* Gentle auto-check status */}
          {checksRemaining > 0 && (
            <p className="tiny mt-12">
              We’ll auto-check again in <strong>{secondsToNextCheck}s</strong>
              {checksRemaining < 8 ? ` · ${checksRemaining} attempt(s) left` : null}
            </p>
          )}

          {msg && <div className="notice success mt-12">{msg}</div>}
          {err && <div className="notice error mt-12">{err}</div>}

          <p className="tiny mt-12">
            Tip: If you don’t see it, search your inbox for “Auth0” or check spam.
          </p>
        </div>

        <div className="card-footer">
          <button
            className="btn-link"
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
