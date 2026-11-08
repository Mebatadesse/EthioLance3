
import { useEffect, useState } from "react";

import {
  Search,
  BriefcaseBusiness,
  CalendarDays,
  Wallet,
  Loader2,
  RefreshCw,
  Eye,
  X,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

import "./BrowseJobs.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const PROPOSALS_STORAGE_KEY = "ethioLanceMyProposals";

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [proposalJob, setProposalJob] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [proposalError, setProposalError] = useState("");
  const [proposalSuccess, setProposalSuccess] = useState("");

  const [proposalData, setProposalData] = useState({
    coverLetter: "",
    bidAmount: "",
    deliveryTime: "",
  });

  // Get authentication token
  const getToken = () =>
    localStorage.getItem("ethioLanceToken") ||
    sessionStorage.getItem("ethioLanceToken");

  // Get logged-in user
  const getCurrentUser = () => {
    try {
      return (
        JSON.parse(localStorage.getItem("ethioLanceUser") || "null") ||
        JSON.parse(sessionStorage.getItem("ethioLanceUser") || "null")
      );
    } catch {
      return null;
    }
  };

  // Get freelancer ID from user data or JWT
  const getFreelancerId = () => {
    const user = getCurrentUser();

    const userId =
      user?.id ||
      user?.userId ||
      user?.user?.id;

    if (userId) return String(userId);

    // Fallback: read the user ID from the JWT payload
    try {
      const token = getToken();

      if (!token) return null;

      const payload = token.split(".")[1];

      const decoded = JSON.parse(
        atob(
          payload
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );

      return decoded.userId
        ? String(decoded.userId)
        : decoded.id
          ? String(decoded.id)
          : null;
    } catch {
      return null;
    }
  };

  // Parse API response
  const parseResponse = async (response) => {
    const text = await response.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error(
        "Invalid server response. Check your API URL and backend."
      );
    }
  };

  // Fetch available jobs
  const fetchJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in to browse available jobs.");
      }

      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch jobs.");
      }

      const availableJobs = Array.isArray(data)
        ? data
        : data.jobs || [];

      setJobs(
        availableJobs.filter((job) => job.status === "OPEN")
      );
    } catch (err) {
      console.error("Fetch jobs error:", err);
      setError(err.message || "Unable to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Search jobs
  const filteredJobs = jobs.filter((job) => {
    const searchText = search.trim().toLowerCase();

    return (
      job.title?.toLowerCase().includes(searchText) ||
      job.description?.toLowerCase().includes(searchText)
    );
  });

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Date unavailable";
    }

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatBudget = (budget) =>
    Number(budget || 0).toLocaleString("en-US");

  // Open proposal form
  const openProposalForm = (job) => {
    setSelectedJob(null);
    setProposalJob(job);

    setProposalData({
      coverLetter: "",
      bidAmount: String(job.budget || ""),
      deliveryTime: "",
    });

    setProposalError("");
    setProposalSuccess("");
  };

  // Close proposal form
  const closeProposalForm = () => {
    if (submitting) return;

    setProposalJob(null);
    setProposalError("");
    setProposalSuccess("");
  };

  // Handle form changes
  const handleProposalChange = (e) => {
    const { name, value } = e.target;

    setProposalData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Save successful proposal to localStorage
  const saveProposalLocally = (serverProposal, job) => {
    const freelancerId = getFreelancerId();

    const user = getCurrentUser();

    const client = job.client || {};

    const clientName =
      job.clientName ||
      [
        client.firstName,
        client.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      client.name ||
      "Client";

    const savedProposal = {
      ...(serverProposal || {}),

      id:
        serverProposal?.id ||
        `local-${job.id}-${Date.now()}`,

      jobId: job.id,

      freelancerId,

      jobTitle: job.title || "Untitled Job",

      clientName,

      coverLetter: proposalData.coverLetter.trim(),

      bidAmount: Number(proposalData.bidAmount),

      deliveryTime: Number(proposalData.deliveryTime),

      status: serverProposal?.status || "PENDING",

      createdAt:
        serverProposal?.createdAt ||
        new Date().toISOString(),
    };

    let existingProposals = [];

    try {
      existingProposals = JSON.parse(
        localStorage.getItem(PROPOSALS_STORAGE_KEY) || "[]"
      );

      if (!Array.isArray(existingProposals)) {
        existingProposals = [];
      }
    } catch {
      existingProposals = [];
    }

    // Remove an existing copy of this same proposal.
    // A freelancer can submit only one proposal per job.
    const updatedProposals = existingProposals.filter(
      (proposal) => {
        const sameJob =
          String(proposal.jobId) === String(job.id);

        const sameFreelancer =
          !freelancerId ||
          !proposal.freelancerId ||
          String(proposal.freelancerId) ===
            String(freelancerId);

        return !(sameJob && sameFreelancer);
      }
    );

    updatedProposals.unshift(savedProposal);

    // Save proposals
    localStorage.setItem(
      PROPOSALS_STORAGE_KEY,
      JSON.stringify(updatedProposals)
    );

    // Notify MyProposals immediately
    window.dispatchEvent(
      new Event("ethioLanceProposalsUpdated")
    );

    console.log("Proposal saved successfully:", savedProposal);

    return savedProposal;
  };

  // Submit proposal
  const handleProposalSubmit = async (e) => {
    e.preventDefault();

    setProposalError("");
    setProposalSuccess("");

    if (!proposalJob) return;

    const token = getToken();

    if (!token) {
      setProposalError(
        "Your session has expired. Please log in again."
      );
      return;
    }

    const coverLetter = proposalData.coverLetter.trim();
    const bidAmount = Number(proposalData.bidAmount);
    const deliveryTime = Number(proposalData.deliveryTime);

    if (coverLetter.length < 20) {
      setProposalError(
        "Your cover letter must contain at least 20 characters."
      );
      return;
    }

    if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
      setProposalError(
        "Please enter a valid proposed budget."
      );
      return;
    }

    if (!Number.isInteger(deliveryTime) || deliveryTime <= 0) {
      setProposalError(
        "Please enter a valid delivery time in days."
      );
      return;
    }

    setSubmitting(true);

    try {
      // Send proposal to your existing backend
      const response = await fetch(
        `${API_BASE_URL}/api/proposals/${proposalJob.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            coverLetter,
            bidAmount,
            deliveryTime,
          }),
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit your proposal."
        );
      }

      // Save only after successful backend submission
      try {
        saveProposalLocally(data.proposal, proposalJob);

        setProposalSuccess(
          data.message || "Proposal submitted successfully!"
        );
      } catch (storageError) {
        console.error(
          "Proposal submitted, but local saving failed:",
          storageError
        );

        setProposalSuccess(
          "Your proposal was submitted successfully, but could not be saved in this browser."
        );
      }

      // Close form after successful submission
      window.setTimeout(() => {
        setProposalJob(null);
        setProposalSuccess("");
      }, 2200);

    } catch (err) {
      console.error("Proposal submission error:", err);

      setProposalError(
        err.message || "Unable to submit proposal."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="browse-jobs-page">

      {/* HEADER */}
      <div className="browse-jobs-header">
        <div>
          <span className="browse-eyebrow">
            FIND YOUR NEXT OPPORTUNITY
          </span>

          <h2>Browse Jobs</h2>

          <p>
            Discover projects, showcase your skills, and grow your freelance career.
          </p>
        </div>

        <button
          className="browse-jobs-refresh"
          onClick={fetchJobs}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "browse-jobs-spinner" : ""}
          />
          Refresh Jobs
        </button>
      </div>

      {/* SEARCH */}
      <div className="browse-jobs-toolbar">
        <div className="browse-jobs-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search by job title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              type="button"
              className="browse-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={17} />
            </button>
          )}
        </div>

        {!loading && !error && (
          <span className="browse-jobs-count">
            {filteredJobs.length}{" "}
            {filteredJobs.length === 1 ? "job" : "jobs"} found
          </span>
        )}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="browse-jobs-state">
          <Loader2 size={38} className="browse-jobs-spinner" />
          <h3>Finding opportunities</h3>
          <p>Loading available projects...</p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="browse-jobs-state">
          <AlertCircle size={38} />
          <h3>Unable to load jobs</h3>
          <p>{error}</p>

          <button onClick={fetchJobs}>
            Try Again
          </button>
        </div>
      )}

      {/* JOBS */}
      {!loading && !error && (
        <div className="browse-jobs-list">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <article
                className="browse-job-card"
                key={job.id}
              >
                <div className="browse-job-top">
                  <div className="browse-job-icon">
                    <BriefcaseBusiness size={22} />
                  </div>

                  <div className="browse-job-heading">
                    <h3>{job.title}</h3>

                    <span className="browse-job-status">
                      <span className="browse-status-dot" />
                      Open
                    </span>
                  </div>

                  <span className="browse-job-id">
                    #{job.id}
                  </span>
                </div>

                <p className="browse-job-description">
                  {job.description?.length > 190
                    ? `${job.description.slice(0, 190)}...`
                    : job.description}
                </p>

                <div className="browse-job-meta">
                  <span>
                    <Wallet size={16} />
                    <strong>
                      {formatBudget(job.budget)} ETB
                    </strong>
                  </span>

                  <span>
                    <CalendarDays size={16} />
                    {formatDate(job.createdAt)}
                  </span>
                </div>

                <div className="browse-job-actions">
                  <button
                    className="browse-job-view"
                    onClick={() => setSelectedJob(job)}
                  >
                    View Details
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="browse-jobs-state browse-empty-state">
              <BriefcaseBusiness size={42} />
              <h3>No jobs found</h3>

              <p>
                {search
                  ? "Try another search term."
                  : "There are currently no open projects. Check back later."}
              </p>

              {search && (
                <button onClick={() => setSearch("")}>
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* JOB DETAILS */}
      {selectedJob && (
        <div
          className="browse-job-modal-overlay"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="browse-job-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="browse-job-modal-header">
              <div>
                <span>JOB DETAILS</span>
                <h2>{selectedJob.title}</h2>
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                aria-label="Close job details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="browse-job-modal-budget">
              <div className="browse-budget-icon">
                <Wallet size={21} />
              </div>

              <div>
                <span>Client's Budget</span>
                <strong>
                  {formatBudget(selectedJob.budget)} ETB
                </strong>
              </div>

              <span className="browse-job-status">
                Open
              </span>
            </div>

            <div className="browse-job-modal-description">
              <h3>Project Description</h3>
              <p>{selectedJob.description}</p>
            </div>

            <div className="browse-job-modal-date">
              <CalendarDays size={17} />
              Posted on {formatDate(selectedJob.createdAt)}
            </div>

            <button
              className="browse-job-apply-button"
              onClick={() => openProposalForm(selectedJob)}
            >
              <Send size={17} />
              Send a Proposal
            </button>

            <button
              className="browse-job-modal-close"
              onClick={() => setSelectedJob(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* PROPOSAL FORM */}
      {proposalJob && (
        <div
          className="browse-job-modal-overlay"
          onClick={closeProposalForm}
        >
          <div
            className="browse-job-modal browse-proposal-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="browse-job-modal-header">
              <div>
                <span>APPLICATION</span>
                <h2>Submit Your Proposal</h2>
                <p>{proposalJob.title}</p>
              </div>

              <button
                onClick={closeProposalForm}
                disabled={submitting}
                aria-label="Close proposal form"
              >
                <X size={21} />
              </button>
            </div>

            <div className="browse-proposal-budget-info">
              <span>Client's Budget</span>
              <strong>
                {formatBudget(proposalJob.budget)} ETB
              </strong>
            </div>

            <form onSubmit={handleProposalSubmit}>
              <div className="browse-proposal-field">
                <label htmlFor="coverLetter">
                  Cover Letter
                </label>

                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={proposalData.coverLetter}
                  onChange={handleProposalChange}
                  placeholder="Introduce yourself, describe your relevant experience, and explain how you will complete this project..."
                  rows={6}
                  minLength={20}
                  required
                  disabled={submitting}
                />

                <small>
                  {proposalData.coverLetter.trim().length} / 20 minimum characters
                </small>
              </div>

              <div className="browse-proposal-grid">
                <div className="browse-proposal-field">
                  <label htmlFor="bidAmount">
                    Your Bid (ETB)
                  </label>

                  <input
                    id="bidAmount"
                    name="bidAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={proposalData.bidAmount}
                    onChange={handleProposalChange}
                    placeholder="Your price"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="browse-proposal-field">
                  <label htmlFor="deliveryTime">
                    Delivery (Days)
                  </label>

                  <div className="browse-proposal-input-icon">
                    <Clock size={17} />

                    <input
                      id="deliveryTime"
                      name="deliveryTime"
                      type="number"
                      min="1"
                      step="1"
                      value={proposalData.deliveryTime}
                      onChange={handleProposalChange}
                      placeholder="e.g. 7"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {proposalError && (
                <div className="browse-proposal-error">
                  <AlertCircle size={17} />
                  {proposalError}
                </div>
              )}

              {proposalSuccess && (
                <div className="browse-proposal-success">
                  <CheckCircle2 size={18} />
                  {proposalSuccess}
                </div>
              )}

              <button
                type="submit"
                className="browse-job-apply-button"
                disabled={submitting || !!proposalSuccess}
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={18}
                      className="browse-jobs-spinner"
                    />
                    Submitting Proposal...
                  </>
                ) : proposalSuccess ? (
                  <>
                    <CheckCircle2 size={18} />
                    Submitted Successfully
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    Submit Proposal
                  </>
                )}
              </button>

              <button
                type="button"
                className="browse-job-modal-close"
                onClick={closeProposalForm}
                disabled={submitting}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
