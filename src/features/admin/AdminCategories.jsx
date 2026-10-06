import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./admin.css";

const initialForm = {
  name: "",
  description: "",
  active: true,
};

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCategories() {
    try {
      const response = await apiRequest("/categories");
      setCategories(response?.data || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load categories.");
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function createCategory(event) {
    event.preventDefault();

    try {
      setSaving(true);

      await apiRequest("/categories", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          active: true,
          parentId: null,
        }),
      });

      setForm(initialForm);
      setShowForm(false);
      setMessage("Category created.");
      setError("");
      await loadCategories();
    } catch (requestError) {
      setError(requestError.message || "Could not create category.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(categoryId) {
    try {
      setBusyId(categoryId);

      await apiRequest(`/categories/${categoryId}`, {
        method: "DELETE",
      });

      setCategories((current) =>
        current.filter((category) => category.id !== categoryId)
      );
      setMessage("Category deleted.");
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not delete category.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">CATALOG</p>
          <h1>Categories</h1>
          <p>Manage the product categories shown across the marketplace.</p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={() => setShowForm((value) => !value)}
        >
          {showForm ? "Close" : "+ New Category"}
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}
      {message && <div className="admin-success">{message}</div>}

      {showForm && (
        <form className="admin-category-form" onSubmit={createCategory}>
          <label>
            Category name
            <input
              name="name"
              value={form.name}
              onChange={updateForm}
              required
            />
          </label>

          <label>
            Description
            <input
              name="description"
              value={form.description}
              onChange={updateForm}
            />
          </label>

          <button className="admin-primary-button" disabled={saving}>
            {saving ? "Creating..." : "Create Category"}
          </button>
        </form>
      )}

      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td><strong>{category.name}</strong></td>
                  <td>{category.description || "—"}</td>
                  <td>
                    <span className="admin-status status-active">
                      {category.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-danger-link"
                      disabled={busyId === category.id}
                      onClick={() => deleteCategory(category.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {!categories.length && (
                <tr>
                  <td colSpan="5" className="admin-empty-cell">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminCategories;
