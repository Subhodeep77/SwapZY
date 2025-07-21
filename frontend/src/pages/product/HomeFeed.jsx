import { useEffect, useState } from "react";
import useNearbyProducts from "../../hooks/useNearbyProducts";
import ProductCard from "../../components/product/ProductCard";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import PageHelmet from "../../components/PageHelmet";

const HomeFeed = () => {
  const [location, setLocation] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const college = localStorage.getItem("college");
    const city = localStorage.getItem("city");
    const state = localStorage.getItem("state");
    const lng = localStorage.getItem("lng");
    const lat = localStorage.getItem("lat");

    if (college && city && state && lng && lat) {
      setLocation({
        college,
        city,
        state,
        lng: parseFloat(lng),
        lat: parseFloat(lat),
      });
    } else {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          setLocation({
            college: "",
            city: "",
            state: "",
            lng: pos.coords.longitude,
            lat: pos.coords.latitude,
          });
        },
        () => {
          setLocation("denied"); // 📌 special marker for denied location
        }
      );
    }
  }, []);

  const { products, total, loading, error } = useNearbyProducts(
    location ? { location, page } : { location: null, page }
  );

  return (
    <main className="p-4">
      <PageHelmet
        title="Nearby Products"
        description="Discover products near your college or city with SwapZY's hyperlocal marketplace."
      />

      <h1 className="text-2xl font-bold mb-4">Products Near You</h1>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : location === null ? (
        <EmptyState
          title="Detecting Your Location..."
          subtitle="Please allow location access to show products near you."
          showMascot={true}
        />
      ) : location === "denied" ? (
        <EmptyState
          title="Location Access Denied"
          subtitle="We couldn't detect your location. Please enable location services and refresh the page."
          ctaText="How to Enable"
          ctaLink="/help/location-access"
          showMascot={true}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="No Nearby Products"
          subtitle="Looks like there are no listings near your location yet. Try checking back later or explore other categories!"
          ctaText="Explore Categories"
          ctaLink="/products"
          showMascot={true}
        />
      ) : (
        <section
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          aria-label="Nearby products grid"
        >
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </section>
      )}

      {total > 30 && (
        <nav
          className="mt-4 flex justify-center"
          aria-label="Pagination navigation"
        >
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded mr-2"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={products.length < 30}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </nav>
      )}
    </main>
  );
};

export default HomeFeed;
