import './SearchFilters.css'

function SearchFilters({ filters, onFilterChange }) {
  const categories = ['all', 'Trending', 'Fan Favorite', 'Chill', 'Niche']

  return (
    <div className="search-filters">
      <div className="filter-group">
        <input
          type="text"
          placeholder="Search events..."
          className="search-input"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
      </div>

      <div className="filter-group">
        <select
          className="filter-select"
          value={filters.category}
          onChange={(e) => onFilterChange({ category: e.target.value })}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <input
          type="date"
          className="filter-input"
          value={filters.date}
          onChange={(e) => onFilterChange({ date: e.target.value })}
        />
      </div>

      <div className="filter-group">
        <input
          type="text"
          placeholder="Location..."
          className="filter-input"
          value={filters.location}
          onChange={(e) => onFilterChange({ location: e.target.value })}
        />
      </div>
    </div>
  )
}

export default SearchFilters

