"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaSearch, FaMapMarkerAlt, FaFilter, FaTimes } from "react-icons/fa";

import { supabase } from "@/lib/supabase-client";
import { Listing } from "@/types/listing";

const categories = [
  "Books",
  "Electronics",
  "Furniture",
  "Notes",
  "Clothing",
  "Sports",
  "Other",
];

export default function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("BROWSE LISTINGS ERROR:", error);
      setListings([]);
      setLoading(false);
      return;
    }

    setListings(data as Listing[]);
    setLoading(false);
  }

  function clearFilters() {
    setSearch("");
    setCategory("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
  }

  const filteredListings = listings.filter((listing) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      listing.title.toLowerCase().includes(searchText) ||
      listing.description.toLowerCase().includes(searchText);

    const matchesCategory = !category || listing.category === category;

    const matchesLocation =
      !location ||
      listing.location.toLowerCase().includes(location.toLowerCase());

    const matchesMinPrice = !minPrice || listing.price >= Number(minPrice);

    const matchesMaxPrice = !maxPrice || listing.price <= Number(maxPrice);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

  const hasFilters = search || category || location || minPrice || maxPrice;

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Browse Marketplace
          </h1>

          <p className="mt-2 text-gray-500">
            Find books, electronics, furniture and more from students on campus.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-3xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <FaFilter className="text-blue-600" />

            <h2 className="text-lg font-bold text-gray-800">
              Search & Filters
            </h2>
          </div>

          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search for books, electronics, furniture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <div className="relative">
              <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <input
              type="number"
              min="0"
              placeholder="Min price ₹"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <input
              type="number"
              min="0"
              placeholder="Max price ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 text-gray-800 placeholder:text-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-5 flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 transition"
            >
              <FaTimes />
              Clear all filters
            </button>
          )}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Listings</h2>

            <p className="text-sm text-gray-500 mt-1">
              {loading
                ? "Loading..."
                : `${filteredListings.length} ${
                    filteredListings.length === 1 ? "listing" : "listings"
                  } found`}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center shadow">
            <p className="text-gray-500">Loading listings...</p>
          </div>
        )}

        {/* No results */}
        {!loading && filteredListings.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow">
            <div className="text-5xl mb-4">🔍</div>

            <h2 className="text-2xl font-bold text-gray-800">
              No listings found
            </h2>

            <p className="mt-2 text-gray-500">
              Try changing your search or filters.
            </p>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Listings */}
        {!loading && filteredListings.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listing/${listing.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition"
              >
                <div className="overflow-hidden">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1">
                      {listing.title}
                    </h3>

                    <span className="font-bold text-blue-600 whitespace-nowrap">
                      ₹{listing.price}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {listing.description}
                  </p>

                  <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                    <FaMapMarkerAlt className="text-blue-500" />

                    <span className="line-clamp-1">{listing.location}</span>
                  </div>

                  <div className="mt-4">
                    <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                      {listing.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
