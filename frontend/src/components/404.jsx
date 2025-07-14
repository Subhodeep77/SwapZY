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

      <div className="min-h-screen flex flex-col justify-center items-center px-4 text-center bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <img
          src={mascot}
          alt="SwapZY Mascot"
          className="w-44 h-auto drop-shadow-md"
        />

        <h1 className="mt-6 text-5xl font-bold tracking-tight">404</h1>
        <p className="mt-2 text-lg md:text-xl font-medium text-gray-500 dark:text-gray-400">
          Uh-oh! We couldn’t find that page.
        </p>

        <p className="mt-1 text-sm text-gray-400">
          It might have been removed or you mistyped the URL.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition"
        >
          Go back Home
        </Link>
      </div>
    </>
  );
};

export default NotFound;
