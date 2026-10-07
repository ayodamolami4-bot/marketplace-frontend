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

  async function updateUserStatus(user) {
    const isSuspended =
      String(user.status).toLowerCase() === "suspended";

    const endpoint = isSuspended
      ? `/admin/users/${user.id}/activate`
      : `/admin/users/${user.id}/suspend`;

    try {
      setBusyId(user.id);

      const updated = await apiRequest(endpoint, {
        method: "PATCH",
      });

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id ? updated : currentUser
        )
      );

      setError("");
    } catch (requestError) {
      setError(
        requestError.message ||
          (isSuspended
            ? "Could not reactivate user."
            : "Could not suspend user.")
      );
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
                {users.map((user) => {
                  const isSuspended =
                    String(user.status).toLowerCase() === "suspended";

                  return (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.name}</strong>
                        <small className="admin-table-sub">{user.email}</small>
                      </td>
                      <td>{user.roles?.join(", ") || "customer"}</td>
                      <td>
                        <span
                          className={`admin-status status-${String(
                            user.status
                          ).toLowerCase()}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td>{user.emailVerified ? "Yes" : "No"}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          type="button"
                          className={
                            isSuspended
                              ? "admin-approve-button"
                              : "admin-danger-link"
                          }
                          disabled={busyId === user.id}
                          onClick={() => updateUserStatus(user)}
                        >
                          {busyId === user.id
                            ? "Updating..."
                            : isSuspended
                              ? "Unsuspend"
                              : "Suspend"}
                        </button>
                      </td>
                    </tr>
                  );
                })}

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
