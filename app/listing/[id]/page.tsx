import Image from "next/image";
import { listings } from "@/data/listings";
import { notFound } from "next/navigation";
import {
  FaMapMarkerAlt,
  FaUser,
  FaCheckCircle,
  FaCalendarAlt,
} from "react-icons/fa";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = listings.find((item) => item.id === Number(id));

  if (!listing) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-10 bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Image */}
          <div className="p-8">
            <Image
              src={listing.image}
              alt={listing.title}
              width={800}
              height={600}
              className="rounded-2xl w-full h-[500px] object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-8">
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
              {listing.category}
            </span>

            <h1 className="mt-5 text-4xl font-bold text-gray-800">
              {listing.title}
            </h1>

            <p className="mt-5 text-5xl font-extrabold text-blue-600">
              ₹{listing.price}
            </p>

            <div className="mt-6 flex items-center gap-2 text-green-600 font-medium">
              <FaCheckCircle />
              Excellent Condition
            </div>

            <p className="mt-8 leading-8 text-gray-600">
              This item is in excellent condition and has been carefully
              maintained by the owner. Perfect for students looking for a
              reliable product at an affordable price.
            </p>

            {/* Seller Card */}
            <div className="mt-10 rounded-2xl bg-gray-50 p-6 border">
              <h3 className="text-lg font-bold text-gray-800 mb-5">
                Seller Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600 gap-3">
                  <FaUser className="text-blue-600" />
                  <span>{listing.seller}</span>
                </div>

                <div className="flex items-center text-gray-600 gap-3">
                  <FaMapMarkerAlt className="text-blue-600" />
                  <span>{listing.location}</span>
                </div>

                <div className="flex items-center text-gray-600 gap-3">
                  <FaCalendarAlt className="text-blue-600" />
                  <span>Posted Recently</span>
                </div>
              </div>
            </div>

            <button className="mt-10 w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 hover:shadow-lg">
              Contact Seller
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
