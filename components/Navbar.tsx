import Link from "next/link";
import { FaStore } from "react-icons/fa";
import UserMenu from "./UserMenu";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md">
            <FaStore className="text-xl" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">CampusMate</h1>
            <p className="text-xs text-gray-500 -mt-1">
              Your Campus Marketplace
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Home
          </Link>

          <Link
            href="/"
            className="text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Browse
          </Link>

          <Link
            href="/"
            className="text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Categories
          </Link>

          <Link
            href="/"
            className="text-gray-700 hover:text-blue-600 font-medium transition"
          >
            About
          </Link>
        </div>

        {/* Right Side */}
        <UserMenu />
      </div>
    </nav>
  );
}
