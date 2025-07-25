import { Link } from "react-router-dom";
import PageHelmet from "../components/PageHelmet";
import mascot from "../assets/swapzy_mascot.png";

const NotFound = () => {
  return (
    <>
      <PageHelmet
        title="404 - Page Not Found"
        description="Oops! The page you're looking for doesn't exist. Return to SwapZY to continue exploring great deals and listings."
      />

      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <img
          src={mascot}
          alt="SwapZY Mascot"
          className="w-48 h-auto mb-6 animate-bounce"
        />

        <h1 className="text-6xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
          404
        </h1>

        <p className="mt-4 text-xl md:text-2xl font-semibold">
          Uh-oh! We couldn’t find that page.
        </p>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md text-center">
          The page you're looking for might have been removed or you might have mistyped the URL. Let's get you back on track.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg shadow-lg transition"
        >
          ⬅ Go back to Homepage
        </Link>
      </div>
    </>
  );
};

export default NotFound;
