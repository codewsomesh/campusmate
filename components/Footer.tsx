import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 bg-slate-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="text-xl font-bold text-white transition-colors hover:text-blue-400"
            >
              CampusMate
            </Link>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Buy, sell, and discover useful items within your campus community.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-3 font-semibold text-white">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/browse" className="footer-link">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/sell" className="footer-link">
                  Sell an Item
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="mb-3 font-semibold text-white">Your Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/wishlist" className="footer-link">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/messages" className="footer-link">
                  Messages
                </Link>
              </li>
              <li>
                <Link href="/my-listings" className="footer-link">
                  My Listings
                </Link>
              </li>
              <li>
                <Link href="/login" className="footer-link">
                  Login / Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety */}
          <div>
            <h3 className="mb-3 font-semibold text-white">Shop Smart</h3>
            <p className="text-sm leading-6 text-gray-400">
              Meet in public campus locations and inspect items before making a
              payment.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-7 flex flex-col gap-2 border-t border-gray-700 pt-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} CampusMate. All rights reserved.</p>
          <p>Built with Next.js &amp; Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}
