// src/components/FeatureSection.jsx
const features = [
  {
    title: "🎓 Verified Student Access",
    description:
      "Only .edu or college-verified emails allowed — ensuring a trusted student community.",
  },
  {
    title: "📦 Buy, Sell & Swap Effortlessly",
    description:
      "List your unused books, gadgets, or accessories. Connect with nearby students instantly.",
  },
  {
    title: "💬 Real-time Chat",
    description:
      "Chat directly with buyers or sellers without sharing your number. Safe and secure.",
  },
  {
    title: "📊 Dashboard Insights",
    description:
      "Track views, wishlist stats, and your product performance in one sleek dashboard.",
  },
  {
    title: "🔔 Instant Notifications",
    description:
      "Get notified when someone messages you, wishlist your product, or places an order.",
  },
  {
    title: "🛡️ Zero Commission",
    description:
      "You keep 100% of what you earn — we’re here to connect students, not take a cut.",
  },
];

const FeatureSection = () => {
  return (
    <section
      className="py-16 px-4 md:px-8 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
      id="features"
    >
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Why Choose <span className="text-blue-600">SwapZY</span>?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12 text-lg">
          Built exclusively for students to make campus trading safe, fast, and reliable.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-blue-50/40 dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
