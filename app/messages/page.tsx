"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaComments, FaMapMarkerAlt } from "react-icons/fa";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase-client";
import { Listing } from "@/types/listing";

type Conversation = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  listing: Listing | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  otherUserName: string;
};

export default function MessagesPage() {
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login to view your messages.");
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        id,
        listing_id,
        buyer_id,
        seller_id,
        created_at,
        listings (*)
      `,
      )
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("LOAD CONVERSATIONS ERROR:", error);
      toast.error("Failed to load conversations.");
      setLoading(false);
      return;
    }

    const rows = data ?? [];

    const formatted: Conversation[] = await Promise.all(
      rows.map(async (row: any) => {
        const listing = row.listings as Listing | null;

        const { data: messages } = await supabase
          .from("messages")
          .select("content, created_at")
          .eq("conversation_id", row.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const lastMessage = messages?.[0] ?? null;

        let otherUserName = "CampusMate user";

        if (listing) {
          otherUserName =
            row.buyer_id === user.id
              ? listing.seller_name
              : listing.seller_name;
        }

        return {
          id: row.id,
          listing_id: row.listing_id,
          buyer_id: row.buyer_id,
          seller_id: row.seller_id,
          created_at: row.created_at,
          listing,
          lastMessage: lastMessage?.content ?? null,
          lastMessageAt: lastMessage?.created_at ?? null,
          otherUserName,
        };
      }),
    );

    formatted.sort((a, b) => {
      const aDate = a.lastMessageAt ?? a.created_at;
      const bDate = b.lastMessageAt ?? b.created_at;

      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

    setConversations(formatted);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center">
            <FaComments className="text-2xl text-blue-600" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
            <p className="mt-1 text-gray-500">
              Chat with buyers and sellers on CampusMate.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-500">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <FaComments className="text-5xl text-gray-300 mx-auto mb-5" />

            <h2 className="text-2xl font-bold text-gray-800">
              No conversations yet
            </h2>

            <p className="mt-2 text-gray-500">
              Open a listing and select Contact Seller to start a conversation.
            </p>

            <Link
              href="/browse"
              className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="flex items-center gap-5 rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {conversation.listing?.image ? (
                  <img
                    src={conversation.listing.image}
                    alt={conversation.listing.title}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FaComments className="text-2xl text-blue-400" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-bold text-gray-800">
                    {conversation.listing?.title ?? "Listing unavailable"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Chat with {conversation.otherUserName}
                  </p>

                  <p className="mt-2 truncate text-sm text-gray-600">
                    {conversation.lastMessage ?? "No messages yet — say hello!"}
                  </p>

                  {conversation.listing?.location && (
                    <p className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                      <FaMapMarkerAlt />
                      {conversation.listing.location}
                    </p>
                  )}
                </div>

                <div className="hidden text-right sm:block">
                  <p className="font-bold text-blue-600">
                    {conversation.listing
                      ? `₹${conversation.listing.price}`
                      : ""}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(
                      conversation.lastMessageAt ?? conversation.created_at,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
