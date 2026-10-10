"use client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaMapMarkerAlt,
  FaUser,
  FaCheckCircle,
  FaCalendarAlt,
  FaHeart,
} from "react-icons/fa";

import { supabase } from "@/lib/supabase-client";
import { Listing } from "@/types/listing";

export default function ListingPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    loadListing();
  }, [id]);

  async function loadListing() {
    setLoading(true);

    const { data: listingData, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .single();

    if (listingError || !listingData) {
      setListing(null);
      setLoading(false);
      return;
    }

    setListing(listingData as Listing);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUserId(user.id);

      const { data: wishlistData } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", id)
        .maybeSingle();

      setSaved(!!wishlistData);
    }

    setLoading(false);
  }

  async function toggleWishlist() {
    if (!userId) {
      toastLogin();
      return;
    }

    setWishlistLoading(true);

    if (saved) {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", userId)
        .eq("listing_id", id);

      if (error) {
        console.error("REMOVE WISHLIST ERROR:", error);
        setWishlistLoading(false);
        return;
      }

      setSaved(false);
    } else {
      const { error } = await supabase.from("wishlists").insert({
        user_id: userId,
        listing_id: id,
      });

      if (error) {
        console.error("ADD WISHLIST ERROR:", error);
        setWishlistLoading(false);
        return;
      }

      setSaved(true);
    }

    setWishlistLoading(false);
  }

  function toastLogin() {
    router.push("/login");
  }
  async function handleContactSeller() {
    if (!userId) {
      toast.error("Please login to contact the seller.");
      router.push("/login");
      return;
    }

    if (!listing) return;

    if (userId === listing.seller_id) {
      toast.error("You cannot contact yourself about your own listing.");
      return;
    }

    const { data: existingConversation, error: findError } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", listing.id)
      .eq("buyer_id", userId)
      .eq("seller_id", listing.seller_id)
      .maybeSingle();

    if (findError) {
      console.error("FIND CONVERSATION ERROR:", findError);
      toast.error("Could not open the conversation.");
      return;
    }

    if (existingConversation) {
      router.push(`/messages/${existingConversation.id}`);
      return;
    }

    const { data: newConversation, error: createError } = await supabase
      .from("conversations")
      .insert({
        listing_id: listing.id,
        buyer_id: userId,
        seller_id: listing.seller_id,
      })
      .select("id")
      .single();

    if (createError) {
      console.error("CREATE CONVERSATION ERROR:", createError);
      toast.error("Could not start a conversation.");
      return;
    }

    router.push(`/messages/${newConversation.id}`);
  }
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading listing...</p>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow p-10 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Listing not found
          </h1>

          <Link
            href="/browse"
            className="inline-block mt-5 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Browse Listings
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-10 bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Image */}
          <div className="p-8">
            <img
              src={listing.image}
              alt={listing.title}
              className="rounded-2xl w-full h-[500px] object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-8 lg:py-12 lg:pr-12">
            <div className="flex items-start justify-between gap-5">
              <div>
                <span className="inline-block rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600">
                  {listing.category}
                </span>

                <h1 className="mt-4 text-4xl font-bold text-gray-800">
                  {listing.title}
                </h1>
              </div>

              {/* Wishlist */}
              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 font-semibold transition ${
                  saved
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                <FaHeart className={saved ? "text-red-500" : "text-gray-400"} />

                {saved ? "Saved" : "Save"}
              </button>
            </div>

            <div className="mt-6">
              <span className="text-4xl font-bold text-blue-600">
                ₹{listing.price}
              </span>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-800">Description</h2>

              <p className="mt-3 text-gray-600 leading-7">
                {listing.description}
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-blue-600" />
                </div>

                <div>
                  <p className="text-sm text-gray-400">Location</p>

                  <p className="font-semibold text-gray-700">
                    {listing.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <FaUser className="text-blue-600" />
                </div>

                <div>
                  <p className="text-sm text-gray-400">Seller</p>

                  <p className="font-semibold text-gray-700">
                    {listing.seller_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <FaCalendarAlt className="text-blue-600" />
                </div>

                <div>
                  <p className="text-sm text-gray-400">Listed</p>

                  <p className="font-semibold text-gray-700">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button
                onClick={handleContactSeller}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition"
              >
                Contact Seller
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
              <FaCheckCircle className="text-green-500" />
              CampusMate verified listing
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
