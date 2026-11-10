
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/Login.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

import CreateProfile from "./pages/freelancer/CreateProfile.jsx";
import CreateClientProfile from "./pages/Client/CreateClientProfile.jsx";

import SettingsPage from "./pages/sections/Settings.jsx";
import ClientDashboard from "./pages/Client/ClientDashboard.jsx";

import "./App.css";

function HomeLayout({
  onLoginClick,
  onRegisterClick,
  isLoginOpen,
  isRegisterOpen,
  onCloseLogin,
  onCloseRegister,
}) {
  return (
    <>
      <Navbar
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
      />

      <main>
        <HomePage
          onRegisterClick={onRegisterClick}
          onLoginClick={onLoginClick}
        />
      </main>

      {isLoginOpen && (
        <LoginPage onClose={onCloseLogin} />
      )}

      {isRegisterOpen && (
        <RegisterPage
          onClose={onCloseRegister}
          onLoginClick={onLoginClick}
        />
      )}
    </>
  );
}

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const closeLogin = () => {
    setIsLoginOpen(false);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const closeRegister = () => {
    setIsRegisterOpen(false);
  };

  return (
    <Routes>
      {/* Homepage */}
      <Route
        path="/"
        element={
          <HomeLayout
            onLoginClick={openLogin}
            onRegisterClick={openRegister}
            isLoginOpen={isLoginOpen}
            isRegisterOpen={isRegisterOpen}
            onCloseLogin={closeLogin}
            onCloseRegister={closeRegister}
          />
        }
      />

      {/* Freelancer profile creation */}
      <Route
        path="/freelancer/create-profile"
        element={<CreateProfile />}
      />

      {/* Client profile creation */}
      <Route
        path="/client/create-profile"
        element={<CreateClientProfile />}
      />

      {/* Authentication */}
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      {/* Freelancer dashboard */}
      <Route
        path="/freelancer-dashboard"
        element={<DashboardPage role="FREELANCER" />}
      />

      {/* Client dashboard */}
      <Route
        path="/client-dashboard"
        element={<ClientDashboard />}
      />

      {/* Settings */}
      <Route
        path="/settings"
        element={<SettingsPage />}
      />
    </Routes>
  );
}

export default App;
