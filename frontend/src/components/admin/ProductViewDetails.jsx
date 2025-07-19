import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../../components/Loader";

const ProductViewsDetails = ({ productId }) => {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    axios
      .get(`/api/admin/product-views/${productId}?page=1&limit=50`)
      .then((res) => setViews(res.data.views || []))
      .catch((err) => console.error("Failed to fetch views:", err))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <Loader />;

  return (
    <div>
      {views.length === 0 ? (
        <p className="text-gray-500">No views found for this product.</p>
      ) : (
        <ul className="space-y-2">
          {views.map((view) => (
            <li
              key={view._id}
              className="p-3 border border-gray-200 rounded bg-gray-50"
            >
              <div>
                <strong>Viewer:</strong> {view.viewerAppwriteId || view.ip}
              </div>
              <div>
                <strong>Viewed At:</strong>{" "}
                {new Date(view.viewedAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductViewsDetails;
