


import React, { useState } from "react";
import "./Report.css";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../util/UserContext";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";
import { toast } from "react-toastify";

const ReportForm = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username,
    reportedUsername: username,
    issue: "",
    issueDescription: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.issue === "" || formData.issueDescription === "") {
      toast.error("Please fill all the details");
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.post(`/report/create`, formData);
      toast.success(data.message);
      setFormData((prevState) => ({
        ...prevState,
        issue: "",
        issueDescription: "",
      }));
    } catch (error) {
  console.log(error);

  const errorMessage =
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0] ||
    "Cannot Report User.";

  toast.error(errorMessage);

  if (errorMessage === "Please Login") {
    localStorage.removeItem("userInfo");
    setUser(null);
    await axios.get("/auth/logout");
    navigate("/login");
  }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      {/* Back Arrow */}
      <button className="back-arrow" onClick={() => navigate(`/profile/${username}`)}>
        Back to Profile
      </button>

      <h1>
        Report Profile
        <span>@{username}</span>
      </h1>

      <div className="form-box">
        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label className="question" htmlFor="username">Your Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              readOnly
            />
          </div>

          <div className="form-group">
            <label className="question" htmlFor="reportedUsername">Username to be Reported</label>
            <input
              type="text"
              id="reportedUsername"
              name="reportedUsername"
              className="form-control"
              placeholder="Enter username to be reported"
              value={formData.reportedUsername}
              onChange={handleChange}
              readOnly
            />
          </div>

          <div className="form-divider" />

          <div className="form-group">
            <label className="question">Nature of the Issue</label>
            <div className="radio-group">
              <input
                type="radio"
                id="conduct"
                name="issue"
                value="Personal conduct"
                checked={formData.issue === "Personal conduct"}
                onChange={handleChange}
              />
              <label htmlFor="conduct">Personal Conduct</label>

              <input
                type="radio"
                id="expertise"
                name="issue"
                value="Professional expertise"
                checked={formData.issue === "Professional expertise"}
                onChange={handleChange}
              />
              <label htmlFor="expertise">Professional Expertise</label>

              <input
                type="radio"
                id="others"
                name="issue"
                value="Others"
                checked={formData.issue === "Others"}
                onChange={handleChange}
              />
              <label htmlFor="others">Others</label>
            </div>
          </div>

          <div className="form-group">
            <label className="question" htmlFor="issueDescription">Describe the Issue</label>
            <textarea
              id="issueDescription"
              name="issueDescription"
              className="form-control textarea-control"
              placeholder="Provide as much detail as possible..."
              value={formData.issueDescription}
              onChange={handleChange}
            />
          </div>

          <div className="submitButton">
            <button type="submit" className="submit-button">
              {loading ? (
                <Spinner animation="border" variant="light" size="sm" />
              ) : (
                "Submit Report"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ReportForm;
