import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import VerifyEmail from "./VerifyEmail";
import Profile from "./Profile";

import "./App.css";

/** Shared background style with a translucent overlay */
const backgroundStyle = {
  backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/assets/cruise-bg.jpeg')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
};

/** Home (landing) */
function Home() {
  const { isAuthenticated } = useAuth0();

  return (
    <div style={backgroundStyle}>
      <div className="welcome-card">
        <h1 className="welcome-title">
          Welcome to <span className="brand">Cruise0</span>
        </h1>
        {!isAuthenticated && <LoginButton />}
        {isAuthenticated && <LogoutButton />}
      </div>
    </div>
  );
}

/** Gatekeeper: route verified users to /profile else /verify-email */
function Gatekeeper() {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;

    if (user?.email_verified) {
      navigate("/profile", { replace: true });
    } else {
      navigate("/verify-email", { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Gatekeeper />
    </BrowserRouter>
  );
}
