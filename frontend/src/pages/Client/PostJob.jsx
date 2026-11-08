
import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import "./PostJob.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken() {
  return (
    localStorage.getItem("ethioLanceToken") ||
    sessionStorage.getItem("ethioLanceToken")
  );
}

function getCurrentUser() {
  const savedUser =
    localStorage.getItem("ethioLanceUser") ||
    sessionStorage.getItem("ethioLanceUser");

  try {
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

export default function PostJob({ changePage }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Get authentication token
    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    // Check logged-in user role
    const user = getCurrentUser();

    if (user?.role !== "CLIENT") {
      setError("Only client accounts can post jobs. Please log in as a client.");
      return;
    }

    // Validate required fields
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.budget
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate budget
    const budget = Number(formData.budget);

    if (!Number.isFinite(budget) || budget <= 0) {
      setError("Budget must be greater than zero.");
      return;
    }

    try {
      setLoading(true);

      // Send job creation request
      const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          budget,
        }),
      });

      // Handle backend response
      const responseText = await response.text();

      let data;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        console.error("Invalid backend response:", responseText);

        throw new Error(
          "The backend returned an invalid response. Check your API URL and backend server."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to post your job."
        );
      }

      // Display success message
      setSuccess("Your job has been posted successfully!");

      // Clear form
      setFormData({
        title: "",
        description: "",
        budget: "",
      });

      // Navigate to My Jobs after successful creation
      setTimeout(() => {
        if (typeof changePage === "function") {
          changePage("My Jobs");
        }
      }, 1000);

    } catch (err) {
      console.error("Post job error:", err);

      setError(
        err.message || "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ethio-client-page">

      {/* Page Heading */}
      <div className="ethio-client-page-heading">
        <div>
          <h1>Post a Job</h1>
          <p>
            Describe your project and find the right freelancer.
          </p>
        </div>
      </div>

      {/* Job Form */}
      <form
        className="ethio-client-form"
        onSubmit={handleSubmit}
      >

        {/* Error Message */}
        {error && (
          <div
            className="ethio-client-form-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            className="ethio-client-form-success"
            role="status"
          >
            {success}
          </div>
        )}

        {/* Job Title */}
        <div className="ethio-client-form-group">
          <label htmlFor="title">
            Job Title
          </label>

          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Build an e-commerce website"
            required
            maxLength={150}
            disabled={loading}
          />
        </div>

        {/* Job Description */}
        <div className="ethio-client-form-group">
          <label htmlFor="description">
            Project Description
          </label>

          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Explain your project requirements, goals, and expectations..."
            rows={7}
            required
            disabled={loading}
          />
        </div>

        {/* Job Budget */}
        <div className="ethio-client-form-group">
          <label htmlFor="budget">
            Budget (ETB)
          </label>

          <input
            id="budget"
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="Enter your project budget"
            min="1"
            step="0.01"
            required
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="ethio-client-primary-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2
                size={18}
                className="spin"
              />
              Posting...
            </>
          ) : (
            <>
              <Send size={18} />
              Submit Job
            </>
          )}
        </button>

      </form>
    </div>
  );
}
