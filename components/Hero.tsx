import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
      <div className="max-w-7xl mx-auto px-6 py-28 text-center">
        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
          CampusMate
        </h1>

        <h2 className="mt-3 text-2xl md:text-4xl font-medium text-blue-100">
          Buy • Sell • Rent • Connect
        </h2>

        {/* Description */}
        <p className="mt-8 max-w-3xl mx-auto text-lg md:text-xl text-blue-100 leading-8">
          CampusMate is a student-first marketplace where you can buy, sell,
          rent, and discover everything from textbooks and gadgets to fashion,
          ride sharing, and tutoring services—all within your college community.
        </p>

        {/* Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5">
          <Link
            href="/"
            className="bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
          >
            Browse Listings
          </Link>

          <Link
            href="/"
            className="border-2 border-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-700 transition-all duration-300"
          >
            Post a Listing
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-blue-100">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
            Built for Students
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
            Buy • Sell • Rent
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
            Campus Community
          </div>
        </div>
      </div>
    </section>
  );
}
