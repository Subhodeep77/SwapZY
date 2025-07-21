import { useEffect, useState } from "react";
import axios from "axios";

const useNearbyProducts = ({ location, page = 1, limit = 30 }) => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false); // Set false initially
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
        const res = await axios.get("/api/products/nearby", {
          params: {
            college: location.college,
            city: location.city,
            district: location.district,
            state: location.state,
            lng: location.lng,
            lat: location.lat,
            page,
            limit,
          },
        });

        setProducts(res.data.data || []);
        setTotal(res.data.total || 0);
        setError(null);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to fetch products");
        setProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchNearby();
  }, [location, page, limit]);

  return { products, total, loading, error };
};

export default useNearbyProducts;
