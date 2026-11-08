
import { useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  FileText,
  MessageSquare,
  CreditCard,
  CheckCircle2,
  Check,
  Trash2,
  Clock,
  Filter,
  BellOff,
} from "lucide-react";
import "./Notifications.css";

const initialNotifications = [
  {
    id: 1,
    type: "proposal",
    title: "New proposal received",
    message:
      "Abebe Kebede submitted a proposal for your E-commerce Website Development job.",
    time: "10 minutes ago",
    date: "Today",
    read: false,
  },
  {
    id: 2,
    type: "message",
    title: "New message",
    message:
      "Sara Mohammed sent you a message about the project requirements.",
    time: "35 minutes ago",
    date: "Today",
    read: false,
  },
  {
    id: 3,
    type: "job",
    title: "Job successfully published",
    message:
      "Your Mobile Banking UI Design job is now visible to freelancers.",
    time: "2 hours ago",
    date: "Today",
    read: false,
  },
  {
    id: 4,
    type: "payment",
    title: "Payment update",
    message:
      "Your payment for the completed project has been processed.",
    time: "Yesterday",
    date: "Yesterday",
    read: true,
  },
  {
    id: 5,
    type: "contract",
    title: "Contract accepted",
    message:
      "The contract for Business Logo and Branding has been accepted.",
    time: "Yesterday",
    date: "Yesterday",
    read: true,
  },
  {
    id: 6,
    type: "proposal",
    title: "Proposal received",
    message:
      "Dawit Tesfaye submitted a proposal for your website project.",
    time: "2 days ago",
    date: "Earlier",
    read: true,
  },
];

const filters = ["All", "Unread", "Read"];

const getNotificationIcon = (type) => {
  switch (type) {
    case "proposal":
      return <FileText size={19} />;
    case "message":
      return <MessageSquare size={19} />;
    case "job":
      return <BriefcaseBusiness size={19} />;
    case "payment":
      return <CreditCard size={19} />;
    case "contract":
      return <CheckCircle2 size={19} />;
    default:
      return <Bell size={19} />;
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState("All");

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === "Unread") return !notification.read;
    if (activeFilter === "Read") return notification.read;
    return true;
  });

  const markAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((previous) =>
      previous.filter((notification) => notification.id !== id)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const groupedNotifications = ["Today", "Yesterday", "Earlier"]
    .map((date) => ({
      date,
      items: filteredNotifications.filter(
        (notification) => notification.date === date
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="ethio-notifications">
      <div className="ethio-notifications-header">
        <div>
          <span className="ethio-notifications-eyebrow">
            ACCOUNT ACTIVITY
          </span>
          <h1>Notifications</h1>
          <p>Stay updated with your jobs, proposals, and messages.</p>
        </div>

        <div className="ethio-notifications-header-icon">
          <Bell size={25} />
          {unreadCount > 0 && (
            <span>{unreadCount > 99 ? "99+" : unreadCount}</span>
          )}
        </div>
      </div>

      <div className="ethio-notifications-stats">
        <div className="ethio-notification-stat-card">
          <div className="ethio-notification-stat-icon">
            <Bell size={20} />
          </div>
          <div>
            <span>Total Notifications</span>
            <strong>{notifications.length}</strong>
          </div>
        </div>

        <div className="ethio-notification-stat-card">
          <div className="ethio-notification-stat-icon unread">
            <Clock size={20} />
          </div>
          <div>
            <span>Unread Notifications</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>
      </div>

      <section className="ethio-notifications-panel">
        <div className="ethio-notifications-toolbar">
          <div className="ethio-notifications-toolbar-title">
            <h2>Recent Activity</h2>
            <span>{filteredNotifications.length} notifications</span>
          </div>

          <div className="ethio-notifications-actions">
            <button
              className="ethio-notification-text-btn"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check size={16} />
              Mark all as read
            </button>

            <button
              className="ethio-notification-text-btn delete-all"
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
            >
              <Trash2 size={16} />
              Clear all
            </button>
          </div>
        </div>

        <div className="ethio-notifications-filters">
          <div className="ethio-notifications-filter-label">
            <Filter size={16} />
            Filter:
          </div>

          {filters.map((filter) => (
            <button
              key={filter}
              className={`ethio-notification-filter ${
                activeFilter === filter ? "active" : ""
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
              {filter === "Unread" && unreadCount > 0 && (
                <span>{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="ethio-notifications-list">
          {groupedNotifications.length > 0 ? (
            groupedNotifications.map((group) => (
              <div className="ethio-notification-group" key={group.date}>
                <h3>{group.date}</h3>

                {group.items.map((notification) => (
                  <article
                    className={`ethio-notification-item ${
                      !notification.read ? "unread" : ""
                    }`}
                    key={notification.id}
                  >
                    <div
                      className={`ethio-notification-icon ${notification.type}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="ethio-notification-content">
                      <div className="ethio-notification-title-row">
                        <h4>{notification.title}</h4>
                        {!notification.read && (
                          <span className="ethio-notification-unread-dot" />
                        )}
                      </div>

                      <p>{notification.message}</p>

                      <span className="ethio-notification-time">
                        <Clock size={13} />
                        {notification.time}
                      </span>
                    </div>

                    <div className="ethio-notification-item-actions">
                      {!notification.read && (
                        <button
                          title="Mark as read"
                          aria-label="Mark as read"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check size={17} />
                        </button>
                      )}

                      <button
                        className="delete"
                        title="Delete notification"
                        aria-label="Delete notification"
                        onClick={() =>
                          deleteNotification(notification.id)
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ))
          ) : (
            <div className="ethio-notifications-empty">
              <div>
                <BellOff size={30} />
              </div>
              <h3>No notifications found</h3>
              <p>
                {notifications.length === 0
                  ? "You don't have any notifications right now."
                  : `You don't have any ${activeFilter.toLowerCase()} notifications.`}
              </p>

              {activeFilter !== "All" && notifications.length > 0 && (
                <button onClick={() => setActiveFilter("All")}>
                  View all notifications
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
