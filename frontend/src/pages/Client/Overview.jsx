
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Wallet,
  PlusCircle,
  ArrowUpRight,
  FileText,
  Users,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

import "./Overview.css";

export default function Overview({ changePage }) {
  return (
    <div className="ethio-overview">

      {/* WELCOME SECTION */}
      <section className="ethio-overview-welcome">
        <div>
          <span className="ethio-overview-eyebrow">
            CLIENT WORKSPACE
          </span>

          <h1>Welcome back!</h1>

          <p>
            Here's what's happening with your projects and freelancers.
          </p>
        </div>

        <button
          className="ethio-overview-post-btn"
          onClick={() => changePage?.("Post a Job")}
        >
          <PlusCircle size={18} />
          Post a New Job
        </button>
      </section>

      {/* STATISTICS */}
      <section className="ethio-overview-stats">

        {[
          {
            title: "Total Jobs Posted",
            icon: BriefcaseBusiness,
            className: "jobs",
          },
          {
            title: "Active Projects",
            icon: Clock,
            className: "active",
          },
          {
            title: "Completed Jobs",
            icon: CheckCircle2,
            className: "completed",
          },
          {
            title: "Total Spending",
            icon: Wallet,
            className: "spending",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              className="ethio-overview-stat-card"
              key={stat.title}
            >
              <div
                className={`ethio-overview-stat-icon ${stat.className}`}
              >
                <Icon size={22} />
              </div>

              <div className="ethio-overview-stat-content">
                <p>{stat.title}</p>
                <h2>--</h2>
                <span>No data available</span>
              </div>
            </div>
          );
        })}

      </section>

      {/* MAIN CONTENT */}
      <div className="ethio-overview-main-grid">

        {/* RECENT JOBS */}
        <section className="ethio-overview-panel ethio-overview-jobs">

          <div className="ethio-overview-panel-header">
            <div>
              <h2>Recent Jobs</h2>
              <p>Track your recently posted jobs</p>
            </div>

            <button
              onClick={() => changePage?.("My Jobs")}
              className="ethio-overview-view-all"
            >
              View All <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="ethio-overview-empty-state">
            <BriefcaseBusiness size={30} />
            <p>No jobs available yet.</p>
          </div>

        </section>

        {/* RECENT PROPOSALS */}
        <section className="ethio-overview-panel ethio-overview-proposals">

          <div className="ethio-overview-panel-header">
            <div>
              <h2>Recent Proposals</h2>
              <p>Freelancers interested in your jobs</p>
            </div>

            <button
              onClick={() => changePage?.("Proposals")}
              className="ethio-overview-view-all"
            >
              View All <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="ethio-overview-empty-state">
            <Users size={30} />
            <p>No proposals received yet.</p>
          </div>

        </section>

      </div>

      {/* BOTTOM SECTION */}
      <div className="ethio-overview-bottom-grid">

        {/* RECENT ACTIVITY */}
        <section className="ethio-overview-panel ethio-overview-activity">

          <div className="ethio-overview-panel-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Your latest account updates</p>
            </div>

            <button
              onClick={() => changePage?.("Notifications")}
              className="ethio-overview-view-all"
            >
              View All <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="ethio-overview-empty-state">
            <FileText size={30} />
            <p>No recent activity.</p>
          </div>

        </section>

        {/* QUICK ACTIONS */}
        <section className="ethio-overview-panel ethio-overview-quick-actions">

          <div className="ethio-overview-panel-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Manage your workspace</p>
            </div>
          </div>

          <button
            className="ethio-overview-action"
            onClick={() => changePage?.("Post a Job")}
          >
            <span className="ethio-overview-action-icon">
              <PlusCircle size={19} />
            </span>

            <span>
              <strong>Post a Job</strong>
              <small>Find the right freelancer</small>
            </span>

            <ChevronRight size={18} />
          </button>

          <button
            className="ethio-overview-action"
            onClick={() => changePage?.("My Jobs")}
          >
            <span className="ethio-overview-action-icon">
              <BriefcaseBusiness size={19} />
            </span>

            <span>
              <strong>Manage Jobs</strong>
              <small>View and update your jobs</small>
            </span>

            <ChevronRight size={18} />
          </button>

          <button
            className="ethio-overview-action"
            onClick={() => changePage?.("Proposals")}
          >
            <span className="ethio-overview-action-icon">
              <Users size={19} />
            </span>

            <span>
              <strong>Review Proposals</strong>
              <small>Check freelancer applications</small>
            </span>

            <ChevronRight size={18} />
          </button>

          <button
            className="ethio-overview-action"
            onClick={() => changePage?.("Messages")}
          >
            <span className="ethio-overview-action-icon">
              <MessageSquare size={19} />
            </span>

            <span>
              <strong>Messages</strong>
              <small>Communicate with freelancers</small>
            </span>

            <ChevronRight size={18} />
          </button>

        </section>

      </div>

    </div>
  );
}
