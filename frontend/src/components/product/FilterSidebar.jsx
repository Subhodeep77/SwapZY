import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

const categories = ["Electronics", "Books", "Clothing", "Stationery", "Sports"];
const conditions = ["new", "like-new", "used"];
const sortOptions = [
  { label: "Latest", value: "latest" },
  { label: "Price: Low to High", value: "price_low" },
  { label: "Price: High to Low", value: "price_high" },
];

const FilterSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [condition, setCondition] = useState(searchParams.get("condition") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "latest");

  // Update URL params when any filter changes
  useEffect(() => {
    const params = {};

    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (condition) params.condition = condition;
    if (sort) params.sort = sort;

    setSearchParams(params);
  }, [category, minPrice, maxPrice, condition, sort]);

  const clearFilters = () => {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setCondition("");
    setSort("latest");
    setSearchParams({});
  };

  return (
    <div className="w-full md:w-64 p-4 bg-white border rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>

      <div className="mb-4">
        <label className="block font-medium mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Price Range (₹)</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-1/2 p-2 border rounded"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-1/2 p-2 border rounded"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Condition</label>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Any</option>
          {conditions.map((cond) => (
            <option key={cond} value={cond}>
              {cond.replace("-", " ").toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Sort By</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={clearFilters}
        className="w-full mt-2 text-sm bg-gray-100 hover:bg-gray-200 rounded p-2"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default FilterSidebar;
