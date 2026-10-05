import { useParams, Link } from "react-router";

function ProductDetails() {
  const { id } = useParams();

  return (
    <div className="products-page">

      <div className="product-card">

        <div className="product-image">
          Product Image
        </div>

        <div className="product-content">

          <p className="product-category">
            Electronics
          </p>

          <h1>
            Product {id}
          </h1>

          <p>
            This is the product description.
          </p>

          <h2>
            ₦45,000
          </h2>

          <button className="view-button">
            Add to Cart
          </button>

          <br />

          <Link to="/wishlist">
            Add to Wishlist
          </Link>

        </div>

      </div>

    </div>
  );
}

export default ProductDetails;