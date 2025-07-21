import { Link } from "react-router-dom";
import mascot from "../assets/swapzy_mascot.png"; // 🐿️ mascot image

const EmptyState = ({
  title = "Nothing to see here!",
  subtitle = "Looks like there's no data available at the moment.",
  ctaText = "Go Back Home",
  ctaLink = "/",
  showMascot = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-10 text-center bg-white dark:bg-gray-900">
      {showMascot && (
        <img
          src={mascot}
          alt="Empty State Mascot"
          className="w-36 h-auto mb-6 animate-bounce drop-shadow-sm opacity-90"
        />
      )}

      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
        {title}
      </h2>

      <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-md mb-6">
        {subtitle}
      </p>

      <Link
        to={ctaLink}
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow transition-all"
      >
        {ctaText}
      </Link>
    </div>
  );
};

export default EmptyState;
