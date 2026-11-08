
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
  CalendarDays,
} from "lucide-react";

import "./Overview.css";

const stats = [
  {
    title: "Total Jobs Posted",
    value: "12",
    change: "+2 this month",
    icon: BriefcaseBusiness,
    className: "jobs",
  },
  {
    title: "Active Projects",
    value: "5",
    change: "Currently ongoing",
    icon: Clock,
    className: "active",
  },
  {
    title: "Completed Jobs",
    value: "8",
    change: "+3 this month",
    icon: CheckCircle2,
    className: "completed",
  },
  {
    title: "Total Spending",
    value: "125,000 ETB",
    change: "Across all projects",
    icon: Wallet,
    className: "spending",
  },
];

const recentJobs = [
  {
    id: 1,
    title: "E-commerce Website Development",
    category: "Web Development",
    budget: "35,000 ETB",
    proposals: 12,
    status: "OPEN",
    date: "Nov 07, 2026",
  },
  {
    id: 2,
    title: "Mobile Banking UI Design",
    category: "UI/UX Design",
    budget: "18,000 ETB",
    proposals: 8,
    status: "IN_PROGRESS",
    date: "Nov 05, 2026",
  },
  {
    id: 3,
    title: "Business Logo and Branding",
    category: "Graphic Design",
    budget: "8,000 ETB",
    proposals: 15,
    status: "COMPLETED",
    date: "Nov 02, 2026",
  },
];

const recentProposals = [
  {
    id: 1,
    name: "Abebe Kebede",
    job: "E-commerce Website",
    amount: "30,000 ETB",
    time: "10 minutes ago",
    initials: "AK",
  },
  {
    id: 2,
    name: "Sara Mohammed",
    job: "Mobile Banking UI",
    amount: "16,000 ETB",
    time: "2 hours ago",
    initials: "SM",
  },
  {
    id: 3,
    name: "Dawit Tesfaye",
    job: "Business Logo Design",
    amount: "7,000 ETB",
    time: "Yesterday",
    initials: "DT",
  },
];

const activities = [
  {
    id: 1,
    icon: FileText,
    title: "New proposal received",
    description: "Abebe submitted a proposal for your e-commerce project.",
    time: "10 minutes ago",
    type: "proposal",
  },
  {
    id: 2,
    icon: MessageSquare,
    title: "New message received",
    description: "Sara sent you a message about project requirements.",
    time: "2 hours ago",
    type: "message",
  },
  {
    id: 3,
    icon: CheckCircle2,
    title: "Project completed",
    description: "Business Logo and Branding was marked as completed.",
    time: "Yesterday",
    type: "completed",
  },
];

export default function Overview({ changePage }) {
  const getStatusClass = (status) => {
    switch (status) {
      case "OPEN":
        return "open";
      case "IN_PROGRESS":
        return "in-progress";
      case "COMPLETED":
        return "completed";
      case "CANCELLED":
        return "cancelled";
      default:
        return "";
    }
  };

  return (
    <div className="ethio-overview">
      {/* Welcome Section */}
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

      {/* Statistics */}
      <section className="ethio-overview-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="ethio-overview-stat-card" key={stat.title}>
              <div className={`ethio-overview-stat-icon ${stat.className}`}>
                <Icon size={22} />
              </div>

              <div className="ethio-overview-stat-content">
                <p>{stat.title}</p>
                <h2>{stat.value}</h2>
                <span>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Main Content */}
      <div className="ethio-overview-main-grid">
        {/* Recent Jobs */}
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

          <div className="ethio-overview-table-wrapper">
            <table className="ethio-overview-table">
              <thead>
                <tr>
                  <th>Job Details</th>
                  <th>Budget</th>
                  <th>Proposals</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <div className="ethio-overview-job-title">
                        <strong>{job.title}</strong>
                        <span>
                          <CalendarDays size={12} />
                          {job.date}
                        </span>
                      </div>
                    </td>

                    <td className="ethio-overview-budget">
                      {job.budget}
                    </td>

                    <td>
                      <span className="ethio-overview-proposal-count">
                        {job.proposals}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`ethio-overview-status ${getStatusClass(
                          job.status
                        )}`}
                      >
                        {job.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Proposals */}
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

          <div className="ethio-overview-proposal-list">
            {recentProposals.map((proposal) => (
              <div className="ethio-overview-proposal-item" key={proposal.id}>
                <div className="ethio-overview-freelancer-avatar">
                  {proposal.initials}
                </div>

                <div className="ethio-overview-proposal-info">
                  <strong>{proposal.name}</strong>
                  <span>{proposal.job}</span>
                  <small>{proposal.time}</small>
                </div>

                <div className="ethio-overview-proposal-amount">
                  <strong>{proposal.amount}</strong>
                  <span>Bid amount</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Section */}
      <div className="ethio-overview-bottom-grid">
        {/* Activity */}
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

          <div className="ethio-overview-activity-list">
            {activities.map((activity) => {
              const Icon = activity.icon;

              return (
                <div className="ethio-overview-activity-item" key={activity.id}>
                  <div className={`ethio-overview-activity-icon ${activity.type}`}>
                    <Icon size={18} />
                  </div>

                  <div className="ethio-overview-activity-info">
                    <strong>{activity.title}</strong>
                    <p>{activity.description}</p>
                    <span>{activity.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
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
