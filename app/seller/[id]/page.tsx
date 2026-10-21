"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaUser, FaMapMarkerAlt, FaBoxOpen } from "react-icons/fa";
import { supabase } from "@/lib/supabase-client";
import ListingCard from "@/components/ListingCard";
import { Listing } from "@/types/listing";

export default function SellerProfilePage() {
  const params = useParams();
  const sellerId = params.id as string;

  const [sellerName, setSellerName] = useState("Seller");
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sellerId) return;

    async function loadSellerProfile() {
      setLoading(true);
      setError("");

      try {
        const { data: sellerListings, error: listingsError } = await supabase
          .from("listings")
          .select("*")
          .eq("seller_id", sellerId)
          .order("created_at", { ascending: false });

        if (listingsError) throw listingsError;

        const results = (sellerListings ?? []) as Listing[];
        setListings(results);

        if (results.length > 0 && results[0].seller_name) {
          setSellerName(results[0].seller_name);
        }

        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (!authError && authData.user?.id === sellerId) {
          setMemberSince(authData.user.created_at);
        }
      } catch (err) {
        console.error("SELLER PROFILE ERROR:", err);
        setError("We couldn't load this seller's profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadSellerProfile();
  }, [sellerId]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/browse"
          className="mb-6 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to Browse
        </Link>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-50">
              <FaUser className="text-3xl text-blue-600" />
            </div>

            <div>
              <p className="text-sm font-medium text-blue-600">
                CampusMate Seller
              </p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                {sellerName}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {listings.length}{" "}
                {listings.length === 1 ? "listing" : "listings"}
              </p>

              {memberSince && (
                <p className="mt-1 text-sm text-gray-500">
                  Member since{" "}
                  {new Date(memberSince).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Listings by {sellerName}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Browse items offered by this seller.
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500">
              Loading seller profile...
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-6 text-center text-red-600">
              {error}
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
              <FaBoxOpen className="mx-auto text-4xl text-gray-300" />
              <h3 className="mt-4 font-semibold text-gray-800">
                No listings yet
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                This seller doesn't have any listings available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
