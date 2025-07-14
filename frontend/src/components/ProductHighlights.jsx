// src/components/ProductHighlights.jsx
import { motion } from "framer-motion";
import { FaBook, FaBicycle, FaMobileAlt, FaLaptop } from "react-icons/fa";
const MotionDiv = motion.div;

const highlights = [
  {
    icon: <FaBook size={28} />,
    title: "Books",
    description: "Used textbooks, novels, and exam prep at unbeatable prices.",
  },
  {
    icon: <FaLaptop size={28} />,
    title: "Gadgets",
    description: "Laptops, headphones & tech essentials for student life.",
  },
  {
    icon: <FaBicycle size={28} />,
    title: "Cycles",
    description: "Pre-owned bikes for fast, eco-friendly campus travel.",
  },
  {
    icon: <FaMobileAlt size={28} />,
    title: "Phones",
    description: "Buy or sell smartphones, accessories, and wearables.",
  },
];

const ProductHighlights = () => {
  return (
    <section
      className="py-16 px-4 md:px-8 bg-blue-50 dark:bg-gray-800"
      id="categories"
    >
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Explore Popular Categories
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12 text-lg">
          From study material to student essentials, discover top-trending
          listings across campus.
        </p>

        {/* Responsive scrollable layout */}
        <div className="flex gap-4 overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 scroll-smooth scrollbar-hide">
          {highlights.map((item, idx) => (
            <MotionDiv
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              viewport={{ once: true, amount: 0.3 }}
              className="min-w-[260px] sm:min-w-0 flex-shrink-0 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-lg transition hover:-translate-y-1"
            >
              <div className="text-blue-600 dark:text-blue-400 mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductHighlights;
