import { useState } from "react";

function Reviews() {

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  function submitReview() {

    if (rating === 0 || review === "") {
      alert("Please enter a rating and review");
      return;
    }

    alert("Review submitted");

    setRating(0);
    setReview("");
  }

  return (
    <div className="products-page">

      <h1>Product Review</h1>

      <div className="product-card">

        <div className="product-content">

          <h2>
            Wireless Headphones
          </h2>

          <h3>
            Rating
          </h3>

          <div>
            {[1, 2, 3, 4, 5].map((number) => (
              <button
                key={number}
                onClick={() => setRating(number)}
              >
                {number <= rating ? "★" : "☆"}
              </button>
            ))}
          </div>

          <textarea
            value={review}
            onChange={(event) =>
              setReview(event.target.value)
            }
            placeholder="Write your review..."
          />

          <br />

          <button onClick={submitReview}>
            Submit Review
          </button>

        </div>

      </div>

    </div>
  );
}

export default Reviews;