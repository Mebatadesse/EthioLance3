import {
  ArrowRight,
  Award,
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
  CircleCheckBig,
  ClipboardList,
  Eye,
  Search,
  Star,
  UserRound,
  Wallet,
} from "lucide-react";

import "./Dashboard.css";

function Dashboard({ displayName = "there", onNavigate = () => {} }) {
  const metrics = [
    { label: "Active projects", value: "—", icon: BriefcaseBusiness, tone: "gold" },
    { label: "Completed jobs", value: "—", icon: CircleCheckBig, tone: "green" },
    { label: "Client rating", value: "—", icon: Star, tone: "purple" },
    { label: "Profile views", value: "—", icon: Eye, tone: "blue" },
  ];

  const shortcuts = [
    { label: "Browse jobs", description: "Find your next project", icon: Search, section: "Browse Jobs" },
    { label: "My proposals", description: "Track submitted proposals", icon: ClipboardList, section: "My Proposals" },
    { label: "Complete your profile", description: "Show clients what you do", icon: UserRound, section: "My Profile" },
    { label: "View portfolio", description: "Showcase your work", icon: Award, section: "Portfolio" },
  ];

  return (
    <div className="freelancer-dashboard-home">
      <header className="freelancer-dashboard-welcome">
        <div>
          <span className="freelancer-dashboard-eyebrow">FREELANCER WORKSPACE</span>
          <h1>Welcome back, {displayName}</h1>
          <p>Here’s what’s happening with your freelance work.</p>
        </div>
        <button
          type="button"
          className="freelancer-dashboard-primary-action"
          onClick={() => onNavigate("Browse Jobs")}
        >
          <Search size={18} /> Find work
        </button>
      </header>

      <section className="freelancer-dashboard-overview" aria-label="Account overview">
        <article className="freelancer-dashboard-balance">
          <div className="freelancer-dashboard-balance-heading">
            <span className="freelancer-dashboard-icon gold"><Wallet size={20} /></span>
            <span>Available balance</span>
          </div>
          <strong>ETB 0.00</strong>
          <button type="button" onClick={() => onNavigate("Earnings & Payments")}>
            View payments <ArrowRight size={15} />
          </button>
        </article>

        <div className="freelancer-dashboard-metrics">
          {metrics.map(({ label, value, icon: Icon, tone }) => (
            <article className="freelancer-dashboard-metric" key={label}>
              <span className={`freelancer-dashboard-icon ${tone}`}><Icon size={19} /></span>
              <div>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="freelancer-dashboard-section-heading">
        <div>
          <span className="freelancer-dashboard-eyebrow">YOUR WORKSPACE</span>
          <h2>Work and earnings</h2>
        </div>
        <button type="button" onClick={() => onNavigate("My Contracts")}>
          View contracts <ArrowRight size={16} />
        </button>
      </div>

      <div className="freelancer-dashboard-work-grid">
        <section className="freelancer-dashboard-card freelancer-dashboard-opportunities">
          <div className="freelancer-dashboard-card-heading">
            <div>
              <span className="freelancer-dashboard-icon blue"><BriefcaseBusiness size={19} /></span>
              <div>
                <h2>Recent opportunities</h2>
                <p>Explore projects that fit your skills.</p>
              </div>
            </div>
            <button type="button" onClick={() => onNavigate("Browse Jobs")} aria-label="Browse all jobs">
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="freelancer-dashboard-empty-state">
            <span className="freelancer-dashboard-empty-icon"><Search size={22} /></span>
            <h3>Find your next opportunity</h3>
            <p>Browse open jobs and send a proposal to get started.</p>
            <button type="button" onClick={() => onNavigate("Browse Jobs")}>
              Browse jobs <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <div className="freelancer-dashboard-side-stack">
          <section className="freelancer-dashboard-card freelancer-dashboard-earnings">
            <div className="freelancer-dashboard-card-heading">
              <div>
                <span className="freelancer-dashboard-icon green"><ChartNoAxesColumnIncreasing size={19} /></span>
                <div>
                  <h2>Earnings</h2>
                  <p>Your project income summary.</p>
                </div>
              </div>
              <button type="button" onClick={() => onNavigate("Earnings & Payments")} aria-label="View earnings">
                <ArrowRight size={18} />
              </button>
            </div>
            <strong className="freelancer-dashboard-earnings-amount">ETB 0.00</strong>
            <p className="freelancer-dashboard-earnings-note">Your earnings activity will appear here.</p>
          </section>

          <section className="freelancer-dashboard-card freelancer-dashboard-shortcuts">
            <div className="freelancer-dashboard-card-title">
              <h2>Quick actions</h2>
              <p>Pick up where you left off.</p>
            </div>
            <div className="freelancer-dashboard-shortcut-list">
              {shortcuts.map(({ label, description, icon: Icon, section }) => (
                <button type="button" key={section} onClick={() => onNavigate(section)}>
                  <span className="freelancer-dashboard-shortcut-icon"><Icon size={17} /></span>
                  <span className="freelancer-dashboard-shortcut-copy">
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                  <ArrowRight size={15} />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      <footer className="freelancer-dashboard-footer">
        <span>© {new Date().getFullYear()} EthioLance</span>
        <span>Connecting Ethiopian talent with opportunities.</span>
      </footer>
    </div>
  );
}

export default Dashboard;
