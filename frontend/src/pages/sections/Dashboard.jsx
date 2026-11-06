import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  PenTool,
  Search,
  Smartphone,
  Star,
  TrendingUp,
  Users,
  Wallet,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";
import "./Dashboard.css";
const stats = [
  {
    label: "Active Projects",
    value: "12",
    change: "↑ 12%",
    icon: BriefcaseBusiness,
    color: "gold",
  },
  {
    label: "Completed Jobs",
    value: "8",
    change: "↑ 8%",
    icon: CheckCircle2,
    color: "green",
  },
  {
    label: "Top Rated",
    value: "4.9",
    change: "↑ 0.2",
    icon: Star,
    color: "purple",
  },
  {
    label: "Profile Views",
    value: "1.2K",
    change: "↑ 20%",
    icon: Users,
    color: "blue",
  },
];

const recentJobs = [
  {
    title: "Modern React Website",
    category: "Development & IT",
    budget: "ETB 8,000",
    posted: "2 days ago",
    status: "Open",
    icon: Code2,
    color: "blue",
  },
  {
    title: "Logo Design for Brand",
    category: "Design & Creative",
    budget: "ETB 3,000",
    posted: "3 days ago",
    status: "In Progress",
    icon: PenTool,
    color: "gold",
  },
  {
    title: "Mobile App UI Design",
    category: "Design & Creative",
    budget: "ETB 5,000",
    posted: "5 days ago",
    status: "Completed",
    icon: Smartphone,
    color: "purple",
  },
];

function Dashboard({
  displayName = "there",
  searchTerm = "",
  onNavigate = () => {},
}) {
  const filteredJobs = recentJobs.filter((job) =>
    `${job.title} ${job.category}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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

        <div className="freelancer-balance-card">
          <div className="freelancer-balance-heading">
            <Wallet size={31} />
            <h2>Your Balance</h2>
          </div>

          <h3>ETB 4,250</h3>

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
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className={`freelancer-stat-card stat-${stat.color}`}
            >
              <div className="freelancer-stat-icon">
                <Icon size={30} strokeWidth={2.3} />
              </div>

              <div className="freelancer-stat-information">
                <h2>{stat.value}</h2>
                <p>{stat.label}</p>
              </div>

              <span className="freelancer-stat-change">
                {stat.change}
              </span>
            </article>
          );
        })}
      </section>

      {/* EARNINGS AND RECENT JOBS */}
      <section className="freelancer-dashboard-panels">
        <article className="freelancer-panel freelancer-earnings-panel">
          <div className="freelancer-panel-heading">
            <div className="freelancer-panel-title">
              <ChartNoAxesColumnIncreasing size={29} />
              <h2>Your Earnings</h2>
            </div>

            <select
              className="freelancer-period-select"
              defaultValue="This Month"
              aria-label="Earnings period"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>

          <h3 className="freelancer-earnings-amount">
            ETB 18,750
          </h3>

          <p className="freelancer-earnings-growth">
            <TrendingUp size={17} />
            <strong>15%</strong> from last month
          </p>

          <div className="freelancer-chart">
            <div className="freelancer-chart-y-labels">
              <span>20k</span>
              <span>15k</span>
              <span>10k</span>
              <span>5k</span>
              <span>0</span>
            </div>

            <div className="freelancer-chart-graph">
              <svg
                viewBox="0 0 650 190"
                preserveAspectRatio="none"
                role="img"
                aria-label="Weekly earnings chart"
              >
                <defs>
                  <linearGradient
                    id="freelancerChartFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#f5b51b"
                      stopOpacity="0.28"
                    />
                    <stop
                      offset="100%"
                      stopColor="#f5b51b"
                      stopOpacity="0.02"
                    />
                  </linearGradient>
                </defs>

                {[12, 57, 102, 147, 190].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="650"
                    y2={y}
                    className="freelancer-chart-gridline"
                  />
                ))}

                {[10, 118, 226, 334, 442, 550, 648].map((x) => (
                  <line
                    key={x}
                    x1={x}
                    y1="12"
                    x2={x}
                    y2="190"
                    className="freelancer-chart-gridline"
                  />
                ))}

                <path
                  d="M10 150 C55 132 75 115 118 118 S185 140 226 128 S292 91 334 96 S402 78 442 82 S512 95 550 85 S612 55 648 30 L648 190 L10 190 Z"
                  fill="url(#freelancerChartFill)"
                />

                <path
                  d="M10 150 C55 132 75 115 118 118 S185 140 226 128 S292 91 334 96 S402 78 442 82 S512 95 550 85 S612 55 648 30"
                  className="freelancer-chart-line"
                />

                {[
                  [10, 150],
                  [118, 118],
                  [226, 128],
                  [334, 96],
                  [442, 82],
                  [550, 85],
                  [648, 30],
                ].map(([cx, cy]) => (
                  <circle
                    key={cx}
                    cx={cx}
                    cy={cy}
                    r="5.5"
                    className="freelancer-chart-point"
                  />
                ))}
              </svg>

              <div className="freelancer-chart-x-labels">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <span key={day}>{day}</span>
                  )
                )}
              </div>
            </div>
          </div>
        </article>

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

          <div className="freelancer-job-list">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => {
                const Icon = job.icon;

                return (
                  <article
                    className="freelancer-job-item"
                    key={job.title}
                  >
                    <div
                      className={`freelancer-job-icon job-${job.color}`}
                    >
                      <Icon size={29} strokeWidth={2.2} />
                    </div>

                    <div className="freelancer-job-details">
                      <h3>{job.title}</h3>

                      <p>
                        {job.budget} <span>•</span> {job.posted}
                      </p>

                      <small>{job.category}</small>
                    </div>

                    <span
                      className={`freelancer-job-status status-${job.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {job.status}
                    </span>

                    <button
                      type="button"
                      className="freelancer-job-arrow"
                      aria-label={`View ${job.title}`}
                    >
                      <ArrowRight size={21} />
                    </button>
                  </article>
                );
              })
            ) : (
              <div className="freelancer-no-jobs">
                <Search size={26} />
                <p>No matching jobs found.</p>
              </div>
            )}
          </div>
        </article>
      </section>

      {/* FOOTER */}
      <footer className="freelancer-footer">
        <span>© {new Date().getFullYear()} EthioLance</span>
        <span>Connecting Ethiopian talent with opportunities.</span>
      </footer>
    </>
  );
}

export default Dashboard;