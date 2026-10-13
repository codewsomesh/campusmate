"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaMapMarkerAlt, FaHeart } from "react-icons/fa";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase-client";
import { Listing } from "@/types/listing";

interface Props {
  listing: Listing;
}

export default function ListingCard({ listing }: Props) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadWishlistStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active || !user) return;

      const { data, error } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", listing.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error("WISHLIST STATUS ERROR:", error);
        return;
      }

      setIsWishlisted(!!data);
      setWishlistId(data?.id ?? null);
    }

    loadWishlistStatus();

    return () => {
      active = false;
    };
  }, [listing.id]);

  async function toggleWishlist(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (wishlistLoading) return;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      toast.error("Please log in to use your wishlist.");
      router.push("/login");
      return;
    }

    setWishlistLoading(true);

    try {
      if (isWishlisted) {
        let query = supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listing.id);

        if (wishlistId) {
          query = query.eq("id", wishlistId);
        }

        const { error } = await query;

        if (error) throw error;

        setIsWishlisted(false);
        setWishlistId(null);
        toast.success("Removed from wishlist");
      } else {
        const { data, error } = await supabase
          .from("wishlists")
          .insert({
            user_id: user.id,
            listing_id: listing.id,
          })
          .select("id")
          .single();

        if (error) {
          if (error.code === "23505") {
            setIsWishlisted(true);
            toast.info("Already in your wishlist");
            return;
          }

          throw error;
        }

        setIsWishlisted(true);
        setWishlistId(data.id);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("WISHLIST UPDATE ERROR:", error);
      toast.error("Couldn't update your wishlist. Please try again.");
    } finally {
      setWishlistLoading(false);
    }
  }

  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <Link
          href={`/listing/${listing.id}`}
          aria-label={`View ${listing.title}`}
        >
          <img
            src={listing.image}
            alt={listing.title}
            className="h-56 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow">
          {listing.category}
        </span>

        <button
          type="button"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={toggleWishlist}
          disabled={wishlistLoading}
          className="absolute right-3 top-3 rounded-full bg-white/95 p-2.5 shadow-md backdrop-blur transition-all duration-200 hover:scale-110 hover:bg-red-50 active:scale-95 disabled:opacity-60"
        >
          <FaHeart
            className={`transition-colors duration-200 ${
              isWishlisted ? "text-red-500" : "text-gray-400 hover:text-red-500"
            }`}
          />
        </button>
      </div>

      <Link href={`/listing/${listing.id}`} className="block p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-gray-800 transition-colors duration-200 group-hover:text-blue-600">
          {listing.title}
        </h3>

        <p className="mt-3 text-3xl font-extrabold text-blue-600">
          ₹{listing.price}
        </p>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <FaMapMarkerAlt className="shrink-0 text-blue-500" />
          <span className="line-clamp-1">{listing.location}</span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <div className="min-w-0">
            <p className="text-xs text-gray-400">Seller</p>
            <p className="truncate font-semibold text-gray-700">
              {listing.seller_name}
            </p>
          </div>

          <span className="shrink-0 text-sm font-semibold text-blue-600 transition-transform duration-200 group-hover:translate-x-1">
            View Details →
          </span>
        </div>
      </Link>
    </div>
  );
}
