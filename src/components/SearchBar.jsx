import React, { useState } from 'react';
import { Search } from 'lucide-react';
import './styles.css';

const filters = ["All", "Vinyl Flooring", "Tiles", "Quartz"];

const SearchBar = ({ onFilterChange, onSearchChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState("All");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value, activeFilter);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    onFilterChange(filter, searchTerm);
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-container">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="Search product by name or code..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Tags aligned at the bottom */}
      <div className="filter-tags">
        {filters.map((filter) => (
          <span
            key={filter}
            className={`filter-tag ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => handleFilterChange(filter)}
          >
            {filter}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
