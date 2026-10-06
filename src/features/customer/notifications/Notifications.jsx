import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { apiRequest } from "../../../services/api";
import "./notifications.css";

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotifications() {
    try {
      setLoading(true);

      const response = await apiRequest("/notifications");
      setNotifications(response?.data || []);
      setError("");
    } catch (requestError) {
      setError(
        requestError.message || "Could not load your notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  const visibleNotifications = useMemo(
    () =>
      showUnreadOnly
        ? notifications.filter((notification) => !notification.read)
        : notifications,
    [notifications, showUnreadOnly]
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  async function markRead(notificationId) {
    try {
      setBusyId(notificationId);

      await apiRequest(`/notifications/${notificationId}/read`, {
        method: "PATCH",
      });

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      window.dispatchEvent(
        new Event("marketplace:notifications-updated")
      );
      setError("");
    } catch (requestError) {
      setError(
        requestError.message || "Could not update notification."
      );
    } finally {
      setBusyId("");
    }
  }

  async function markAllRead() {
    const unread = notifications.filter(
      (notification) => !notification.read
    );

    if (!unread.length) return;

    try {
      setBusyId("all");

      await Promise.all(
        unread.map((notification) =>
          apiRequest(`/notifications/${notification.id}/read`, {
            method: "PATCH",
          })
        )
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      window.dispatchEvent(
        new Event("marketplace:notifications-updated")
      );
      setError("");
    } catch (requestError) {
      setError(
        requestError.message || "Could not mark notifications as read."
      );
    } finally {
      setBusyId("");
    }
  }

  if (loading) {
    return (
      <div className="notifications-state">
        Loading notifications...
      </div>
    );
  }

  return (
    <main className="notifications-page">
      <div className="notifications-heading">
        <div>
          <p className="eyebrow">ACCOUNT ACTIVITY</p>
          <h1>Notifications</h1>
          <p>
            {unreadCount
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You are all caught up"}
          </p>
        </div>

        <div className="notifications-actions">
          <button
            type="button"
            className={showUnreadOnly ? "active" : ""}
            onClick={() => setShowUnreadOnly((value) => !value)}
          >
            {showUnreadOnly ? "Show All" : "Unread Only"}
          </button>

          <button
            type="button"
            onClick={markAllRead}
            disabled={!unreadCount || busyId === "all"}
          >
            {busyId === "all" ? "Updating..." : "Mark All Read"}
          </button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {!visibleNotifications.length ? (
        <section className="notifications-empty">
          <div className="notification-empty-symbol">i</div>
          <h2>
            {showUnreadOnly
              ? "No unread notifications"
              : "No notifications yet"}
          </h2>
          <p>Order, payment and account updates will appear here.</p>
          <Link to="/orders">View Orders</Link>
        </section>
      ) : (
        <section className="notification-list">
          {visibleNotifications.map((notification) => (
            <article
              key={notification.id}
              className={
                notification.read
                  ? "notification-card"
                  : "notification-card unread"
              }
            >
              <div className="notification-indicator">
                {notification.read ? "✓" : ""}
              </div>

              <div className="notification-content">
                <div className="notification-card-top">
                  <h2>{notification.title}</h2>
                  <time>{formatDate(notification.createdAt)}</time>
                </div>

                <p>{notification.message}</p>

                {!notification.read && (
                  <button
                    type="button"
                    disabled={busyId === notification.id}
                    onClick={() => markRead(notification.id)}
                  >
                    {busyId === notification.id
                      ? "Updating..."
                      : "Mark as read"}
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default Notifications;
