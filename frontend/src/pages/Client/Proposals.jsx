import { useEffect, useState, useCallback, useMemo } from "react";

import {
  FileText,
  CalendarDays,
  Eye,
  CheckCircle,
  Clock,
  Filter,
  BriefcaseBusiness,
  Loader2,
  RefreshCw,
  X,
  AlertCircle,
} from "lucide-react";

import "./Proposals.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const TOKEN_KEY = "ethioLanceToken";

function getAuthToken() {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY)
  );
}

// Read API responses safely
async function readResponse(response) {
  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data;
}

// Extract arrays from different API response structures
function extractArray(data, key) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.[key])) return data[key];

  if (Array.isArray(data?.data?.[key])) return data.data[key];

  return [];
}

// Get freelancer name
function getFreelancerName(proposal) {
  const freelancer =
    proposal.freelancer ||
    proposal.user ||
    proposal.applicant ||
    {};

  const user = freelancer.user || {};

  const firstName =
    freelancer.firstName || user.firstName || "";

  const lastName =
    freelancer.lastName || user.lastName || "";

  const fullName = `${firstName} ${lastName}`.trim();

  return (
    fullName ||
    freelancer.name ||
    freelancer.fullName ||
    user.name ||
    "Freelancer"
  );
}

// Normalize proposal information
function normalizeProposal(proposal, job) {
  return {
    ...proposal,

    id: proposal.id,

    jobId: proposal.jobId ?? job.id,

    freelancer: getFreelancerName(proposal),

    title:
      proposal.job?.title ||
      job.title ||
      "Untitled Job",

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

    status: String(
      proposal.status || "PENDING"
    ).toUpperCase(),

    date:
      proposal.createdAt ||
      proposal.submittedAt ||
      null,
  };
}

