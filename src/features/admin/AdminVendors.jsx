import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./admin.css";

function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [codes, setCodes] = useState({});
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadVendors() {
    try {
      setLoading(true);
      const response = await apiRequest("/admin/vendors/pending");
      setVendors(response || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load vendor applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVendors();
  }, []);

  async function approve(vendorId) {
    const code = codes[vendorId]?.trim();

    if (!code) {
      setError("Enter the Paystack subaccount code provided for this seller.");
      return;
    }

    try {
      setBusyId(vendorId);

      await apiRequest(`/admin/vendors/${vendorId}/approve`, {
        method: "PATCH",
        body: JSON.stringify({ paystackSubaccountCode: code }),
      });

      setVendors((current) =>
        current.filter((vendor) => vendor.id !== vendorId)
      );
      setMessage("Vendor approved.");
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not approve vendor.");
    } finally {
      setBusyId("");
    }
  }

  async function reject(vendorId) {
    try {
      setBusyId(vendorId);

      await apiRequest(`/admin/vendors/${vendorId}/reject`, {
        method: "PATCH",
      });

      setVendors((current) =>
        current.filter((vendor) => vendor.id !== vendorId)
      );
      setMessage("Vendor application rejected.");
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not reject vendor.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">SELLERS</p>
          <h1>Vendor Applications</h1>
          <p>Approve or reject businesses requesting marketplace seller access.</p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}
      {message && <div className="admin-success">{message}</div>}

      <section className="admin-panel">
        {loading ? (
          <div className="admin-state">Loading applications...</div>
        ) : (
          <div className="vendor-application-list">
            {vendors.map((vendor) => (
              <article className="vendor-application-card" key={vendor.id}>
                <div className="vendor-application-main">
                  <div className="vendor-application-avatar">
                    {vendor.businessName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <small>PENDING APPLICATION</small>
                    <h2>{vendor.businessName}</h2>
                    <p>{vendor.businessDescription || "No description provided."}</p>
                    <span>{vendor.userName} · {vendor.userEmail}</span>
                  </div>
                </div>

                <div className="vendor-application-actions">
                  <label>
                    Paystack subaccount code
                    <input
                      value={codes[vendor.id] || ""}
                      onChange={(event) =>
                        setCodes((current) => ({
                          ...current,
                          [vendor.id]: event.target.value,
                        }))
                      }
                      placeholder="Provided seller subaccount code"
                    />
                  </label>

                  <div>
                    <button
                      type="button"
                      className="admin-approve-button"
                      disabled={busyId === vendor.id}
                      onClick={() => approve(vendor.id)}
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      className="admin-reject-button"
                      disabled={busyId === vendor.id}
                      onClick={() => reject(vendor.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {!vendors.length && (
              <div className="admin-mini-empty">
                No pending vendor applications.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminVendors;
