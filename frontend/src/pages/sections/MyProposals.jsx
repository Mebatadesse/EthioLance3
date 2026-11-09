
import { useMemo, useState, useEffect, useCallback } from "react";
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
  ArrowUpRight,
  Inbox,
  RefreshCw,
  X,
} from "lucide-react";

import "./MyProposals.css";

const STORAGE_KEY = "ethioLanceMyProposals";
const USER_KEY = "ethioLanceUser";

// Get the currently logged-in user
function getCurrentUserId() {
  try {
    const user =
      JSON.parse(localStorage.getItem(USER_KEY) || "null") ||
      JSON.parse(sessionStorage.getItem(USER_KEY) || "null");

    return (
      user?.userId ||
      user?.id ||
      user?.user?.userId ||
      user?.user?.id ||
      null
    );
  } catch (error) {
    console.error("Unable to read current user:", error);
    return null;
  }
}

// Read proposals from browser storage
function getStoredProposals() {
  const localData = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  const sessionData = JSON.parse(
    sessionStorage.getItem(STORAGE_KEY) || "[]"
  );

  return [
    ...(Array.isArray(localData) ? localData : []),
    ...(Array.isArray(sessionData) ? sessionData : []),
  ];
}

// Normalize proposal data
function normalizeProposal(proposal) {
  const job = proposal.job || {};
  const client = job.client || proposal.client || {};

  return {
    ...proposal,

    id:
      proposal.id ||
      `${proposal.jobId || job.id}-${proposal.createdAt || ""}`,

    jobId: proposal.jobId || job.id,

    jobTitle:
      proposal.jobTitle ||
      job.title ||
      "Untitled Job",

    clientName:
      proposal.clientName ||
      [client.firstName, client.lastName]
        .filter(Boolean)
        .join(" ") ||
      client.name ||
      "Client",

    bidAmount: Number(
      proposal.bidAmount ??
      proposal.proposedBudget ??
      0
    ),

    deliveryTime:
      proposal.deliveryTime ??
      proposal.deliveryDays ??
      "",

    coverLetter:
      proposal.coverLetter || "",

    status:
      (proposal.status || "PENDING").toUpperCase(),

    createdAt:
      proposal.createdAt ||
      new Date().toISOString(),
  };
}

function MyProposals() {
  const [proposals, setProposals] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load proposals belonging to the logged-in freelancer
  const loadProposals = useCallback(() => {
    setLoading(true);

    try {
      const currentUserId = getCurrentUserId();

      if (!currentUserId) {
        setProposals([]);
        return;
      }

      const saved = getStoredProposals();

      const userProposals = saved.filter((proposal) => {
        const freelancerId =
          proposal.freelancerId ||
          proposal.userId ||
          proposal.freelancer?.id ||
          proposal.freelancer?.userId;

        return (
          freelancerId &&
          String(freelancerId) === String(currentUserId)
        );
      });

      // Remove duplicate proposals
      const unique = new Map();

      userProposals.forEach((proposal) => {
        const normalized = normalizeProposal(proposal);

        const key = String(
          normalized.id ||
          `${normalized.jobId}-${normalized.createdAt}`
        );

        unique.set(key, normalized);
      });

      const result = Array.from(unique.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setProposals(result);
    } catch (error) {
      console.error("Error loading proposals:", error);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and automatic refresh
  useEffect(() => {
    loadProposals();

    const handleUpdate = () => {
      loadProposals();
    };

    const handleStorage = (event) => {
      if (
        event.key === STORAGE_KEY ||
        event.key === USER_KEY
      ) {
        loadProposals();
      }
    };

    window.addEventListener(
      "ethioLanceProposalsUpdated",
      handleUpdate
    );

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener(
        "ethioLanceProposalsUpdated",
        handleUpdate
      );

      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleUpdate);
    };
  }, [loadProposals]);

  // Statistics
  const stats = useMemo(
    () => ({
      total: proposals.length,

      pending: proposals.filter(
        (p) => p.status === "PENDING"
      ).length,

      accepted: proposals.filter(
        (p) => p.status === "ACCEPTED"
      ).length,

      rejected: proposals.filter(
        (p) => p.status === "REJECTED"
      ).length,
    }),
    [proposals]
  );

  // Search and filter
  const filteredProposals = useMemo(() => {
    return proposals.filter((proposal) => {
      const matchesFilter =
        activeFilter === "ALL" ||
        proposal.status === activeFilter;

      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        proposal.jobTitle.toLowerCase().includes(search) ||
        proposal.clientName.toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [proposals, activeFilter, searchTerm]);

  // Date formatting
  const formatDate = (date) => {
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

  // Delivery time formatting
  const formatDeliveryTime = (time) => {
    if (!time) return "Not specified";

    const days = Number(time);

    return Number.isFinite(days)
      ? `${days} ${days === 1 ? "day" : "days"}`
      : String(time);
  };

  // Status styling
  const getStatusClass = (status) => {
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
            <p>
              Manage and track your submitted proposals.
            </p>
          </div>

          <div className="ethio-myproposals-search">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search jobs or clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* FILTERS */}
        <div className="ethio-myproposals-filters">
          {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map(
            (filter) => (
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
            )
          )}
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="ethio-myproposals-empty">
            <RefreshCw
              size={30}
              className="animate-spin"
            />

            <h3>Loading proposals...</h3>
          </div>
        ) : filteredProposals.length > 0 ? (

          /* PROPOSAL LIST */
          <div className="ethio-myproposals-list">
            {filteredProposals.map((proposal) => (
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
                    {proposal.status}
                  </span>
                </div>

                <h3>{proposal.jobTitle}</h3>

                <p className="ethio-myproposals-client">
                  Client: {proposal.clientName}
                </p>

                <div className="ethio-myproposals-details">
                  <div>
                    <Wallet size={17} />

                    <span>
                      ETB {proposal.bidAmount.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <Clock3 size={17} />

                    <span>
                      {formatDeliveryTime(proposal.deliveryTime)}
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
                    onClick={() =>
                      setSelectedProposal(proposal)
                    }
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

          /* EMPTY STATE */
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

            <button
              type="button"
              onClick={loadProposals}
              className="ethio-myproposals-view-btn"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
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
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ethio-myproposals-modal-header">
              <div>
                <span>PROPOSAL DETAILS</span>

                <h2>{selectedProposal.jobTitle}</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProposal(null)}
                aria-label="Close proposal details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="ethio-myproposals-modal-body">
              <div className="ethio-myproposals-modal-info">
                <span>Client</span>
                <strong>
                  {selectedProposal.clientName}
                </strong>
              </div>

              <div className="ethio-myproposals-modal-info">
                <span>Your Bid</span>

                <strong>
                  ETB {selectedProposal.bidAmount.toLocaleString()}
                </strong>
              </div>

              <div className="ethio-myproposals-modal-info">
                <span>Delivery Time</span>

                <strong>
                  {formatDeliveryTime(
                    selectedProposal.deliveryTime
                  )}
                </strong>
              </div>

              <div className="ethio-myproposals-modal-info">
                <span>Submission Date</span>

                <strong>
                  {formatDate(selectedProposal.createdAt)}
                </strong>
              </div>

              <div className="ethio-myproposals-modal-info">
                <span>Status</span>

                <strong
                  className={getStatusClass(
                    selectedProposal.status
                  )}
                >
                  {selectedProposal.status}
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
