"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaHeart, FaMapMarkerAlt, FaTrash } from "react-icons/fa";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase-client";
import { Listing } from "@/types/listing";

type WishlistItem = {
  id: string;
  listing_id: string;
  listing: Listing | null;
};

export default function WishlistPage() {
  const router = useRouter();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login first.");
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("wishlists")
      .select(
        `
        id,
        listing_id,
        listings (*)
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("WISHLIST ERROR:", error);
      toast.error("Failed to load wishlist.");
      setLoading(false);
      return;
    }

    const formattedItems = (data ?? []).map((item: any) => ({
      id: item.id,
      listing_id: item.listing_id,
      listing: item.listings,
    }));

    setItems(formattedItems);
    setLoading(false);
  }

  async function removeFromWishlist(wishlistId: string, listingId: string) {
    setRemovingId(wishlistId);

    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("id", wishlistId)
      .eq("listing_id", listingId);

    if (error) {
      console.error("REMOVE WISHLIST ERROR:", error);
      toast.error("Failed to remove item.");
      setRemovingId(null);
      return;
    }

    setItems((current) => current.filter((item) => item.id !== wishlistId));

    toast.success("Removed from wishlist.");
    setRemovingId(null);
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
              <FaHeart className="text-red-500 text-xl" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>

              <p className="text-gray-500 mt-1">
                Items you've saved for later.
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center shadow">
            <p className="text-gray-500">Loading your wishlist...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && items.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow">
            <div className="text-5xl mb-4">❤️</div>

            <h2 className="text-2xl font-bold text-gray-800">
              Your wishlist is empty
            </h2>

            <p className="mt-2 text-gray-500">
              Save items you like and come back to them later.
            </p>

            <Link
              href="/browse"
              className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Browse Listings
            </Link>
          </div>
        )}

        {/* Wishlist */}
        {!loading && items.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const listing = item.listing;

              if (!listing) return null;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition"
                >
                  <Link href={`/listing/${listing.id}`}>
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-56 object-cover"
                    />
                  </Link>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/listing/${listing.id}`}>
                        <h2 className="text-lg font-bold text-gray-800 hover:text-blue-600 transition">
                          {listing.title}
                        </h2>
                      </Link>

                      <span className="font-bold text-blue-600 whitespace-nowrap">
                        ₹{listing.price}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {listing.description}
                    </p>

                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                      <FaMapMarkerAlt className="text-blue-500" />

                      <span>{listing.location}</span>
                    </div>

                    <div className="flex gap-3 mt-5">
                      <Link
                        href={`/listing/${listing.id}`}
                        className="flex-1 text-center bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        View
                      </Link>

                      <button
                        onClick={() => removeFromWishlist(item.id, listing.id)}
                        disabled={removingId === item.id}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition disabled:opacity-50"
                      >
                        <FaTrash />

                        {removingId === item.id ? "..." : "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
