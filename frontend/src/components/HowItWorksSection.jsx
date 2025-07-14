// src/components/HowItWorksSection.jsx
import { FaUserGraduate, FaCamera, FaHandshake } from "react-icons/fa";
import { motion } from "framer-motion";
const MotionDiv = motion.div;

const steps = [
  {
    icon: <FaUserGraduate size={24} />,
    title: "Login with Your College ID",
    description:
      "Sign up securely using your student Google account. Only verified students allowed — for a safe, trusted network.",
  },
  {
    icon: <FaCamera size={24} />,
    title: "List or Browse Products",
    description:
      "Upload items you want to sell or browse products near your campus — books, gadgets, cycles, and more.",
  },
  {
    icon: <FaHandshake size={24} />,
    title: "Connect & Swap Instantly",
    description:
      "Chat in real-time, negotiate fairly, and complete your swap in person or via courier. No hidden fees!",
  },
];

const HowItWorksSection = () => {
  return (
    <section
      className="py-16 px-4 md:px-8 bg-white dark:bg-gray-900"
      id="how-it-works"
    >
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          How SwapZY Works
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12 text-lg">
          Just 3 simple steps to start buying, selling, or swapping items near your campus.
        </p>

        <div className="relative flex flex-col gap-10 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <MotionDiv
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 hover:scale-[1.015]"
            >
              {/* Step Number + Icon */}
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-bold shrink-0">
                  {index + 1}
                </span>
                <div className="text-blue-600 dark:text-blue-400">{step.icon}</div>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {step.description}
              </p>

              {/* Vertical progress line (Desktop) */}
              {index !== steps.length - 1 && (
                <div className="hidden lg:block absolute top-full left-5 w-px h-6 bg-blue-200 dark:bg-gray-600"></div>
              )}
            </MotionDiv>
          ))}
        </div>

        {/* Horizontal Progress (Mobile only) */}
        <div className="lg:hidden flex justify-between items-center mt-10 mx-auto max-w-xs">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-1 mx-1 rounded-full ${
                idx !== steps.length - 1
                  ? "bg-blue-400"
                  : "bg-blue-600"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
