// src/components/Header.jsx
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow">
      <div className="text-xl font-bold">SwapZY</div>
      <div className="flex items-center gap-4">
        {/* Other nav items */}
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
