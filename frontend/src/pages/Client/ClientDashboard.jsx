
import { useState } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  BriefcaseBusiness,
  FileText,
  Handshake,
  MessageSquare,
  Bell,
  CreditCard,
  UserRound,
  Settings,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
} from "lucide-react";

import "./ClientDashboard.css";

// Dashboard pages
import Overview from "./Overview";
import PostJob from "./PostJob";
import MyJobs from "./MyJobs";
import Proposals from "./Proposals";
import Contracts from "./Contracts";
import Messages from "./Messages";
import Notifications from "./Notifications";
import Payments from "./Payments";
import MyProfile from "./MyProfile";
import SettingsPage from "./Settings";

const navigationItems = [
  {
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    label: "Post a Job",
    icon: PlusCircle,
  },
  {
    label: "My Jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Proposals",
    icon: FileText,
  },
  {
    label: "My Contracts",
    icon: Handshake,
  },
  {
    label: "Messages",
    icon: MessageSquare,
  },
  {
    label: "Notifications",
    icon: Bell,
  },
  {
    label: "Payments & Transactions",
    icon: CreditCard,
  },
  {
    label: "My Profile",
    icon: UserRound,
  },
  {
    label: "Settings",
    icon: Settings,
  },
];

export default function ClientDashboard() {
  const [activePage, setActivePage] = useState("Overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const user = (() => {
    try {
      const savedUser =
        localStorage.getItem("ethioLanceUser") ||
        sessionStorage.getItem("ethioLanceUser");

      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  })();

  const changePage = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("ethioLanceUser");
    localStorage.removeItem("ethioLanceToken");

    sessionStorage.removeItem("ethioLanceUser");
    sessionStorage.removeItem("ethioLanceToken");

    window.location.href = "/";
  };

  const renderPage = () => {
    switch (activePage) {
      case "Overview":
        return <Overview changePage={changePage} />;

      case "Post a Job":
        return <PostJob changePage={changePage} />;

      case "My Jobs":
        return <MyJobs changePage={changePage} />;

      case "Proposals":
        return <Proposals changePage={changePage} />;

      case "My Contracts":
        return <Contracts changePage={changePage} />;

      case "Messages":
        return <Messages changePage={changePage} />;

      case "Notifications":
        return <Notifications changePage={changePage} />;

      case "Payments & Transactions":
        return <Payments changePage={changePage} />;

      case "My Profile":
        return <MyProfile changePage={changePage} />;

      case "Settings":
        return <SettingsPage changePage={changePage} />;

      default:
        return <Overview changePage={changePage} />;
    }
  };

  const firstName =
    user?.firstName ||
    user?.name?.split(" ")[0] ||
    "Client";

  const initials = firstName.charAt(0).toUpperCase();

  return (
    <div
      className={`ethio-client-dashboard ${
        darkMode ? "ethio-client-dark" : ""
      }`}
    >
      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="ethio-client-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`ethio-client-sidebar ${
          mobileMenuOpen ? "mobile-open" : ""
        }`}
      >
       {/* SIDEBAR BRAND */}
<div className="ethio-client-sidebar-brand">

  <div className="ethio-client-sidebar-logo">
    <img src="/ethiolance-emblem.png" alt="EthioLance" />
  </div>

 <div className="ethio-client-brand-name">
  <span className="ethio-text">Ethio</span><span className="lance-text">Lance</span>
</div>

  <button
    className="ethio-client-mobile-close"
    onClick={() => setMobileMenuOpen(false)}
    aria-label="Close menu"
  >
    <X size={20} />
  </button>

  <div className="ethio-client-sidebar-watermark" />

</div>
 {/* NAVIGATION */}
        <nav className="ethio-client-sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.label;

            return (
              <button
                key={item.label}
                type="button"
                className={`ethio-client-nav-item ${
                  isActive ? "active" : ""
                }`}
                onClick={() => changePage(item.label)}
                title={item.label}
              >
                <Icon size={21} strokeWidth={2} />

                <span className="ethio-client-nav-label">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="ethio-client-sidebar-bottom">
          <button
            type="button"
            className="ethio-client-nav-item"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={21} />
            <span className="ethio-client-nav-label">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="ethio-client-main">

        {/* HEADER */}
        <header className="ethio-client-header">

          <div className="ethio-client-header-left">
            <button
              className="ethio-client-menu-button"
              onClick={() =>
                setMobileMenuOpen(!mobileMenuOpen)
              }
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>

         <div className="ethio-client-header-title">
  <h2>
    <span className="ethio-text">Ethio</span><span className="lance-text">Lance</span>
  </h2>
</div>
          </div>

          <div className="ethio-client-header-right">

            {/* SEARCH */}
            <div className="ethio-client-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search..."
                aria-label="Search dashboard"
              />
            </div>

            {/* THEME TOGGLE */}
            <button
              type="button"
              className="ethio-client-header-icon"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle theme"
            >
              {darkMode ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </button>

            {/* NOTIFICATIONS */}
            <button
              type="button"
              className="ethio-client-header-icon"
              onClick={() => changePage("Notifications")}
              title="Notifications"
            >
              <Bell size={20} />
              <span className="ethio-client-notification-dot" />
            </button>

            {/* PROFILE DROPDOWN */}
            <div className="ethio-client-profile-wrapper">
              <button
                type="button"
                className="ethio-client-profile-button"
                onClick={() =>
                  setProfileMenuOpen(!profileMenuOpen)
                }
              >
                <div className="ethio-client-avatar">
                  {initials}
                </div>

                <div className="ethio-client-profile-info">
                  <strong>{firstName}</strong>
                  <span>Client</span>
                </div>

                <ChevronDown size={16} />
              </button>

              {profileMenuOpen && (
                <div className="ethio-client-profile-dropdown">
                  <button
                    type="button"
                    onClick={() => {
                      changePage("My Profile");
                      setProfileMenuOpen(false);
                    }}
                  >
                    <UserRound size={17} />
                    My Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      changePage("Settings");
                      setProfileMenuOpen(false);
                    }}
                  >
                    <Settings size={17} />
                    Settings
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="ethio-client-content">
          {renderPage()}
        </main>

      </div>
    </div>
  );
}
