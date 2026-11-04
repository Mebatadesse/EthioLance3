import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  LogOut,
  Search,
  Users,
} from "lucide-react";

import "./DashboardPage.css";

function getSavedUser() {
  try {
    const savedUser =
      localStorage.getItem("ethioLanceUser") ||
      sessionStorage.getItem("ethioLanceUser");

    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

function DashboardPage({ role }) {
  const navigate = useNavigate();

  const [user] = useState(() => getSavedUser());

  const isClient = role === "CLIENT";

  useEffect(() => {
    if (!user || user.role !== role) {
      navigate("/", { replace: true });
    }
  }, [user, role, navigate]);

  // Don't display the dashboard for the wrong user role.
  if (!user || user.role !== role) {
    return null;
  }

  const displayName = user.firstName || "there";

  const stats = isClient
    ? [
        {
          label: "Open jobs",
          value: "2",
          icon: BriefcaseBusiness,
        },
        {
          label: "Proposals received",
          value: "8",
          icon: FileText,
        },
        {
          label: "Active contracts",
          value: "1",
          icon: CheckCircle2,
        },
      ]
    : [
        {
          label: "Available jobs",
          value: "12",
          icon: Search,
        },
        {
          label: "Proposals sent",
          value: "4",
          icon: FileText,
        },
        {
          label: "Active contracts",
          value: "1",
          icon: BriefcaseBusiness,
        },
      ];

  const listings = isClient
    ? [
        {
          title: "Landing Page Redesign",
          detail: "Design & Creative",
          info: "4 proposals received",
          status: "Open",
        },
        {
          title: "E-commerce Website",
          detail: "Development & IT",
          info: "4 proposals received",
          status: "Open",
        },
      ]
    : [
        {
          title: "React Developer",
          detail: "Development & IT · Remote",
          info: "ETB 15,000–25,000",
          status: "New",
        },
        {
          title: "UI/UX Designer",
          detail: "Design & Creative · Remote",
          info: "ETB 8,000–15,000",
          status: "New",
        },
        {
          title: "Website Development",
          detail: "Development & IT",
          info: "ETB 12,000–20,000",
          status: "New",
        },
      ];

  const handleLogout = () => {
    localStorage.removeItem("ethioLanceToken");
    localStorage.removeItem("ethioLanceUser");

    sessionStorage.removeItem("ethioLanceToken");
    sessionStorage.removeItem("ethioLanceUser");

    navigate("/", { replace: true });
  };

  return (
    <div className="demo-dashboard">
      {/* Top navigation */}
      <header className="dashboard-topbar">
        <a
          className="dashboard-brand"
          href="/"
        >
          <span className="brand-mark">e</span>

          <span>
            ethio<span className="brand-accent">lance</span>
          </span>
        </a>

        <div className="dashboard-topbar-actions">
          <span className="dashboard-demo-badge">
            Demo
          </span>

          <div className="dashboard-user">
            <div className="dashboard-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <span>{displayName}</span>
          </div>

          <button
            type="button"
            className="dashboard-logout"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            <span>Log out</span>
          </button>
        </div>
      </header>

      {/* Dashboard content */}
      <main className="dashboard-content">
        <div className="dashboard-welcome">
          <div>
            <span className="dashboard-eyebrow">
              {isClient
                ? "CLIENT WORKSPACE"
                : "FREELANCER WORKSPACE"}
            </span>

            <h1>Welcome back, {displayName}!</h1>

            <p>
              {isClient
                ? "Manage your projects and discover talented professionals."
                : "Explore opportunities and keep your freelance journey moving."}
            </p>
          </div>

          <span className="dashboard-role-badge">
            {isClient ? "Client account" : "Freelancer account"}
          </span>
        </div>

        <div className="dashboard-demo-notice">
          <span className="dashboard-notice-icon">
            <CheckCircle2 size={19} />
          </span>

          <div>
            <strong>Your dashboard is ready</strong>
            <p>
              This is a demonstration. Statistics and listings below
              are sample data, not live marketplace information.
            </p>
          </div>
        </div>

        {/* Overview statistics */}
        <section className="dashboard-stats">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                className="dashboard-stat-card"
                key={stat.label}
              >
                <div className="dashboard-stat-icon">
                  <Icon size={21} />
                </div>

                <p>{stat.label}</p>

                <h2>{stat.value}</h2>

                <span>Demo data</span>
              </article>
            );
          })}
        </section>

        {/* Main dashboard panels */}
        <div className="dashboard-panels">
          <section className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div>
                <h2>
                  {isClient ? "Your job posts" : "Recommended jobs"}
                </h2>

                <p>
                  {isClient
                    ? "A preview of your current projects."
                    : "Example opportunities matching your skills."}
                </p>
              </div>

              <BriefcaseBusiness
                size={22}
                className="dashboard-panel-heading-icon"
              />
            </div>

            <div className="dashboard-listings">
              {listings.map((listing) => (
                <article
                  className="dashboard-listing"
                  key={listing.title}
                >
                  <div className="dashboard-listing-icon">
                    <BriefcaseBusiness size={20} />
                  </div>

                  <div className="dashboard-listing-content">
                    <h3>{listing.title}</h3>

                    <p>{listing.detail}</p>

                    <span className="dashboard-listing-info">
                      {listing.info}
                    </span>
                  </div>

                  <span
                    className={`dashboard-status ${
                      listing.status === "Open"
                        ? "status-open"
                        : "status-new"
                    }`}
                  >
                    {listing.status}
                  </span>
                </article>
              ))}
            </div>

            <div className="dashboard-panel-footer">
              <span>
                {isClient
                  ? "Manage your projects"
                  : "Find your next opportunity"}
              </span>

              <ArrowRight size={18} />
            </div>
          </section>

          <section className="dashboard-panel dashboard-activity-panel">
            <div className="dashboard-panel-heading">
              <div>
                <h2>Workspace overview</h2>

                <p>Your next steps on EthioLance.</p>
              </div>

              <Clock3
                size={22}
                className="dashboard-panel-heading-icon"
              />
            </div>

            <div className="dashboard-activity">
              <div className="dashboard-activity-icon">
                <Users size={19} />
              </div>

              <div>
                <strong>
                  {isClient
                    ? "Review freelancer proposals"
                    : "Complete your freelancer profile"}
                </strong>

                <p>
                  {isClient
                    ? "Review the sample proposals for your posted jobs."
                    : "Showcase your skills and experience to attract clients."}
                </p>
              </div>
            </div>

            <div className="dashboard-activity">
              <div className="dashboard-activity-icon">
                <FileText size={19} />
              </div>

              <div>
                <strong>
                  {isClient
                    ? "Keep your job details updated"
                    : "Track your proposals"}
                </strong>

                <p>
                  {isClient
                    ? "Clear project requirements help you find the right talent."
                    : "Keep track of the projects you've applied for."}
                </p>
              </div>
            </div>

            <div className="dashboard-account-info">
              <span>Logged in as</span>
              <strong>{user.email}</strong>
              <span>{role}</span>
            </div>
          </section>
        </div>

        <footer className="dashboard-footer">
          <span>EthioLance</span>
          <span>Demo dashboard · More features coming soon</span>
        </footer>
      </main>
    </div>
  );
}

export default DashboardPage;