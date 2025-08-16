import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../../utils/axios";
import Loader from "../../components/Loader";

const ProductViewsDetails = ({ productId }) => {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const limitFromUrl = parseInt(searchParams.get("limit") || "50", 10);

  const [page, setPage] = useState(pageFromUrl);
  const [limit, setLimit] = useState(limitFromUrl);

  // Ref to prevent duplicate API call on initial load
  const firstRender = useRef(true);

  useEffect(() => {
    // Only update URL params if page/limit changes from user interaction
    if (!firstRender.current) {
      const params = new URLSearchParams(searchParams);
      params.set("page", page);
      params.set("limit", limit);
      setSearchParams(params);
    }
  }, [page, limit, searchParams, setSearchParams]);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);

    API.get(`/api/admin/product-views/${productId}?page=${page}&limit=${limit}`)
      .then((res) => {
        setViews(res.data.views || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      })
      .catch((err) => console.error("Failed to fetch views:", err))
      .finally(() => setLoading(false));

    firstRender.current = false; // Mark first render done after first API call
  }, [productId, page, limit]);

  if (loading) return <Loader />;

  return (
    <div>
      {views.length === 0 ? (
        <p className="text-gray-500">No views found for this product.</p>
      ) : (
        <>
          <ul className="space-y-2">
            {views.map((view) => (
              <li
                key={view._id}
                className="p-3 border border-gray-200 rounded bg-gray-50"
              >
                <div>
                  <strong>Viewer:</strong>{" "}
                  {view.viewerAppwriteId || view.ip || "Unknown"}
                </div>
                <div>
                  <strong>Viewed At:</strong>{" "}
                  {new Date(view.viewedAt).toLocaleString("en-IN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination Controls */}
          <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>

            {/* Limit Selector */}
            <div className="flex gap-2 items-center">
              <label htmlFor="limit" className="text-sm text-gray-700">
                Per Page:
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1"
              >
                {[10, 25, 50, 100, 200].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductViewsDetails;
