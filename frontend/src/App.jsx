import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/Login.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

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

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/freelancer-dashboard"
        element={<DashboardPage role="FREELANCER" />}
      />

      <Route
        path="/client-dashboard"
        element={<DashboardPage role="CLIENT" />}
      />
    </Routes>
  );
}

export default App;