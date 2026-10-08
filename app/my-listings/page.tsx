"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FaPlus, FaMapMarkerAlt, FaTrash } from "react-icons/fa";

import { supabase } from "@/lib/supabase-client";
import { Listing } from "@/types/listing";

export default function MyListingsPage() {
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadMyListings();
  }, []);

  async function loadMyListings() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login first.");
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("MY LISTINGS ERROR:", error);
      toast.error("Failed to load your listings.");
      setLoading(false);
      return;
    }

    setListings(data as Listing[]);
    setLoading(false);
  }

  async function handleDelete(listing: Listing) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${listing.title}"?`,
    );

    if (!confirmed) return;

    setDeletingId(listing.id);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please login first.");
        router.push("/login");
        return;
      }

      /*
       * Delete the listing from the database.
       */
      const { error: deleteError } = await supabase
        .from("listings")
        .delete()
        .eq("id", listing.id)
        .eq("seller_id", user.id);

      if (deleteError) {
        console.error("DELETE LISTING ERROR:", deleteError);
        toast.error("Failed to delete listing.");
        setDeletingId(null);
        return;
      }

      /*
       * Try to remove the image from Supabase Storage.
       *
       * The database listing is already deleted, so even if
       * storage cleanup fails, the listing itself is gone.
       */
      try {
        const imageUrl = listing.image;

        if (imageUrl) {
          const marker = "/listing-images/";

          const index = imageUrl.indexOf(marker);

          if (index !== -1) {
            const filePath = decodeURIComponent(
              imageUrl.substring(index + marker.length),
            );

            await supabase.storage.from("listing-images").remove([filePath]);
          }
        }
      } catch (storageError) {
        console.error("STORAGE DELETE ERROR:", storageError);
      }

      setListings((current) =>
        current.filter((item) => item.id !== listing.id),
      );

      toast.success("Listing deleted successfully!");
    } catch (error) {
      console.error("DELETE ERROR:", error);
      toast.error("Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Listings</h1>

            <p className="mt-2 text-gray-500">
              Manage the items you have listed on CampusMate.
            </p>
          </div>

          <Link
            href="/sell"
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md"
          >
            <FaPlus />
            Sell Item
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow">
            <p className="text-gray-500">Loading your listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow">
            <h2 className="text-2xl font-bold text-gray-800">
              No listings yet
            </h2>

            <p className="mt-2 text-gray-500">
              You haven't listed anything for sale yet.
            </p>

            <Link
              href="/sell"
              className="inline-flex items-center gap-2 mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              <FaPlus />
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition"
              >
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-56 object-cover"
                />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-bold text-gray-800">
                      {listing.title}
                    </h2>

                    <span className="text-lg font-bold text-blue-600 whitespace-nowrap">
                      ₹{listing.price}
                    </span>
                  </div>

                  <p className="mt-3 text-gray-500 line-clamp-2">
                    {listing.description}
                  </p>

                  <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                    <FaMapMarkerAlt className="text-blue-500" />
                    {listing.location}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <Link
                      href={`/listing/${listing.id}`}
                      className="text-center border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition"
                    >
                      View
                    </Link>

                    <Link
                      href={`/edit-listing/${listing.id}`}
                      className="text-center bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Edit
                    </Link>
                  </div>

                  <button
                    onClick={() => handleDelete(listing)}
                    disabled={deletingId === listing.id}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white-50 py-2.5 font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                  >
                    <FaTrash />

                    {deletingId === listing.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
