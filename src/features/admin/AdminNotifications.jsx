import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../services/api";
import "./admin.css";

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function AdminNotifications() {
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
      setError(requestError.message || "Could not load notifications.");
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

      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not update notification.");
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

      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not mark notifications as read.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">ACTIVITY</p>
          <h1>Notifications</h1>
          <p>
            {unreadCount
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You are all caught up"}
          </p>
        </div>

        <div className="admin-notification-actions">
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

      <section className="admin-panel">
        {loading ? (
          <div className="admin-state">Loading notifications...</div>
        ) : !visibleNotifications.length ? (
          <div className="admin-mini-empty">
            {showUnreadOnly
              ? "No unread notifications."
              : "No notifications yet."}
          </div>
        ) : (
          <div className="admin-notification-list">
            {visibleNotifications.map((notification) => (
              <article
                key={notification.id}
                className={
                  notification.read
                    ? "admin-notification-card"
                    : "admin-notification-card unread"
                }
              >
                <div>
                  <div className="admin-notification-top">
                    <h2>{notification.title}</h2>
                    <time>{formatDate(notification.createdAt)}</time>
                  </div>
                  <p>{notification.message}</p>
                </div>

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
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminNotifications;
