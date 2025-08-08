import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import VerifyEmail from "./VerifyEmail";
import Profile from "./Profile";

import "./App.css";
import cruiseBg from "./assets/cruise-bg.png";

// Home Page
function Home() {
  const { isAuthenticated } = useAuth0();

  return (
    <div
      className="app-background"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(109,213,250,0.65), rgba(41,128,185,0.65)), url(${cruiseBg})`,
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
      }}
    >
      <div className="login-box">
        <h1>
          Welcome to <span className="brand">Cruise0 🛳️</span>
        </h1>
        {!isAuthenticated && <LoginButton />}
        {isAuthenticated && <LogoutButton />}
      </div>
    </div>
  );
}

// Gatekeeper decides where to send authenticated users
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

  return null; // renders nothing
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      {/* Gatekeeper runs on every page to check verification status */}
      <Gatekeeper />
    </BrowserRouter>
  );
}
