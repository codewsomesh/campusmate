export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <h2 className="text-2xl font-bold text-white">CampusMate</h2>

            <p className="mt-4 text-gray-400 leading-7">
              A marketplace where students can buy, sell, rent, and offer
              services within their college community.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>

            <ul className="space-y-2">
              <li>Home</li>
              <li>Browse Listings</li>
              <li>Categories</li>
              <li>Contact</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Developer</h3>

            <p>Somesh Pradhan</p>
            <p>B.Tech CSE (Data Science)</p>
            <p>SCMS School of Engineering & Technology</p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500">
          © 2026 CampusMate. Built with Next.js & Tailwind CSS.
        </div>
      </div>
    </footer>
  );
}
