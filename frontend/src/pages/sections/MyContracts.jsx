import { ArrowRight, BriefcaseBusiness, Compass } from "lucide-react";
import "./MyContracts.css";

function MyContracts({ onNavigate }) {
  return (
    <section className="freelancer-contracts-page">
      <header className="freelancer-contracts-heading">
        <div>
          <span>WORKSPACE</span>
          <h1>My Contracts</h1>
          <p>Track your active, completed, and pending freelance contracts.</p>
        </div>
      </header>

      <div className="freelancer-contracts-empty">
        <div className="freelancer-contracts-empty-icon">
          <BriefcaseBusiness size={28} aria-hidden="true" />
        </div>
        <span className="freelancer-contracts-empty-kicker">YOUR NEXT PROJECT STARTS HERE</span>
        <h2>No contracts yet</h2>
        <p>Browse open jobs and send a proposal. When a client accepts, your contract will appear here.</p>
        <button type="button" onClick={() => onNavigate?.("Browse Jobs")}>
          <Compass size={17} aria-hidden="true" />
          Browse jobs
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export default MyContracts;
