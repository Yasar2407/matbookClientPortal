import React, { useEffect, useState } from "react";
import axios from "axios";
import SearchBar from "./SearchBar";

const API_URL = import.meta.env.VITE_API_URL;
const ENTITY_PRODUCT = import.meta.env.VITE_ENTITY_PRODUCT;
const TOKEN = import.meta.env.VITE_TOKEN;

const ProductCards = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_URL}/api/user/service/${ENTITY_PRODUCT}`,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );

      const formattedProducts = response.data.map((product) => ({
        id: product.data["Id"],
        name: product.data["Name"],
        category: product.data["Category"],
        brand: product.data["Brand"],
        msrp: product.data["msrp"],
        image: product.data["Product Image"],
      }));

      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
    } catch (err) {
      console.error("Error fetching products:", err.message);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearchChange = (searchTerm, filter) => {
    let filtered = products;

    if (filter !== "All") {
      filtered = filtered.filter((product) => product.category === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (filter, searchTerm) => {
    handleSearchChange(searchTerm, filter);
  };

  return (
    <div>
      <SearchBar onFilterChange={handleFilterChange} onSearchChange={handleSearchChange} />
      <div className="card">
        <div className="product-grid">
          {loading && <p>Loading products...</p>}
          {error && <p className="error">{error}</p>}
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
                onError={(e) => (e.target.src = '/placeholder.jpg')}
              />
              <div className="product-info">
                <h4 className="product-title">{product.category}</h4>
                <p className="product-details">{product.name}</p>
                <div className="product-meta">
                  <span>Brand: {product.brand}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCards;
