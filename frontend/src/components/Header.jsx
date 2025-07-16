import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import ThemeToggle from "./ThemeToggle";
import { useAuthContext } from "../context/auth.context";
import getNavLinks from "../config/nav.js"; // ✅ import is fine

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { authUser, loading, logout } = useAuthContext();
  const navigate = useNavigate();

  const navLinks = getNavLinks(authUser); // ✅ call the function with authUser

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 shadow-sm">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 md:px-8" aria-label="Main navigation">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-white">
          Swap<span className="text-gray-800 dark:text-blue-400">ZY</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `relative text-sm font-medium transition duration-300 pb-1
                ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"}
                after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:scale-x-0 after:bg-blue-500 dark:after:bg-blue-400 after:transition-transform after:duration-300 after:origin-left
                ${isActive ? "after:scale-x-100" : "hover:after:scale-x-100"}`
              }
              aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            >
              {link.label}
            </NavLink>
          ))}

          {!loading && (authUser ? (
            <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
              Logout
            </button>
          ) : (
            <Link to="/login" className="text-sm text-blue-600 hover:underline">
              Login
            </Link>
          ))}

          <ThemeToggle />
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="text-gray-700 dark:text-gray-200"
          >
            {mobileOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 space-y-3 bg-white dark:bg-gray-900 border-t dark:border-gray-700 shadow">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block text-sm font-medium ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-800 dark:text-gray-200"}`
              }
              aria-current={({ isActive }) => (isActive ? "page" : undefined)}
            >
              {link.label}
            </NavLink>
          ))}

          {!loading && (authUser ? (
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="text-sm text-red-600"
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="text-sm text-blue-600">
              Login
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
