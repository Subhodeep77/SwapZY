// src/components/FAQSection.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
const MotionDiv = motion.div;

const faqs = [
  {
    id: "faq-free",
    question: "Is SwapZY free to use?",
    answer: "Yes! SwapZY is completely free for students to list, buy, and swap items on campus.",
  },
  {
    id: "faq-join",
    question: "Who can join SwapZY?",
    answer: "Only students with a verified college email can join. This ensures a trusted and safe community.",
  },
  {
    id: "faq-contact",
    question: "How do I contact a seller?",
    answer: "You can directly message sellers using our built-in real-time chat once you're logged in.",
  },
  {
    id: "faq-edit",
    question: "Can I edit or delete my listings?",
    answer: "Absolutely! You can manage all your listings from your dashboard anytime.",
  },
];

const FAQItem = ({ faq, isOpen, toggle }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700" id={faq.id}>
      <button
        onClick={toggle}
        className="w-full text-left py-4 flex justify-between items-center group"
        aria-expanded={isOpen}
        aria-controls={`${faq.id}-answer`}
      >
        <span className="text-base font-medium text-gray-800 dark:text-white">
          {faq.question}
        </span>
        <span
          className={`transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <MotionDiv
            key="content"
            id={`${faq.id}-answer`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-gray-600 dark:text-gray-300 pb-4 pr-2">
              {faq.answer}
            </p>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
    // Update hash in URL
    if (faqs[idx]) {
      window.history.replaceState(null, "", `#${faqs[idx].id}`);
    }
  };

  // Open FAQ item based on hash
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const idx = faqs.findIndex((f) => f.id === hash);
    if (idx !== -1) {
      setOpenIndex(idx);
      // Smooth scroll into view
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, []);

  return (
    <section
      id="faqs"
      className="bg-white dark:bg-gray-900 py-16 px-4 md:px-8"
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-12 text-lg">
          Got questions? We’ve got answers to help you get started.
        </p>

        <div className="text-left divide-y divide-gray-200 dark:divide-gray-700">
          {faqs.map((faq, idx) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isOpen={openIndex === idx}
              toggle={() => toggle(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
