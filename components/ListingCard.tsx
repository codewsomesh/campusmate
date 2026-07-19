import Link from "next/link";
import Image from "next/image";
import { FaMapMarkerAlt, FaHeart } from "react-icons/fa";
import { Listing } from "@/types/listing";

interface Props {
  listing: Listing;
}

export default function ListingCard({ listing }: Props) {
  return (
    <Link href={`/listing/${listing.id}`}>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
        {/* Image */}
        <div className="relative overflow-hidden">
          <Image
            src={listing.image}
            alt={listing.title}
            width={500}
            height={300}
            className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Category Badge */}
          <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
            {listing.category}
          </span>

          {/* Wishlist */}
          <button className="absolute top-3 right-3 bg-white/90 backdrop-blur-md rounded-full p-2 shadow-md hover:bg-red-50 transition">
            <FaHeart className="text-gray-400 hover:text-red-500 transition" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
            {listing.title}
          </h3>

          <p className="mt-3 text-3xl font-extrabold text-blue-600">
            ₹{listing.price}
          </p>

          <div className="mt-4 flex items-center gap-2 text-gray-500">
            <FaMapMarkerAlt className="text-blue-500" />
            <span>{listing.location}</span>
          </div>

          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <div>
              <p className="text-xs text-gray-400">Seller</p>

              <p className="font-semibold text-gray-700">
                {listing.seller_name}
              </p>
            </div>

            <span className="text-sm text-blue-600 font-semibold">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
