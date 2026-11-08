
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Compass,
  ClipboardList,
  BriefcaseBusiness,
  MessageCircle,
  Bell,
  WalletCards,
  ReceiptText,
  CircleUserRound,
  Images,
  SlidersHorizontal,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  UserRound,
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

function DashboardPage({ role = "FREELANCER" }) {
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  const [user, setUser] = useState(null);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("ethioLanceTheme") === "dark";
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("Dashboard");

  const [expandedMenu, setExpandedMenu] = useState({
    financial: false,
    profile: false,
  });

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // AUTHENTICATION
  useEffect(() => {
    const savedUser = getSavedUser();

    if (!savedUser || savedUser.role !== role) {
      navigate("/", { replace: true });
      return;
    }

    setUser(savedUser);
  }, [navigate, role]);

  // SAVE THEME
  useEffect(() => {
    localStorage.setItem(
      "ethioLanceTheme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // CLOSE PROFILE DROPDOWN
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
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // FREELANCER NAVIGATION
  // All original sidebar items and their order are preserved.
  const navigationGroups = [
    {
      title: "WORKSPACE",
      items: [
        { label: "Dashboard", icon: LayoutDashboard },
        { label: "Browse Jobs", icon: Compass },
        { label: "My Proposals", icon: ClipboardList },
        { label: "My Contracts", icon: BriefcaseBusiness },
        { label: "Messages", icon: MessageCircle, count: 3 },
        { label: "Notifications", icon: Bell, count: 3 },
      ],
    },
    {
      title: "FINANCIAL",
      items: [
        {
          label: "Earnings & Payments",
          icon: WalletCards,
          id: "financial",
          children: [
            {
              label: "Transaction History",
              icon: ReceiptText,
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
          icon: CircleUserRound,
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
          icon: SlidersHorizontal,
        },
      ],
    },
  ];

  // NAVIGATION
  const handleNavigation = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
    setProfileMenuOpen(false);
  };

  const handleProfileNavigation = (section) => {
    setActiveSection(section);
    setProfileMenuOpen(false);
    setSidebarOpen(false);
  };

  const toggleSubmenu = (menuId) => {
    setExpandedMenu((previous) => ({
      ...previous,
      [menuId]: !previous[menuId],
    }));
  };

  const isGroupActive = (item) => {
    return (
      activeSection === item.label ||
      item.children?.some(
        (child) => child.label === activeSection
      )
    );
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("ethioLanceToken");
    localStorage.removeItem("ethioLanceUser");

    sessionStorage.removeItem("ethioLanceToken");
    sessionStorage.removeItem("ethioLanceUser");

    setProfileMenuOpen(false);
    navigate("/", { replace: true });
  };

  // USER DISPLAY INFORMATION
  const displayName =
    user?.firstName ||
    user?.name?.split(" ")[0] ||
    "there";

  const userInitial = displayName.charAt(0).toUpperCase();

  // ACTIVE SECTION
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

  if (!user || user.role !== role) {
    return null;
  }

  return (
    <div
      className={`freelancer-dashboard ${
        darkMode ? "freelancer-dark-mode" : ""
      }`}
    >
      {/* SIDEBAR */}
      <aside
        className={`freelancer-sidebar ${
          sidebarOpen ? "freelancer-sidebar-open" : ""
        }`}
      >
        {/* SIDEBAR BRAND */}
        <div className="freelancer-sidebar-brand">
          <div className="freelancer-sidebar-watermark" />

          <img
            src="/ethiolance-emblem.png"
            alt="EthioLance logo"
          />

          <span className="freelancer-sidebar-brand-name">
            <span className="ethio-text">Ethio</span>
            <span className="lance-text">Lance</span>
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
        <nav
          className="freelancer-sidebar-nav"
          aria-label="Freelancer navigation"
        >
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
                      <Icon size={21} strokeWidth={1.9} />

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
                                size={19}
                                strokeWidth={1.9}
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

      </aside>

      {/* MOBILE BACKDROP */}
      {sidebarOpen && (
        <button
          type="button"
          className="freelancer-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* MAIN AREA */}
      <div className="freelancer-main">

        {/* HEADER */}
        <header className="freelancer-topbar">

          {/* HEADER LEFT */}
          <div className="freelancer-header-left">

            <button
              type="button"
              className="freelancer-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <a href="/" className="freelancer-topbar-brand">
              <span className="ethio-text">Ethio</span>
              <span className="lance-text">Lance</span>
            </a>

          </div>

          {/* HEADER RIGHT */}
          <div className="freelancer-header-right">

            {/* SEARCH */}
            <div className="freelancer-search">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                aria-label="Search dashboard"
              />
            </div>

            {/* THEME TOGGLE */}
            <button
              type="button"
              className="freelancer-header-icon"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle theme"
              aria-label="Toggle theme"
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
              className="freelancer-header-icon freelancer-notification"
              onClick={() => handleNavigation("Notifications")}
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="freelancer-notification-dot" />
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

                <div className="freelancer-profile-info">
                  <strong>{displayName}</strong>
                  <span>Freelancer</span>
                </div>

                <ChevronDown
                  size={16}
                  className={
                    profileMenuOpen
                      ? "profile-chevron-open"
                      : ""
                  }
                />
              </button>

              {profileMenuOpen && (
                <div className="freelancer-profile-dropdown">

                  <div className="freelancer-profile-dropdown-header">
                    <div className="freelancer-avatar">
                      {userInitial}
                    </div>

                    <div>
                      <strong>
                        {user.name || displayName}
                      </strong>

                      <span>{user.email}</span>
                    </div>
                  </div>

                  <div className="freelancer-profile-dropdown-divider" />

                  <button
                    type="button"
                    onClick={() =>
                      handleProfileNavigation("My Profile")
                    }
                  >
                    <UserRound size={18} />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleProfileNavigation("Settings")
                    }
                  >
                    <SlidersHorizontal size={18} />
                    <span>Settings</span>
                  </button>

                  <div className="freelancer-profile-dropdown-divider" />

                  <button
                    type="button"
                    className="freelancer-profile-logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>

                </div>
              )}
            </div>

          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="freelancer-content">
          {renderActiveSection()}
        </main>

      </div>
    </div>
  );
}

export default DashboardPage;
