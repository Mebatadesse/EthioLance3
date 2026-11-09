
import "./Messages.css";

export default function Messages({ changePage }) {
  return (
    <div className="ethio-client-messages">
      <div className="ethio-client-messages-heading">
        <h1>Messages</h1>
        <p>Communicate with your freelancers.</p>
      </div>

      <div className="ethio-client-messages-empty">
        <h3>No messages yet</h3>
        <p>
          Your conversations with freelancers will appear here.
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
