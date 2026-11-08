
import "./Contracts.css";

export default function Contracts({ changePage }) {
  return (
    <div className="ethio-client-contracts">
      <div className="ethio-client-contracts-heading">
        <h1>My Contracts</h1>
        <p>Manage your agreements with freelancers.</p>
      </div>

      <div className="ethio-client-contracts-empty">
        <h3>No contracts yet</h3>
        <p>
          Your active and completed contracts will appear here.
        </p>

        <button
          type="button"
          onClick={() => changePage("My Jobs")}
        >
          View My Jobs
        </button>
      </div>
    </div>
  );
}
