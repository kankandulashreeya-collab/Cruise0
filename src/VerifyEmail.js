import React, { useEffect, useRef, useCallback, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function VerifyEmail() {
  const {
    isAuthenticated,
    getAccessTokenSilently,
    getIdTokenClaims,
    logout,
  } = useAuth0();

  const navigate = useNavigate();
  const { search } = useLocation();
  const emailFromQuery = new URLSearchParams(search).get("email") || "";

  const [redirecting, setRedirecting] = useState(false);
  const [resendStatus, setResendStatus] = useState(""); // UX message after resend
  const timerRef = useRef(null);
  const startTsRef = useRef(Date.now());

  // ---- CORE CHECK: refresh claims & redirect when verified ----
  const checkOnce = useCallback(async () => {
    try {
      // Ensure we have a fresh token so email_verified isn't stale
      await getAccessTokenSilently({ cacheMode: "off" }).catch(() => {});
      const claims = await getIdTokenClaims({ cacheMode: "off", detailedResponse: true });
      const verified = claims?.email_verified === true;

      if (isAuthenticated && verified) {
        setRedirecting(true); // show spinner
        // small delay so spinner is visible
        setTimeout(() => navigate("/profile", { replace: true }), 400);
        return true;
      }
    } catch {
      // ignore transient errors; next tick or focus event will retry
    }
    return false;
  }, [getAccessTokenSilently, getIdTokenClaims, isAuthenticated, navigate]);

  // ---- Start a light 2s cadence while tab is visible ----
  const startCadence = useCallback(() => {
    // only run interval while visible (avoid background throttling surprises)
    if (document.visibilityState !== "visible") return;

    // run an immediate check when becoming visible/focused
    void checkOnce();

    // clear any existing interval
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(async () => {
      const elapsed = Date.now() - startTsRef.current;
      if (elapsed > 120000) { // stop after ~2 minutes
        clearInterval(timerRef.current);
        timerRef.current = null;
        return;
      }
      const done = await checkOnce();
      if (done) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 2000);
  }, [checkOnce]);

  useEffect(() => {
    // On mount, begin cadence if visible
    startCadence();

    // Foreground events: immediate check + (re)start cadence
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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startCadence]);

  // ---- Resend verification (requires a tiny backend) ----
  // Implement an endpoint that calls Auth0 Management API:
  // POST https://YOUR_DOMAIN/api/v2/jobs/verification-email
  // with a valid MGMT token (do NOT call MGMT API directly from the browser).
  const resendVerification = async () => {
    try {
      setResendStatus("Sending…");
      const res = await fetch("/api/resend-verification", { method: "POST" });
      if (!res.ok) throw new Error();
      setResendStatus("Verification email sent. Please check your inbox.");
    } catch {
      setResendStatus("Sorry—couldn’t resend right now. Please try again shortly.");
    } finally {
      setTimeout(() => setResendStatus(""), 5000);
    }
  };

  return (
    <div className="app-background">
      <div className="login-box">
        <h2>Verify your email</h2>

        <p>
          We’ve sent a verification link to{" "}
          <strong>{emailFromQuery || "your email address"}</strong>. Please click the link to verify.
        </p>
        <p className="subtle">Tip: If you don’t see it, check Spam or Promotions.</p>

        {/* Primary action area */}
        {!redirecting ? (
          <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="secondary-btn" onClick={resendVerification}>
              Resend verification email
            </button>
            <button
              className="ghost-btn"
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            >
              Log out
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div className="spinner" aria-label="Loading" />
            <span>Redirecting to your profile…</span>
          </div>
        )}

        {resendStatus && <p style={{ marginTop: 12 }}>{resendStatus}</p>}
      </div>
    </div>
  );
}
