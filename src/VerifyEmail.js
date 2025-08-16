// src/VerifyEmail.js
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useLocation } from "react-router-dom";

const POST_LOGIN_HINT_KEY = "app:lastAuthIntent"; // used to restore flow after logout/login
const HINT_VERIFY = "/verify-email";
const HINT_PROFILE = "/profile";

export default function VerifyEmail() {
  const {
    isAuthenticated,
    user,
    getAccessTokenSilently,
    getIdTokenClaims,
    logout,
    loginWithRedirect,
  } = useAuth0();

  const navigate = useNavigate();
  const { search } = useLocation();

  // Prefer email from Post-Login Action (?email=...), then user.email, then placeholder
  const queryEmail = new URLSearchParams(search).get("email");
  const shownEmail = queryEmail || user?.email || "your email address";

  // UI state
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  // Polling refs
  const intervalRef = useRef(null);
  const startTsRef = useRef(Date.now());

  // --- Helpers to persist/restore auth intent across refreshes/logouts ---
  const setIntent = (path) => {
    try { localStorage.setItem(POST_LOGIN_HINT_KEY, path); } catch {}
  };
  const clearIntent = () => {
    try { localStorage.removeItem(POST_LOGIN_HINT_KEY); } catch {}
  };

  // Force-fresh claims so email_verified isn't stale
  const checkOnce = useCallback(async () => {
    try {
      await getAccessTokenSilently({ cacheMode: "off" }).catch(() => {});
      const idt = await getIdTokenClaims({
        cacheMode: "off",
        detailedResponse: true,
      });
      const claims = idt?.claims || idt; // handle both shapes
      const verified = claims?.email_verified === true;

      // If logged in and verified, go to Profile
      if (isAuthenticated && verified) {
        setRedirecting(true);
        setIntent(HINT_PROFILE); // future logins should land on profile
        setTimeout(() => navigate(HINT_PROFILE, { replace: true }), 400);
        return true;
      }
    } catch {
      // swallow transient errors; we'll retry on next cadence/focus
    }
    return false;
  }, [getAccessTokenSilently, getIdTokenClaims, isAuthenticated, navigate]);

  // Start a 2s cadence ONLY while tab is visible; stop after ~2 minutes
  const startCadence = useCallback(() => {
    if (document.visibilityState !== "visible") return;

    // Immediate check on (re)focus/visibility
    void checkOnce();

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(async () => {
      const elapsed = Date.now() - startTsRef.current;
      if (elapsed > 120000) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        return;
      }
      const done = await checkOnce();
      if (done) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 2000);
  }, [checkOnce]);

  // Mount: mark intent as “verify-email”, kick off cadence, and bind foreground events
  useEffect(() => {
    setIntent(HINT_VERIFY);              // Scenario 5: remember we needed verification
    startTsRef.current = Date.now();
    startCadence();

    const onVis = () => startCadence();
    const onFocus = () => startCadence();
    const onPageShow = () => startCadence();

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startCadence]);

  // Extra guard: if user already verified (e.g., Scenario 3 after refresh or Scenario 4 after login)
  useEffect(() => {
    // When component mounts authenticated, do an immediate fresh check
    if (isAuthenticated) void checkOnce();
  }, [isAuthenticated, checkOnce]);

  // Resend verification via your serverless endpoint calling Auth0 Management API
  const resend = async () => {
    try {
      setMsg("");
      setSending(true);
      const r = await fetch("/api/resend-verification", { method: "POST" });
      if (!r.ok) throw new Error("Failed to resend");
      setMsg("Verification email sent. Please check your inbox.");
    } catch {
      setMsg("Could not resend email. Please try again in a minute.");
    } finally {
      setSending(false);
      // Auto-clear message after 5s (keeps UI tidy)
      setTimeout(() => setMsg(""), 5000);
    }
  };

  // Logout: keep the “verify-email” intent so next login returns here (Scenario 5)
  const handleLogout = () => {
    setIntent(HINT_VERIFY);
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  // Optional: helper for users who clicked the link and came back not signed in yet
  const handleAlreadyVerifiedLogin = async () => {
    // Ask Auth0 to bring the user back to either profile (if verified) or verify page
    const returnTo = localStorage.getItem(POST_LOGIN_HINT_KEY) || HINT_PROFILE;
    await loginWithRedirect({ appState: { returnTo } });
  };

  return (
    <div className="page-bg verify-bg" role="main" aria-labelledby="verify-title">
      <div className="bg-overlay" />

      <div className="card card-xl" style={{ zIndex: 2, position: "relative" }}>
        <div className="card-header">
          <span className="badge">Email verification required</span>
          <h2 id="verify-title" className="h2">Verify your email</h2>
          <p className="lead">
            We&apos;ve sent a verification link to{" "}
            <span className="email">{shownEmail}</span>. Please click the link to verify.
          </p>
          <p className="subtle">
            Tip: If you don&apos;t see it, check <strong>Spam</strong> or <strong>Promotions</strong>.
          </p>
        </div>

        {msg && (
          <div className="notice success" role="status" aria-live="polite" style={{ marginBottom: 8 }}>
            {msg}
          </div>
        )}

        <div className="card-actions">
          <button
            className="btn-primary"
            onClick={resend}
            disabled={sending}
            aria-busy={sending ? "true" : "false"}
          >
            {sending ? "Sending…" : "Resend verification email"}
          </button>

          <button className="btn-link" onClick={handleLogout}>
            Log out
          </button>
        </div>

        {/* Help users who arrive here logged out after verifying */}
        {!isAuthenticated && (
          <div className="card-actions" style={{ marginTop: 16 }}>
            <button className="btn-ghost" onClick={handleAlreadyVerifiedLogin}>
              I already verified — log me in
            </button>
          </div>
        )}

        {redirecting && (
          <div className="overlay" aria-live="polite">
            <div className="spinner" aria-label="Loading" />
            <div className="progress-text">Redirecting to your profile…</div>
          </div>
        )}
      </div>
    </div>
  );
}
