
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BriefcaseBusiness,
  Bell,
  ChevronDown,
  FileText,
  History,
  Home,
  Images,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Settings as SettingsIcon,
  Sun,
  UserRound,
  Wallet,
  X,
} from "lucide-react";

import Dashboard from "./sections/Dashboard";
import BrowseJobs from "./sections/BrowseJobs";
import MyProposals from "./sections/MyProposals";
import MyContracts from "./sections/MyContracts";
import Messages from "./sections/Messages";
import Notifications from "./sections/Notifications";
import Earnings from "./sections/Earnings";
import TransactionHistory from "./sections/TransactionHistory";
import MyProfile from "./sections/MyProfile";
import Portfolio from "./sections/Portfolio";
import SettingsPage from "./sections/Settings";

import "./DashboardPage.css";

// =========================================
// GET AUTHENTICATED USER
// =========================================

function getSavedUser() {
  try {
    const savedUser =
      localStorage.getItem("ethioLanceUser") ||
      sessionStorage.getItem("ethioLanceUser");

    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error("Error loading user:", error);
    return null;
  }
}

// =========================================
// FREELANCER DASHBOARD
// =========================================

function DashboardPage({ role = "FREELANCER" }) {
  const navigate = useNavigate();

  const profileMenuRef = useRef(null);

  // USER
  const [user, setUser] = useState(null);

  // THEME
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("ethioLanceTheme") === "dark";
  });

  // SIDEBAR
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // SEARCH
  const [searchTerm, setSearchTerm] = useState("");

  // ACTIVE SECTION
  const [activeSection, setActiveSection] = useState("Dashboard");

  // EXPANDABLE SIDEBAR MENUS
  const [expandedMenu, setExpandedMenu] = useState({
    financial: false,
    profile: false,
  });

  // PROFILE DROPDOWN
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // =========================================
  // AUTHENTICATION
  // =========================================

  useEffect(() => {
    const savedUser = getSavedUser();

    if (!savedUser || savedUser.role !== role) {
      navigate("/", { replace: true });
      return;
    }

    setUser(savedUser);
  }, [navigate, role]);

  // =========================================
  // SAVE THEME
  // =========================================

  useEffect(() => {
    localStorage.setItem(
      "ethioLanceTheme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // =========================================
  // CLOSE PROFILE DROPDOWN ON OUTSIDE CLICK
  // =========================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // =========================================
  // NAVIGATION GROUPS
  // =========================================

  const navigationGroups = [
    {
      title: "WORKSPACE",
      items: [
        { label: "Dashboard", icon: Home },
        { label: "Browse Jobs", icon: Search },
        { label: "My Proposals", icon: FileText },
        { label: "My Contracts", icon: BriefcaseBusiness },
        { label: "Messages", icon: MessageSquare, count: 3 },
        { label: "Notifications", icon: Bell, count: 3 },
      ],
    },
    {
      title: "FINANCIAL",
      items: [
        {
          label: "Earnings & Payments",
          icon: Wallet,
          id: "financial",
          children: [
            {
              label: "Transaction History",
              icon: History,
            },
          ],
        },
      ],
    },
    {
      title: "MY ACCOUNT",
      items: [
        {
          label: "My Profile",
          icon: UserRound,
          id: "profile",
          children: [
            {
              label: "Portfolio",
              icon: Images,
            },
          ],
        },
        {
          label: "Settings",
          icon: SettingsIcon,
        },
      ],
    },
  ];

  // =========================================
  // NAVIGATION HANDLER
  // =========================================

  const handleNavigation = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
    setProfileMenuOpen(false);
  };

  // =========================================
  // PROFILE NAVIGATION
  // =========================================

  const handleProfileNavigation = (section) => {
    setActiveSection(section);
    setProfileMenuOpen(false);
    setSidebarOpen(false);
  };

  // =========================================
  // SUBMENU TOGGLE
  // =========================================

  const toggleSubmenu = (menuId) => {
    setExpandedMenu((previous) => ({
      ...previous,
      [menuId]: !previous[menuId],
    }));
  };

  // =========================================
  // ACTIVE NAVIGATION CHECK
  // =========================================

  const isGroupActive = (item) => {
    return (
      activeSection === item.label ||
      item.children?.some(
        (child) => child.label === activeSection
      )
    );
  };

  // =========================================
  // THEME SWITCH
  // =========================================

  const toggleTheme = () => {
    setDarkMode((previous) => !previous);
  };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem("ethioLanceToken");
    localStorage.removeItem("ethioLanceUser");

    sessionStorage.removeItem("ethioLanceToken");
    sessionStorage.removeItem("ethioLanceUser");

    setProfileMenuOpen(false);

    navigate("/", { replace: true });
  };

  // =========================================
  // RENDER ACTIVE SECTION
  // =========================================

  const renderActiveSection = () => {
    switch (activeSection) {
      case "Dashboard":
        return (
          <Dashboard
            displayName={displayName}
            searchTerm={searchTerm}
            onNavigate={handleNavigation}
          />
        );

      case "Browse Jobs":
        return <BrowseJobs />;

      case "My Proposals":
        return <MyProposals />;

      case "My Contracts":
        return <MyContracts />;

      case "Messages":
        return <Messages />;

      case "Notifications":
        return <Notifications />;

      case "Earnings & Payments":
        return <Earnings />;

      case "Transaction History":
        return <TransactionHistory />;

      case "My Profile":
        return <MyProfile />;

      case "Portfolio":
        return <Portfolio />;

      case "Settings":
        return <SettingsPage />;

      default:
        return (
          <Dashboard
            displayName={displayName}
            searchTerm={searchTerm}
            onNavigate={handleNavigation}
          />
        );
    }
  };

  // =========================================
  // AUTHENTICATION LOADING
  // =========================================

  if (!user || user.role !== role) {
    return null;
  }

  const displayName =
    user.firstName ||
    user.name?.split(" ")[0] ||
    "there";

  const userInitial = displayName.charAt(0).toUpperCase();

  // =========================================
  // PAGE
  // =========================================

  return (
    <div
      className={`freelancer-dashboard ${
        darkMode ? "freelancer-dark-mode" : ""
      }`}
    >
      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside
        className={`freelancer-sidebar ${
          sidebarOpen ? "freelancer-sidebar-open" : ""
        }`}
      >
        {/* SIDEBAR BRAND */}

        <div className="freelancer-sidebar-brand">
          <img
            src="/ethiolance-emblem.png"
            alt="EthioLance"
          />

          <span>
            Ethio<span>Lance</span>
          </span>

          <button
            type="button"
            className="freelancer-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={21} />
          </button>
        </div>

        {/* SIDEBAR NAVIGATION */}

        <nav className="freelancer-sidebar-nav">
          {navigationGroups.map((group) => (
            <div
              className="freelancer-nav-group"
              key={group.title}
            >
              <span className="freelancer-nav-group-title">
                {group.title}
              </span>

              {group.items.map((item) => {
                const Icon = item.icon;

                const isExpanded = item.id
                  ? expandedMenu[item.id]
                  : false;

                const isActive = isGroupActive(item);

                return (
                  <div
                    className="freelancer-nav-parent"
                    key={item.label}
                  >
                    {/* PARENT ITEM */}

                    <button
                      type="button"
                      title={item.label}
                      aria-expanded={
                        item.children ? isExpanded : undefined
                      }
                      className={`freelancer-nav-item ${
                        isActive ? "active" : ""
                      }`}
                      onClick={() => {
                        if (item.children) {
                          handleNavigation(item.label);
                          toggleSubmenu(item.id);
                        } else {
                          handleNavigation(item.label);
                        }
                      }}
                    >
                      <Icon
                        size={21}
                        strokeWidth={2.1}
                      />

                      <span>{item.label}</span>

                      {item.count !== undefined && (
                        <small>{item.count}</small>
                      )}

                      {item.children && (
                        <ChevronDown
                          size={17}
                          className={`freelancer-nav-chevron ${
                            isExpanded ? "expanded" : ""
                          }`}
                        />
                      )}
                    </button>

                    {/* SUBMENU */}

                    {item.children && isExpanded && (
                      <div className="freelancer-submenu">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;

                          return (
                            <button
                              type="button"
                              key={child.label}
                              title={child.label}
                              className={`freelancer-nav-item freelancer-submenu-item ${
                                activeSection === child.label
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                handleNavigation(child.label)
                              }
                            >
                              <ChildIcon
                                size={18}
                                strokeWidth={2}
                              />

                              <span>{child.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* LOGOUT */}

        <div className="freelancer-sidebar-bottom">
          <button
            type="button"
            className="freelancer-nav-item freelancer-logout-nav"
            onClick={handleLogout}
            title="Log out"
          >
            <LogOut size={21} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* =====================================
          MOBILE BACKDROP
      ===================================== */}

      {sidebarOpen && (
        <button
          type="button"
          className="freelancer-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* =====================================
          MAIN AREA
      ===================================== */}

      <div className="freelancer-main">

        {/* =====================================
            ORIGINAL ETHIOLANCE HEADER
        ===================================== */}

        <header className="freelancer-topbar">

          {/* MOBILE MENU */}

          <button
            type="button"
            className="freelancer-mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={23} />
          </button>

          {/* BRAND */}

          <a
            href="/"
            className="freelancer-topbar-brand"
          >
            <img
              src="/ethiolance-emblem.png"
              alt=""
            />

            <span>
              Ethio<span>Lance</span>
            </span>
          </a>

          {/* SEARCH */}

          <div className="freelancer-search">
            <Search size={21} />

            <input
              type="search"
              placeholder="Search jobs, freelancers..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            <kbd>Ctrl + K</kbd>
          </div>

          {/* HEADER ACTIONS */}

          <div className="freelancer-topbar-actions">

            {/* THEME SWITCH */}

            <div className="freelancer-theme-switch">
              <button
                type="button"
                className={!darkMode ? "selected" : ""}
                onClick={() => setDarkMode(false)}
                aria-label="Light mode"
              >
                <Sun size={21} />
              </button>

              <button
                type="button"
                className={darkMode ? "selected" : ""}
                onClick={() => setDarkMode(true)}
                aria-label="Dark mode"
              >
                <Moon size={21} />
              </button>
            </div>

            {/* NOTIFICATIONS */}

            <button
              type="button"
              className="freelancer-notification"
              aria-label="Notifications"
              onClick={() => handleNavigation("Notifications")}
            >
              <Bell size={24} />
              <span>3</span>
            </button>

            {/* PROFILE DROPDOWN */}

            <div
              className="freelancer-profile-wrapper"
              ref={profileMenuRef}
            >
              <button
                type="button"
                className={`freelancer-profile ${
                  profileMenuOpen ? "active" : ""
                }`}
                onClick={() =>
                  setProfileMenuOpen((previous) => !previous)
                }
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
                title="Account menu"
              >
                <div className="freelancer-avatar">
                  {userInitial}
                </div>

                <span>{displayName}</span>

                <ChevronDown
                  size={17}
                  className={
                    profileMenuOpen
                      ? "profile-chevron-open"
                      : ""
                  }
                />
              </button>

              {profileMenuOpen && (
                <div className="freelancer-profile-dropdown">

                  {/* USER INFORMATION */}

                  <div className="freelancer-profile-dropdown-header">
                    <div className="freelancer-avatar">
                      {userInitial}
                    </div>

                    <div>
                      <strong>{user.name || displayName}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>

                  <div className="freelancer-profile-dropdown-divider" />

                  {/* MY PROFILE */}

                  <button
                    type="button"
                    onClick={() =>
                      handleProfileNavigation("My Profile")
                    }
                  >
                    <UserRound size={18} />
                    <span>My Profile</span>
                  </button>

                  {/* SETTINGS */}

                  <button
                    type="button"
                    onClick={() =>
                      handleProfileNavigation("Settings")
                    }
                  >
                    <SettingsIcon size={18} />
                    <span>Settings</span>
                  </button>

                  <div className="freelancer-profile-dropdown-divider" />

                  {/* LOGOUT */}

                  <button
                    type="button"
                    className="freelancer-profile-logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* =====================================
            DYNAMIC CONTENT
        ===================================== */}

        <main className="freelancer-content">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
