import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import useNearbyProducts from "../../hooks/useNearbyProducts";

const sortOptions = [
  { label: "Latest", value: "latest" },
  { label: "Price: Low to High", value: "price_low" },
  { label: "Price: High to Low", value: "price_high" },
  { label: "Nearest", value: "nearest" },
];

const SortDropdown = ({ onData }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSort = searchParams.get("sort") || "latest";

  const [sort, setSort] = useState(currentSort);
  const [location, setLocation] = useState(null);

  const filters = Object.fromEntries(searchParams);

  const { products: nearbyProducts, loading: nearbyLoading } = useNearbyProducts({
    location,
    page: 1,
    limit: 30,
    filters,
  });

  // ✅ Get user's current coordinates and fetch enriched location data from backend
  useEffect(() => {
    if (sort === "nearest" && !location) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };

          try {
            // ✅ No lat/lng passed to backend, it uses IP-based fallback internally
            const res = await axios.get("/api/user-location");

            const locationData = {
              ...coords,
              college: res.data.college || "",
              city: res.data.city || "",
              district: res.data.district || "",
              state: res.data.state || "",
            };

            setLocation(locationData);
          } catch (err) {
            console.error("Failed to fetch detailed location:", err);
          }
        },
        (err) => {
          console.error("Location access denied:", err);
          setLocation("denied");
        }
      );
    }
  }, [location, sort]);

  // Update sort param in URL when changed
  useEffect(() => {
    const updatedParams = new URLSearchParams(searchParams);

    if (sort && sort !== "latest") {
      updatedParams.set("sort", sort);
    } else {
      updatedParams.delete("sort");
    }

    setSearchParams(updatedParams);
  }, [searchParams, setSearchParams, sort]);

  // Send nearby products to parent when loaded
  useEffect(() => {
    if (sort === "nearest" && nearbyProducts) {
      onData(nearbyProducts);
    }
  }, [nearbyProducts, onData, sort]);

  return (
    <div className="flex items-center gap-2 text-sm mb-4">
      <label htmlFor="sort" className="font-medium">
        Sort By:
      </label>
      <select
        id="sort"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="p-2 border rounded"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* ✅ Loading indicator for nearby fetch */}
      {sort === "nearest" && nearbyLoading && (
        <span className="text-gray-500 text-xs ml-2">
          Finding products near you...
        </span>
      )}
    </div>
  );
};

export default SortDropdown;
