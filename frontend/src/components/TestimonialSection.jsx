// src/components/TestimonialSection.jsx
const testimonials = [
  {
    name: "Priya S.",
    college: "IIT Bombay",
    feedback:
      "SwapZY helped me sell my old books within a day. Super easy and student-friendly!",
  },
  {
    name: "Rahul M.",
    college: "NIT Trichy",
    feedback:
      "Loved the real-time chat and zero commission. Feels like OLX but made just for campus students.",
  },
  {
    name: "Ananya T.",
    college: "VIT Vellore",
    feedback:
      "The dashboard gives clear stats, and the mascot makes the platform feel fun and safe.",
  },
];

const TestimonialSection = () => {
  return (
    <section
      className="py-16 px-4 md:px-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
      id="testimonials"
    >
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          What Students Are Saying
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12 text-lg">
          Trusted across India’s top campuses — here’s how SwapZY is changing student commerce.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 text-left"
            >
              <p className="text-gray-800 dark:text-gray-100 mb-4 italic">
                “{item.feedback}”
              </p>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {item.name}
                </span>{" "}
                – {item.college}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
