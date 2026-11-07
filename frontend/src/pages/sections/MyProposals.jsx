import { useMemo, useState, useEffect } from "react";
import {
  FileText,
  Clock3,
  CheckCircle2,
  XCircle,
  Search,
  CalendarDays,
  Wallet,
  BriefcaseBusiness,
  Eye,
  Send,
  ArrowUpRight,
  Inbox,
} from "lucide-react";

import "./MyProposals.css";

const STORAGE_KEY = "ethioLanceMyProposals";

function MyProposals() {
  const [proposals, setProposals] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProposal, setSelectedProposal] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      setProposals(Array.isArray(saved) ? saved : []);
    } catch {
      setProposals([]);
    }
  }, []);

  const stats = useMemo(() => ({
    total: proposals.length,
    pending: proposals.filter(p => p.status === "PENDING").length,
    accepted: proposals.filter(p => p.status === "ACCEPTED").length,
    rejected: proposals.filter(p => p.status === "REJECTED").length,
  }), [proposals]);

  const filteredProposals = useMemo(() => {
    return proposals.filter(proposal => {
      const matchesFilter =
        activeFilter === "ALL" ||
        proposal.status === activeFilter;

      const matchesSearch =
        (proposal.jobTitle || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (proposal.clientName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [proposals, activeFilter, searchTerm]);

  const formatDate = date => {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Date unavailable";
    }

    return parsed.toLocaleDateString("en-ET", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = status => {
    switch (status) {
      case "ACCEPTED":
        return "accepted";
      case "REJECTED":
        return "rejected";
      default:
        return "pending";
    }
  };

  return (
    <main className="ethio-myproposals-page">

      {/* HEADER */}
      <section className="ethio-myproposals-header">
        <div>
          <span className="ethio-myproposals-eyebrow">
            FREELANCER WORKSPACE
          </span>

          <h1>My Proposals</h1>

          <p>
            Track your applications and stay updated on your
            freelance opportunities.
          </p>
        </div>

        <div className="ethio-myproposals-header-icon">
          <FileText size={32} />
        </div>
      </section>

      {/* STATISTICS */}
      <section className="ethio-myproposals-stats">

        <StatCard
          label="Total Proposals"
          value={stats.total}
          icon={<FileText />}
          type="total"
        />

        <StatCard
          label="Pending"
          value={stats.pending}
          icon={<Clock3 />}
          type="pending"
        />

        <StatCard
          label="Accepted"
          value={stats.accepted}
          icon={<CheckCircle2 />}
          type="accepted"
        />

        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={<XCircle />}
          type="rejected"
        />

      </section>

      {/* PROPOSALS CONTENT */}
      <section className="ethio-myproposals-content">

        <div className="ethio-myproposals-toolbar">
          <div>
            <h2>Your Applications</h2>
            <p>Manage and track your submitted proposals.</p>
          </div>

          <div className="ethio-myproposals-search">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search jobs or clients..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* FILTERS */}
        <div className="ethio-myproposals-filters">
          {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map(filter => (
            <button
              key={filter}
              className={
                activeFilter === filter ? "active" : ""
              }
              onClick={() => setActiveFilter(filter)}
            >
              {filter === "ALL"
                ? "All Proposals"
                : filter.charAt(0) +
                  filter.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* PROPOSAL LIST */}
        {filteredProposals.length > 0 ? (

          <div className="ethio-myproposals-list">

            {filteredProposals.map(proposal => (

              <article
                className="ethio-myproposals-card"
                key={proposal.id}
              >

                <div className="ethio-myproposals-card-top">

                  <div className="ethio-myproposals-job-icon">
                    <BriefcaseBusiness size={23} />
                  </div>

                  <span
                    className={`ethio-myproposals-status ${getStatusClass(
                      proposal.status
                    )}`}
                  >
                    {proposal.status || "PENDING"}
                  </span>

                </div>

                <h3>{proposal.jobTitle || "Untitled Job"}</h3>

                <p className="ethio-myproposals-client">
                  Client: {proposal.clientName || "Client"}
                </p>

                <div className="ethio-myproposals-details">

                  <div>
                    <Wallet size={17} />
                    <span>
                      ETB {Number(proposal.bidAmount || 0).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <Clock3 size={17} />
                    <span>
                      {proposal.deliveryTime || "Not specified"}
                    </span>
                  </div>

                  <div>
                    <CalendarDays size={17} />
                    <span>
                      {formatDate(proposal.createdAt)}
                    </span>
                  </div>

                </div>

                <div className="ethio-myproposals-card-footer">

                  <button
                    className="ethio-myproposals-view-btn"
                    onClick={() => setSelectedProposal(proposal)}
                  >
                    <Eye size={17} />
                    View Proposal
                  </button>

                  <ArrowUpRight size={19} />

                </div>

              </article>

            ))}

          </div>

        ) : (

          <div className="ethio-myproposals-empty">

            <div className="ethio-myproposals-empty-icon">
              <Inbox size={38} />
            </div>

            <h3>No proposals found</h3>

            <p>
              {searchTerm || activeFilter !== "ALL"
                ? "Try changing your search or filter."
                : "You haven't submitted any proposals yet. Explore available jobs and send your first proposal."}
            </p>

          </div>

        )}

      </section>

      {/* PROPOSAL DETAILS MODAL */}
      {selectedProposal && (

        <div
          className="ethio-myproposals-modal-overlay"
          onClick={() => setSelectedProposal(null)}
        >

          <section
            className="ethio-myproposals-modal"
            onClick={e => e.stopPropagation()}
          >

            <div className="ethio-myproposals-modal-header">
              <div>
                <span>PROPOSAL DETAILS</span>
                <h2>{selectedProposal.jobTitle}</h2>
              </div>

              <button
                onClick={() => setSelectedProposal(null)}
              >
                ×
              </button>
            </div>

            <div className="ethio-myproposals-modal-body">

              <div className="ethio-myproposals-modal-info">
                <span>Client</span>
                <strong>
                  {selectedProposal.clientName || "Client"}
                </strong>
              </div>

              <div className="ethio-myproposals-modal-info">
                <span>Your Bid</span>
                <strong>
                  ETB {Number(selectedProposal.bidAmount || 0).toLocaleString()}
                </strong>
              </div>

              <div className="ethio-myproposals-modal-info">
                <span>Delivery Time</span>
                <strong>
                  {selectedProposal.deliveryTime || "Not specified"}
                </strong>
              </div>

              <div className="ethio-myproposals-cover-letter">
                <h3>Your Cover Letter</h3>
                <p>
                  {selectedProposal.coverLetter ||
                    "No cover letter available."}
                </p>
              </div>

            </div>

          </section>

        </div>

      )}

    </main>
  );
}

function StatCard({ label, value, icon, type }) {
  return (
    <div className={`ethio-myproposals-stat-card ${type}`}>
      <div className="ethio-myproposals-stat-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

export default MyProposals;