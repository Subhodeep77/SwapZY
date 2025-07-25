import { useEffect, useState } from "react";
import axios from "axios";

const useNearbyProducts = ({
  location,
  page = 1,
  limit = 30,
  sort = "latest",
  minPrice,
  maxPrice,
  category,
  condition,
}) => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location || location === "denied") {
      setProducts([]);
      setTotal(0);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchNearby = async () => {
      setLoading(true);
      try {
        const params = {
          lng: location.lng,
          lat: location.lat,
          college: location.college,
          city: location.city,
          district: location.district,
          state: location.state,
          page,
          limit,
          sort,
        };

        if (minPrice !== undefined) params.minPrice = minPrice;
        if (maxPrice !== undefined) params.maxPrice = maxPrice;
        if (category) params.category = category;
        if (condition) params.condition = condition;

        const res = await axios.get("/api/products/nearby", { params });

        setProducts(res.data.data || []);
        setTotal(res.data.total || 0);
        setError(null);
      } catch (err) {
        setError(
          err?.response?.data?.error ||
          err.message ||
          "Failed to fetch nearby products"
        );
        setProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchNearby();
  }, [location, page, limit, sort, minPrice, maxPrice, category, condition]);

  return { products, total, loading, error };
};

export default useNearbyProducts;
