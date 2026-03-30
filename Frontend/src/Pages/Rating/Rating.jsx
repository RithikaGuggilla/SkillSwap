


import React, { useState } from "react";
import "./Rating.css";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useUser } from "../../util/UserContext";
//const { username } = useParams();
//const navigate = useNavigate();
const Rating = () => {

  const { username } = useParams();   


  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  const handleSubmit = async (e) => {

e.preventDefault();

if (rating === 0) {
  toast.error("Please select a rating");
  return;
}

if (review.trim() === "") {
  toast.error("Please write a review");
  return;
}

try {
  setLoading(true);

  const { data } = await axios.post(
    `/rating/rate`,
    {
      rating,
      description: review,
      username: username,
    },
    { withCredentials: true }
  );

  




toast.success("Review submitted successfully!");

setRating(0);
setReview("");
setHovered(0);
setSubmitted(true);

setTimeout(() => {
  setSubmitted(false);
}, 2000);
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
        if (error.response.data.message === "Please Login") {
          localStorage.removeItem("userInfo");
          setUser(null);
          await axios.get("/auth/logout");
          navigate("/login");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const active = hovered || rating;

  return (
    <div className="rt-page">
      <div className="rt-bg-grid" />

      {/* Back Button */}
      <button className="rt-back" onClick={() => navigate(`/profile/${username}`)} aria-label="Go back">
        <span className="rt-back-arrow">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        Back
      </button>

      <div className="rt-card">
        {/* Header */}
        <div className="rt-header">
          <span className="rt-header-label">FEEDBACK</span>
          <h1 className="rt-title">Rate this User</h1>
          <p className="rt-subtitle">Your honest feedback helps the community grow</p>
        </div>

        <form onSubmit={handleSubmit} className="rt-form">

          {/* Stars */}
          <div className="rt-stars-section">
            <div className="rt-stars">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`rt-star ${v <= active ? "rt-star--filled" : ""}`}
                  onClick={() => setRating(v)}
                  onMouseEnter={() => setHovered(v)}
                  onMouseLeave={() => setHovered(0)}
                  aria-label={`Rate ${v} stars`}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="rt-label-row">
              <span className={`rt-rating-label ${active ? "rt-rating-label--visible" : ""}`}>
                {labels[active]}
              </span>
              <span className="rt-rating-num">{rating > 0 ? `${rating} / 5` : "—"}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="rt-divider" />

          {/* Textarea */}
          <div className="rt-field">
            <label className="rt-field-label">Your Review</label>
            <textarea
              className="rt-textarea"
              placeholder="Share your experience working with this person…"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={5}
            />
            <div className="rt-char-count">{review.length} / 500</div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`rt-submit ${submitted ? "rt-submit--done" : ""}`}
            disabled={loading || submitted}
          >
            {loading ? (
              <span className="rt-spinner" />
            ) : submitted ? (
              <>✓ Submitted</>
            ) : (
              "Submit Review"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Rating;


















































