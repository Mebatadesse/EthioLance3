
import {
  ArrowRight,
  Search,
  Wallet,
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";

import "./Dashboard.css";

function Dashboard({
  displayName = "there",
  searchTerm = "",
  onNavigate = () => {},
}) {
  return (
    <>
      {/* WELCOME AND BALANCE */}
      <section className="freelancer-hero-grid">
        <div className="freelancer-welcome-card">
          <div className="freelancer-welcome-content">
            <span className="freelancer-welcome-label">
              FREELANCER WORKSPACE
            </span>

            <h1>
              Welcome back, <span>{displayName}!</span>
            </h1>

            <p>Let's make more progress today.</p>

            <button
              type="button"
              className="freelancer-primary-button"
              onClick={() => onNavigate("Browse Jobs")}
            >
              <Search size={19} />
              Find a Job
            </button>
          </div>

          <div className="freelancer-hero-decoration">
            <div className="freelancer-hero-orb" />
            <div className="freelancer-hero-sparkle">✦</div>
            <div className="freelancer-hero-wave" />
          </div>
        </div>

        {/* BALANCE */}
        <div className="freelancer-balance-card">
          <div className="freelancer-balance-heading">
            <Wallet size={31} />
            <h2>Your Balance</h2>
          </div>

          <h3>ETB 0.00</h3>

          <button
            type="button"
            className="freelancer-withdraw-button"
            onClick={() => onNavigate("Earnings & Payments")}
          >
            Withdraw <ArrowRight size={19} />
          </button>

          <div className="freelancer-wallet-decoration">
            <Wallet size={82} strokeWidth={1.2} />
            <span>✦</span>
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="freelancer-stats">
        {[
          "Active Projects",
          "Completed Jobs",
          "Top Rated",
          "Profile Views",
        ].map((label) => (
          <article
            key={label}
            className="freelancer-stat-card"
          >
            <div className="freelancer-stat-information">
              <h2>--</h2>
              <p>{label}</p>
            </div>
          </article>
        ))}
      </section>

      {/* EARNINGS AND RECENT JOBS */}
      <section className="freelancer-dashboard-panels">

        {/* EARNINGS */}
        <article className="freelancer-panel freelancer-earnings-panel">
          <div className="freelancer-panel-heading">
            <div className="freelancer-panel-title">
              <ChartNoAxesColumnIncreasing size={29} />
              <h2>Your Earnings</h2>
            </div>
          </div>

          <h3 className="freelancer-earnings-amount">
            ETB 0.00
          </h3>

          <div className="freelancer-empty-state">
            <p>No earnings data available yet.</p>
          </div>
        </article>

        {/* RECENT JOBS */}
        <article
          className="freelancer-panel freelancer-jobs-panel"
          id="freelancer-recent-jobs"
        >
          <div className="freelancer-panel-heading">
            <div className="freelancer-panel-title">
              <BriefcaseBusiness size={29} />
              <h2>Recent Jobs</h2>
            </div>

            <button
              type="button"
              className="freelancer-view-all"
              onClick={() => onNavigate("Browse Jobs")}
            >
              View All <ArrowRight size={19} />
            </button>
          </div>

          <div className="freelancer-no-jobs">
            <Search size={26} />
            <p>No recent jobs available yet.</p>
          </div>
        </article>
      </section>

      {/* FOOTER */}
      <footer className="freelancer-footer">
        <span>© {new Date().getFullYear()} EthioLance</span>
        <span>
          Connecting Ethiopian talent with opportunities.
        </span>
      </footer>
    </>
  );
}

export default Dashboard;
