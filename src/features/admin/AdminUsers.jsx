import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./admin.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      const response = await apiRequest("/admin/users");
      setUsers(response?.data || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function suspendUser(userId) {
    try {
      setBusyId(userId);

      const updated = await apiRequest(
        `/admin/users/${userId}/suspend`,
        { method: "PATCH" }
      );

      setUsers((current) =>
        current.map((user) => (user.id === userId ? updated : user))
      );
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not suspend user.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">ACCOUNTS</p>
          <h1>Users</h1>
          <p>Review registered marketplace accounts and access roles.</p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <section className="admin-panel">
        {loading ? (
          <div className="admin-state">Loading users...</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong>
                      <small className="admin-table-sub">{user.email}</small>
                    </td>
                    <td>{user.roles?.join(", ") || "customer"}</td>
                    <td>
                      <span className={`admin-status status-${String(user.status).toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.emailVerified ? "Yes" : "No"}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-danger-link"
                        disabled={
                          busyId === user.id ||
                          String(user.status).toLowerCase() === "suspended"
                        }
                        onClick={() => suspendUser(user.id)}
                      >
                        {busyId === user.id ? "Updating..." : "Suspend"}
                      </button>
                    </td>
                  </tr>
                ))}

                {!users.length && (
                  <tr>
                    <td colSpan="6" className="admin-empty-cell">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminUsers;