export default function Proposals({ changePage }) {
  const [proposals, setProposals] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [selectedProposal, setSelectedProposal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  // Fetch proposals using existing backend endpoints
  const fetchProposals = useCallback(async () => {
    setLoading(true);
    setError("");
    setActionMessage("");

    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Authentication required. Please log in again."
        );
      }

      // STEP 1: Fetch jobs
      const jobsResponse = await fetch(
        `${API_BASE_URL}/api/jobs`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const jobsData = await readResponse(jobsResponse);

      const jobs = extractArray(jobsData, "jobs");

      if (jobs.length === 0) {
        setProposals([]);
        return;
      }

      // STEP 2: Request proposals for each job.
      // The backend checks whether the logged-in client owns each job.
      // A 403 for another client's job should not stop other requests.
      const results = await Promise.allSettled(
        jobs.map(async (job) => {
          if (!job.id) return [];

          const response = await fetch(
            `${API_BASE_URL}/api/proposals/job/${job.id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );

          const data = await readResponse(response);

          const jobProposals = extractArray(
            data,
            "proposals"
          );

          return jobProposals.map((proposal) =>
            normalizeProposal(proposal, job)
          );
        })
      );

      // STEP 3: Combine successful requests
      const allProposals = [];

      const requestErrors = [];

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          allProposals.push(...result.value);
        } else {
          requestErrors.push(result.reason);
          console.error(
            "Individual proposal request failed:",
            result.reason
          );
        }
      });

      // STEP 4: Remove duplicate proposals
      const uniqueProposals = Array.from(
        new Map(
          allProposals
            .filter((proposal) => proposal.id != null)
            .map((proposal) => [
              String(proposal.id),
              proposal,
            ])
        ).values()
      );

      // STEP 5: Sort newest first
      uniqueProposals.sort(
        (a, b) =>
          new Date(b.date || 0).getTime() -
          new Date(a.date || 0).getTime()
      );

      setProposals(uniqueProposals);

      // Show an error only if every request failed
      if (
        results.length > 0 &&
        requestErrors.length === results.length
      ) {
        throw requestErrors[0];
      }

    } catch (err) {
      console.error("Fetch Proposals Error:", err);

      setError(
        err.message || "Unable to fetch proposals."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Accept proposal
  const handleAcceptProposal = async (proposal) => {
    const confirmed = window.confirm(
      `Are you sure you want to accept ${proposal.freelancer}'s proposal for "${proposal.title}"?`
    );

    if (!confirmed) return;

    const token = getAuthToken();

    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }

    setAcceptingId(proposal.id);
    setError("");
    setActionMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/proposals/${proposal.id}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await readResponse(response);

      const updatedProposal = data.proposal || {};

      const updated = {
        ...proposal,
        ...updatedProposal,
        status: String(
          updatedProposal.status || "ACCEPTED"
        ).toUpperCase(),
      };

      setProposals((previous) =>
        previous.map((item) =>
          String(item.id) === String(proposal.id)
            ? {
                ...item,
                ...updated,
                freelancer: proposal.freelancer,
                title: proposal.title,
              }
            : item
        )
      );

      setSelectedProposal((previous) =>
        previous &&
        String(previous.id) === String(proposal.id)
          ? {
              ...previous,
              ...updated,
              freelancer: proposal.freelancer,
              title: proposal.title,
            }
          : previous
      );

      setActionMessage(
        data.message || "Proposal accepted successfully."
      );

      // Reload the latest proposal information
      await fetchProposals();

    } catch (err) {
      console.error("Accept Proposal Error:", err);

      setError(
        err.message || "Failed to accept proposal."
      );
    } finally {
      setAcceptingId(null);
    }
  };

  // Filter proposals
  const filteredProposals = useMemo(() => {
    return filter === "ALL"
      ? proposals
      : proposals.filter(
          (proposal) => proposal.status === filter
        );
  }, [proposals, filter]);

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

  // Date formatting
  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Date unavailable";
    }

    return parsed.toLocaleDateString("en-ET", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Status formatting
  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return (
      status.charAt(0) +
      status.slice(1).toLowerCase()
    );
  };

  return (
    <div className="ethio-proposals">

      {/* PAGE HEADING */}
      <div className="ethio-proposals-heading">
        <div>
          <h1>My Proposals</h1>

          <p>
            Review proposals submitted by freelancers for your jobs.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchProposals}
          disabled={loading}
          title="Refresh proposals"
        >
          <RefreshCw
            size={18}
            className={loading ? "spin" : ""}
          />
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {actionMessage && (
        <div className="ethio-proposals-success">
          <CheckCircle size={18} />
          {actionMessage}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="ethio-proposals-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* STATISTICS */}
      <div className="ethio-proposals-stats">

        <div className="ethio-proposal-stat">
          <FileText size={23} />
          <div>
            <span>Total Proposals</span>
            <h3>{stats.total}</h3>
          </div>
        </div>

        <div className="ethio-proposal-stat">
          <Clock size={23} />
          <div>
            <span>Pending</span>
            <h3>{stats.pending}</h3>
          </div>
        </div>

        <div className="ethio-proposal-stat">
          <CheckCircle size={23} />
          <div>
            <span>Accepted</span>
            <h3>{stats.accepted}</h3>
          </div>
        </div>

        <div className="ethio-proposal-stat">
          <FileText size={23} />
          <div>
            <span>Rejected</span>
            <h3>{stats.rejected}</h3>
          </div>
        </div>

      </div>

      {/* PROPOSAL LIST HEADER */}
      <div className="ethio-proposals-list-heading">
        <h2>Received Proposals</h2>

        <div className="ethio-proposals-filter">
          <Filter size={17} />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Proposals</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="ethio-proposals-empty">
          <Loader2 size={35} className="spin" />
          <h3>Loading proposals...</h3>
          <p>Fetching proposals submitted to your jobs.</p>
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && proposals.length === 0 && (
        <div className="ethio-proposals-empty">
          <AlertCircle size={42} />

          <h3>Unable to load proposals</h3>

          <p>{error}</p>

          <button
            type="button"
            onClick={fetchProposals}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      )}

      {/* PROPOSAL LIST */}
      {!loading && !error && (
        <div className="ethio-proposals-list">

          {filteredProposals.length > 0 ? (
            filteredProposals.map((proposal) => (
              <div
                className="ethio-proposal-card"
                key={proposal.id}
              >

                {/* FREELANCER */}
                <div className="ethio-proposal-top">

                  <div className="ethio-proposal-freelancer">
                    <div className="ethio-proposal-avatar">
                      {proposal.freelancer
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h3>{proposal.freelancer}</h3>
                      <span>Freelancer</span>
                    </div>
                  </div>

                  <span
                    className={`ethio-proposal-status ${proposal.status.toLowerCase()}`}
                  >
                    {formatStatus(proposal.status)}
                  </span>

                </div>

                {/* JOB */}
                <div className="ethio-proposal-job">
                  <BriefcaseBusiness size={17} />
                  <span>{proposal.title}</span>
                </div>

                {/* DETAILS */}
                <div className="ethio-proposal-details">

                  <div>
                    <span>Proposed Budget</span>
                    <strong>
                      {proposal.bidAmount.toLocaleString()} ETB
                    </strong>
                  </div>

                  <div>
                    <span>Delivery Time</span>
                    <strong>
                      {proposal.deliveryTime
                        ? `${proposal.deliveryTime} days`
                        : "Not specified"}
                    </strong>
                  </div>

                  <div>
                    <span>Submitted</span>
                    <strong>
                      {formatDate(proposal.date)}
                    </strong>
                  </div>

                </div>

                {/* ACTIONS */}
                <div className="ethio-proposal-actions">

                  <button
                    type="button"
                    className="ethio-proposal-view"
                    onClick={() =>
                      setSelectedProposal(proposal)
                    }
                  >
                    <Eye size={16} />
                    View Proposal
                  </button>

                  {proposal.status === "PENDING" && (
                    <button
                      type="button"
                      className="ethio-proposal-accept"
                      onClick={() =>
                        handleAcceptProposal(proposal)
                      }
                      disabled={acceptingId !== null}
                    >
                      {String(acceptingId) === String(proposal.id) ? (
                        <Loader2
                          size={16}
                          className="spin"
                        />
                      ) : (
                        <CheckCircle size={16} />
                      )}

                      {String(acceptingId) === String(proposal.id)
                        ? "Accepting..."
                        : "Accept"}
                    </button>
                  )}

                </div>

              </div>
            ))
          ) : (
            <div className="ethio-proposals-empty">
              <FileText size={42} />

              <h3>No proposals found</h3>

              <p>
                {filter === "ALL"
                  ? "No freelancers have submitted proposals for your jobs yet."
                  : `There are no ${filter.toLowerCase()} proposals.`}
              </p>

              <button
                type="button"
                onClick={() => changePage?.("My Jobs")}
              >
                View My Jobs
              </button>
            </div>
          )}

        </div>
      )}

      {/* PROPOSAL DETAILS MODAL */}
      {selectedProposal && (
        <div
          className="ethio-proposal-modal-overlay"
          onClick={() => setSelectedProposal(null)}
        >
          <div
            className="ethio-proposal-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              type="button"
              className="ethio-proposal-modal-close"
              onClick={() => setSelectedProposal(null)}
            >
              <X size={20} />
            </button>

            <h2>Proposal Details</h2>

            <h3>{selectedProposal.freelancer}</h3>

            <p>
              <strong>Job:</strong>{" "}
              {selectedProposal.title}
            </p>

            <p>
              <strong>Bid:</strong>{" "}
              {selectedProposal.bidAmount.toLocaleString()} ETB
            </p>

            <p>
              <strong>Delivery:</strong>{" "}
              {selectedProposal.deliveryTime
                ? `${selectedProposal.deliveryTime} days`
                : "Not specified"}
            </p>

            <p>
              <strong>Submitted:</strong>{" "}
              {formatDate(selectedProposal.date)}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {formatStatus(selectedProposal.status)}
            </p>

            <div className="ethio-proposal-cover-letter">
              <strong>Cover Letter</strong>
              <p>
                {selectedProposal.coverLetter ||
                  "No cover letter provided."}
              </p>
            </div>

            {selectedProposal.status === "PENDING" && (
              <button
                type="button"
                className="ethio-proposal-accept"
                onClick={() =>
                  handleAcceptProposal(selectedProposal)
                }
                disabled={acceptingId !== null}
              >
                <CheckCircle size={16} />

                {String(acceptingId) === String(selectedProposal.id)
                  ? "Accepting..."
                  : "Accept Proposal"}
              </button>
            )}

            <button
              type="button"
              className="ethio-proposal-modal-done"
              onClick={() => setSelectedProposal(null)}
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}