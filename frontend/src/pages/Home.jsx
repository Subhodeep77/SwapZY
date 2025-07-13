// src/pages/Home.jsx
import { motion } from "framer-motion";
import PageHelmet from "../components/PageHelmet";
import mascotImg from "../assets/swapzy-mascot.png";
import { Link } from "react-router-dom";
const MotionDiv = motion.div;

const Home = () => {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <PageHelmet
        title="SwapZY | College Marketplace for Students"
        description="Buy and sell used gadgets, books, and more on SwapZY. Built for students. Hyperlocal and hassle-free."
      />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 flex flex-col-reverse md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Find. Swap. Save.
            <br className="hidden md:block" /> On Campus.
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Join India’s fastest growing student marketplace to discover pre-loved gadgets,
            books, and more near your college.
          </p>
          <Link
            to="/login"
            className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition"
          >
            Start Exploring
          </Link>
        </div>

        <MotionDiv
          className="flex-1 flex justify-center"
          initial={{ y: 0 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <img
            src={mascotImg}
            alt="SwapZY Mascot"
            className="w-64 h-auto drop-shadow-xl"
            loading="lazy"
          />
        </MotionDiv>
      </section>

      {/* Features Section */}
      <section className="bg-blue-50 dark:bg-gray-800 py-14">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "List in Seconds",
              desc: "Upload a product with image, price, and description in under a minute."
            },
            {
              title: "No Middlemen",
              desc: "Connect directly with students around you. Chat, negotiate, and swap."
            },
            {
              title: "Safe College Zone Deals",
              desc: "Verified students only. Stay secure inside your campus community."
            }
          ].map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white dark:bg-gray-700 shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 text-center text-sm text-gray-500 dark:text-gray-400 py-6">
        © {new Date().getFullYear()} SwapZY. Built for Students.
      </footer>
    </main>
  );
};

export default Home;
