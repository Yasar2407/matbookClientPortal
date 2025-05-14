import React, { useState, useEffect } from "react";
import axios from "axios";

// Environment Variables
const API_URL = import.meta.env.VITE_API_URL;
const ENTITY = import.meta.env.VITE_ENTITY;
const TOKEN = import.meta.env.VITE_TOKEN;

const CustomerPortal = () => {
  const [activeTab, setActiveTab] = useState("proposals");
  const [proposalData, setProposalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🖼️ **State for Image Upload**
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);

  // 📌 **Fetch data when Proposals tab is active**
  useEffect(() => {
    if (activeTab === "proposals") {
      const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
          console.log("API Call:", `${API_URL}/api/user/service/data/${ENTITY}/682304992932dc6825fe5e66`);
          const getResponse = await axios.get(
            `${API_URL}/api/user/service/data/${ENTITY}/682304992932dc6825fe5e66`,
            {
              headers: {
                Authorization: `Bearer ${TOKEN}`,
              },
            }
          );

          console.log("API Response:", getResponse.data);
          const data = getResponse.data.data;

          setProposalData({
            title: data["Id"],
            subtitle: data["Project Id"],
            image: data["Uploaded Image"],
            items: data["Line Items"].map((item) => ({
              name: item.Name,
              description: item.Category,
              code: item.Id,
              image: item["Product Image"],
              specs: JSON.parse(item.Specs),
            })),
          });
        } catch (err) {
          console.error(err);
          setError("Failed to fetch proposal data.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [activeTab]);

  // 📌 **Handle Image Upload**
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);

      // ⏳ Start uploading
      const formData = new FormData();
      formData.append("file", File);
    

      try {
        const response = await axios.post(`${API_URL}/api/user/service/681c4cdfbad3787228013c70`, formData, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Upload Response:", response.data);

        // ✅ If upload is successful, display response
        setUploadResponse(response.data.message || "Upload successful!");
      } catch (error) {
        console.error("Error during upload:", error);
        setUploadResponse("Failed to upload image.");
      }
    }
  };

  // 📌 **ProposalCard Component**
  const ProposalCard = ({ title, subtitle, image, items }) => {
    return (
      <div className="card">
        <h2 className="card-title">{title}</h2>
        <p className="card-subtitle">{subtitle}</p>

        <div className="upload-section">
          <input
            type="file"
            id="upload"
            accept="image/*"
            onChange={handleImageUpload}
            hidden
          />
          <label htmlFor="upload" className="upload-button">
            Upload Image
          </label>

          {previewImage && (
            <div className="image-preview">
              <img src={previewImage} alt="Uploaded Preview" />
            </div>
          )}

          {uploadResponse && (
            <p className="upload-response">{uploadResponse}</p>
          )}
        </div>

        <div className="card-product-grid">
          {items.map((item, index) => (
            <div key={index} className="card-product-card">
              <img
                src={item.image}
                alt={item.name}
                className="card-product-image"
              />

              <div className="card-product-info">
                <h4 className="card-product-title">{item.name}</h4>
                <p className="card-product-details">
                  <strong>Category:</strong> {item.description} <br />
                  <strong>Code:</strong> {item.code}
                </p>

                <ul className="card-specs-list">
                  {item.specs.map((spec, specIndex) => (
                    <li key={specIndex}>
                      <strong>Thickness:</strong> {spec.Thickness} <br />
                      <strong>Wear Layer:</strong> {spec["Wear Layer"]} <br />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="search-wrapper">
      <div className="search-container">
        <div className="tabs">
          <button
            onClick={() => setActiveTab("proposals")}
            className={`tab-button ${activeTab === "proposals" ? "active" : ""}`}
          >
            Proposals
          </button>
          <button
            onClick={() => setActiveTab("quotes")}
            className={`tab-button ${activeTab === "quotes" ? "active" : ""}`}
          >
            Quotes
          </button>
        </div>

        {activeTab === "proposals" && (
          <>
            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}
            {proposalData && (
              <ProposalCard
                title={proposalData.title}
                subtitle={proposalData.subtitle}
                image={proposalData.image}
                items={proposalData.items}
              />
            )}
          </>
        )}

        {activeTab === "quotes" && (
          <div className="card">
            <h2 className="card-title">Project Quote Summary</h2>
            <p className="quote-description">
              Detailed BOQ and breakdown per area.
            </p>
            <button className="quote-button">Download PDF Quote</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPortal;
