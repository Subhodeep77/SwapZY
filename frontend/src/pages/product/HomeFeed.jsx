import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import PageHelmet from "../../components/PageHelmet";
import FilterSidebar from "../../components/product/FilterSidebar";
import ProductCard from "../../components/product/ProductCard";
import SearchInput from "../../components/product/SearchInput";
import Loader from "../../components/Loader";
import SortDropdown from "../../components/product/SortDropDown";

import emptyMascot from "../../assets/swapzy_mascot.png"; // 🧸 Add your image in /assets

const HomeFeed = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const bottomRef = useRef(null);

  // ✅ Reset scroll to top on filter/search/sort change
  const previousSearch = useRef(searchParams.toString());

  useEffect(() => {
    const current = searchParams.toString();
    if (current !== previousSearch.current) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      previousSearch.current = current;
    }
  }, [searchParams]);

  // Handles updates from SortDropdown when "Nearest" is selected
  const handleNearbyData = (nearbyProducts) => {
    setProducts(nearbyProducts);
    setHasMore(false); // Disable infinite scroll for nearest
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/products/all", {
        params: {
          page,
          limit: 12,
          ...Object.fromEntries(searchParams.entries()),
        },
      });

      const newProducts = res.data.products || [];

      setProducts((prev) =>
        page === 1 ? newProducts : [...prev, ...newProducts]
      );
      setHasMore(newProducts.length > 0);
    } catch (err) {
      console.error("❌ Fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [page, searchParams]);

  // Reset to page 1 on filter/search/sort change
  useEffect(() => {
    setPage(1);
  }, [searchParams]);

  // Trigger product fetch
  useEffect(() => {
    if (searchParams.get("sort") !== "nearest") {
      fetchProducts();
    }
  }, [page, fetchProducts, searchParams]);

  // Infinite scroll setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: "100px" } // ✅ preload earlier
    );

    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (bottomRef.current) observer.unobserve(bottomRef.current);
    };
  }, [loading, hasMore]);

  return (
    <>
      <PageHelmet
        title="Buy & Sell Campus Essentials"
        description="Find second-hand books, gadgets, furniture & more from your college. Filter by price, condition, and category easily!"
      />

      <div className="container mx-auto px-4 py-6">
        <SearchInput />
        <SortDropdown onData={handleNearbyData} />

        <div className="flex flex-col md:flex-row gap-4">
          <FilterSidebar/>

          <section className="flex-1">
            {products.length === 0 && !loading ? (
              <div className="flex flex-col items-center mt-16">
                <img
                  src={emptyMascot}
                  alt="No products found"
                  className="w-48 h-48 opacity-80 mb-4"
                />
                <p className="text-center text-gray-500 text-lg">
                  Oops! No products match your filters 😔
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Loader / Infinite Scroll Trigger */}
            <div ref={bottomRef} className="mt-8">
              {loading && <Loader />}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default HomeFeed;
