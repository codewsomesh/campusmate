import ListingCard from "./ListingCard";
import { getListings } from "@/lib/listings";

export default async function LatestListings() {
  const listings = await getListings();
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-800">
              Featured Listings
            </h2>

            <p className="mt-3 text-gray-500 max-w-xl">
              Discover popular items available across your campus. Browse
              textbooks, electronics, fashion, services, and more.
            </p>
          </div>

          <button className="mt-6 md:mt-0 text-blue-600 font-semibold hover:text-blue-700 transition">
            View All →
          </button>
        </div>

        {/* Listings Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
