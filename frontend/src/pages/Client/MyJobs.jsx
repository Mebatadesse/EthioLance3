
import { useEffect, useState } from "react";

import {
  PlusCircle,
  CalendarDays,
  Users,
  Eye,
  BriefcaseBusiness,
  Loader2,
  RefreshCw,
} from "lucide-react";

import "./MyJobs.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function MyJobs({ changePage }) {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch jobs belonging to the logged-in client
  const fetchMyJobs = async () => {
    setLoading(true);
    setError("");

    try {
      // Get authentication token
      const token =
        localStorage.getItem("ethioLanceToken") ||
        sessionStorage.getItem("ethioLanceToken");

      // Get logged-in user
      const savedUser =
        localStorage.getItem("ethioLanceUser") ||
        sessionStorage.getItem("ethioLanceUser");

      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }

      if (!savedUser) {
        throw new Error("User information not found. Please log in again.");
      }

      let user;

      try {
        user = JSON.parse(savedUser);
      } catch {
        throw new Error("Invalid user information. Please log in again.");
      }

      // Support common user ID formats
      const currentUserId =
        user.id ?? user.userId ?? user.user?.id;

      if (currentUserId == null) {
        throw new Error("Could not identify the logged-in client.");
      }

      // Fetch jobs using the existing backend endpoint
      const response = await fetch(
        `${API_BASE_URL}/api/jobs`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Safely handle the response
      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Invalid server response. Check your backend API URL."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch jobs."
        );
      }

      // Support either an array or an object containing jobs
      const allJobs = Array.isArray(data)
        ? data
        : data.jobs || [];

      // Keep only jobs posted by the logged-in client
      const myJobs = allJobs.filter(
        (job) =>
          Number(job.clientId) === Number(currentUserId)
      );

      setJobs(myJobs);
    } catch (err) {
      console.error("My Jobs Error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs when the component loads
  useEffect(() => {
    fetchMyJobs();
  }, []);

  // Filter jobs by status
  const filteredJobs =
    filter === "ALL"
      ? jobs
      : jobs.filter((job) => job.status === filter);

  // Calculate statistics
  const totalJobs = jobs.length;

  const openJobs = jobs.filter(
    (job) => job.status === "OPEN"
  ).length;

  const totalProposals = jobs.reduce(
    (total, job) =>
      total +
      Number(
        job._count?.proposals ??
        job.proposalsCount ??
        job.proposals ??
        0
      ),
    0
  );

  // Format date
  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format status
  const formatStatus = (status) => {
    if (!status) return "UNKNOWN";

    return status.replaceAll("_", " ");
  };

  return (
    <div className="ethio-my-jobs">

      {/* Page Heading */}
      <div className="ethio-my-jobs-heading">
        <div>
          <h1>My Jobs</h1>
          <p>Manage and track the jobs you have posted.</p>
        </div>

        <button
          className="ethio-my-jobs-add"
          onClick={() => changePage?.("Post a Job")}
        >
          <PlusCircle size={18} />
          Post a Job
        </button>
      </div>

      {/* Statistics */}
      <div className="ethio-my-jobs-stats">

        <div className="ethio-my-jobs-stat">
          <BriefcaseBusiness size={22} />

          <div>
            <span>Total Jobs</span>
            <h3>{totalJobs}</h3>
          </div>
        </div>

        <div className="ethio-my-jobs-stat">
          <Eye size={22} />

          <div>
            <span>Open Jobs</span>
            <h3>{openJobs}</h3>
          </div>
        </div>

        <div className="ethio-my-jobs-stat">
          <Users size={22} />

          <div>
            <span>Total Proposals</span>
            <h3>{totalProposals}</h3>
          </div>
        </div>

      </div>

      {/* Jobs List Header */}
      <div className="ethio-my-jobs-list-header">

        <h2>Your Posted Jobs</h2>

        <div className="ethio-my-jobs-controls">

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Jobs</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            type="button"
            onClick={fetchMyJobs}
            disabled={loading}
            title="Refresh jobs"
          >
            <RefreshCw size={17} />
          </button>

        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="ethio-my-jobs-empty">
          <Loader2 size={35} className="spin" />
          <h3>Loading your jobs...</h3>
          <p>Please wait while we fetch your jobs.</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="ethio-my-jobs-empty">
          <BriefcaseBusiness size={42} />

          <h3>Unable to load jobs</h3>
          <p>{error}</p>

          <button onClick={fetchMyJobs}>
            Try Again
          </button>
        </div>
      )}

      {/* Jobs List */}
      {!loading && !error && (
        <div className="ethio-my-jobs-list">

          {filteredJobs.length > 0 ? (

            filteredJobs.map((job) => {

              const proposalCount = Number(
                job._count?.proposals ??
                job.proposalsCount ??
                job.proposals ??
                0
              );

              return (
                <div
                  className="ethio-my-job-card"
                  key={job.id}
                >

                  {/* Job Information */}
                  <div className="ethio-my-job-main">

                    <div className="ethio-my-job-icon">
                      <BriefcaseBusiness size={22} />
                    </div>

                    <div className="ethio-my-job-info">

                      <h3>{job.title}</h3>

                      <span>
                        {job.description?.length > 100
                          ? `${job.description.slice(0, 100)}...`
                          : job.description}
                      </span>

                      <div className="ethio-my-job-meta">

                        <span>
                          <CalendarDays size={15} />
                          {formatDate(job.createdAt)}
                        </span>

                        <span>
                          <Users size={15} />
                          {proposalCount} Proposals
                        </span>

                      </div>
                    </div>
                  </div>

                  {/* Job Budget and Status */}
                  <div className="ethio-my-job-details">

                    <strong>
                      {Number(job.budget).toLocaleString()} ETB
                    </strong>

                    <span
                      className={`ethio-job-status ${
                        job.status?.toLowerCase()
                      }`}
                    >
                      {formatStatus(job.status)}
                    </span>

                  </div>

                </div>
              );
            })

          ) : (

            <div className="ethio-my-jobs-empty">

              <BriefcaseBusiness size={42} />

              <h3>No jobs found</h3>

              <p>
                {filter === "ALL"
                  ? "You haven't posted any jobs yet."
                  : "There are no jobs in this category."}
              </p>

              {filter === "ALL" && (
                <button
                  onClick={() => changePage?.("Post a Job")}
                >
                  <PlusCircle size={17} />
                  Post Your First Job
                </button>
              )}

            </div>

          )}

        </div>
      )}

    </div>
  );
}
