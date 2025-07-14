// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { FaEnvelope, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import mascot from "../assets/swapzy_mascot.png";

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-10 px-4 md:px-8 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Tagline */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <img
              src={mascot}
              alt="SwapZY Mascot"
              width="40"
              height="40"
              loading="lazy"
              className="w-10 h-10"
            />
            <span className="font-bold text-lg text-gray-900 dark:text-white">SwapZY</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            The hyperlocal marketplace for students to buy, sell, and swap easily.
          </p>
        </div>

        {/* Explore */}
        <div>
          <h4 className="text-gray-900 dark:text-white font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li><Link to="/about" className="hover:underline">About Us</Link></li>
            <li><Link to="/how-it-works" className="hover:underline">How It Works</Link></li>
            <li><Link to="/faq" className="hover:underline">FAQs</Link></li>
            <li><Link to="/terms" className="hover:underline">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-gray-900 dark:text-white font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>
              <a
                href="mailto:support@swapzy.in"
                className="inline-flex items-center gap-2 hover:underline"
              >
                <FaEnvelope className="text-blue-600" />
                support@swapzy.in
              </a>
            </li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h4 className="text-gray-900 dark:text-white font-semibold mb-3">Follow Us</h4>
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-blue-600"
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="hover:text-blue-600"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-blue-600"
            >
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 text-center text-gray-500 dark:text-gray-400 text-xs">
        © {new Date().getFullYear()} SwapZY. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
