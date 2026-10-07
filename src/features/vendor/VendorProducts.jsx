import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./vendor.css";

function money(value = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

const initialForm = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  stock: "",
};

function VendorProducts() {
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const [inventoryResponse, categoryResponse] = await Promise.all([
        apiRequest("/vendor/inventory"),
        apiRequest("/categories"),
      ]);

      setInventory(inventoryResponse?.data || []);
      setCategories(categoryResponse?.data || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function uploadImage() {
    if (!imageFile) return [];

    const data = new FormData();
    data.append("file", imageFile);

    const uploaded = await apiRequest("/vendor/media/images", {
      method: "POST",
      body: data,
    });

    return uploaded?.secureUrl ? [uploaded.secureUrl] : [];
  }

  async function createProduct(event) {
    event.preventDefault();
    if (!form.name.trim() || form.name.trim().length > 200 || form.description.length > 2000 || !form.categoryId) {
      setError('Enter a product name (up to 200 characters), choose a category, and keep the description within 2000 characters.'); return;
    }
    if (form.price === '' || !Number.isFinite(Number(form.price)) || Number(form.price) < 0 || form.stock === '' || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      setError('Enter a non-negative price and a whole-number stock quantity.'); return;
    }
    if (imageFile && (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(imageFile.type) || imageFile.size > 10 * 1024 * 1024)) {
      setError('Choose a JPEG, PNG, WebP or GIF image of at most 10 MB.'); return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const images = await uploadImage();

      await apiRequest("/products", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Math.round(Number(form.price) * 100),
          categoryId: form.categoryId,
          stock: Number(form.stock),
          images,
        }),
      });

      setForm(initialForm);
      setImageFile(null);
      setShowForm(false);
      setMessage("Product created successfully.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message || "Could not create product.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStock(item) {
    const value = editingStock[item.id];

    if (value === undefined || value === "") return;
    if (!Number.isInteger(Number(value)) || Number(value) < 0) { setError('Stock must be a non-negative whole number.'); return; }

    try {
      setSaving(true);
      const updated = await apiRequest(`/vendor/inventory/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ stock: Number(value) }),
      });

      setInventory((current) =>
        current.map((product) =>
          product.id === item.id ? updated : product
        )
      );

      setEditingStock((current) => {
        const next = { ...current };
        delete next[item.id];
        return next;
      });

      setMessage("Stock updated.");
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not update stock.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="vendor-page">
      <div className="vendor-page-heading">
        <div>
          <p className="eyebrow">CATALOG</p>
          <h1>Products</h1>
          <p>Manage your listings, pricing and inventory.</p>
        </div>

        <button
          type="button"
          className="vendor-primary-button"
          onClick={() => setShowForm((value) => !value)}
        >
          {showForm ? "Close Form" : "+ Add Product"}
        </button>
      </div>

      {error && <div className="form-error vendor-feedback">{error}</div>}
      {message && <div className="vendor-success vendor-feedback">{message}</div>}

      {showForm && (
        <form className="vendor-product-form" onSubmit={createProduct}>
          <div className="vendor-form-head">
            <div>
              <h2>Create Product</h2>
              <p>Add a new product to your marketplace store.</p>
            </div>
          </div>

          <div className="vendor-form-grid">
            <label>
              Product name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Category
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={updateField}
                required
              >
                <option value="">Choose category</option>
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Price (₦)
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Stock
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={updateField}
                required
              />
            </label>

            <label className="vendor-form-wide">
              Description
              <textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={updateField}
              />
            </label>

            <label className="vendor-form-wide">
              Product image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) =>
                  setImageFile(event.target.files?.[0] || null)
                }
              />
              <small>
                Image uploads through the backend to Cloudinary.
              </small>
            </label>
          </div>

          <button
            className="vendor-primary-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Publish Product"}
          </button>
        </form>
      )}

      <section className="vendor-panel">
        <div className="vendor-panel-heading">
          <div>
            <h2>Inventory</h2>
            <p>{inventory.length} products in your store</p>
          </div>
        </div>

        {loading ? (
          <div className="vendor-state">Loading products...</div>
        ) : (
          <div className="vendor-table-wrap">
            <table className="vendor-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Update Stock</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>{money(item.price)}</td>
                    <td>
                      <span className={item.stock <= 5 ? "stock-low" : ""}>
                        {item.stock}
                      </span>
                    </td>
                    <td>
                      <span className="vendor-status">
                        {String(item.status).replaceAll("_", " ")}
                      </span>
                    </td>
                    <td>
                      <div className="stock-edit">
                        <input
                          type="number"
                          min="0"
                          value={editingStock[item.id] ?? ""}
                          placeholder={String(item.stock)}
                          onChange={(event) =>
                            setEditingStock((current) => ({
                              ...current,
                              [item.id]: event.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => updateStock(item)}
                          disabled={saving}
                        >
                          Save
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!inventory.length && (
                  <tr>
                    <td colSpan="5" className="vendor-empty-cell">
                      No products yet. Add your first product above.
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

export default VendorProducts;
