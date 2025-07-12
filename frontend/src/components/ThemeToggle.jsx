import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme(); // ✅ Gets values from context

  return (
    <button
      onClick={toggleTheme} // ✅ Toggles the theme
      className="p-2 rounded text-sm text-gray-800 dark:text-gray-100 bg-gray-200 dark:bg-gray-700" // ✅ Tailwind handles light/dark
    >
      {darkMode ? "🌙 Dark" : "☀️ Light"} {/* ✅ Label updates based on state */}
    </button>
  );
};

export default ThemeToggle;
