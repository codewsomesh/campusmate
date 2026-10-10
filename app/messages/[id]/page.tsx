"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaPaperPlane, FaStore } from "react-icons/fa";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase-client";
import { Listing } from "@/types/listing";

type Conversation = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  listing: Listing | null;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("LOAD MESSAGES ERROR:", error);
      toast.error("Failed to load messages.");
      return;
    }

    setMessages((data ?? []) as Message[]);
  }, [conversationId]);

  useEffect(() => {
    let active = true;

    async function loadChat() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        toast.error("Please login to view messages.");
        router.replace("/login");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          id,
          listing_id,
          buyer_id,
          seller_id,
          listings (*)
        `,
        )
        .eq("id", conversationId)
        .maybeSingle();

      if (!active) return;

      if (error || !data) {
        console.error("LOAD CONVERSATION ERROR:", error);
        toast.error("Conversation not found or access denied.");
        router.replace("/messages");
        return;
      }

      const row = data as any;

      if (row.buyer_id !== user.id && row.seller_id !== user.id) {
        toast.error("You don't have access to this conversation.");
        router.replace("/messages");
        return;
      }

      setConversation({
        id: row.id,
        listing_id: row.listing_id,
        buyer_id: row.buyer_id,
        seller_id: row.seller_id,
        listing: row.listings as Listing | null,
      });

      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (!active) return;

      if (messageError) {
        console.error("LOAD MESSAGES ERROR:", messageError);
        toast.error("Failed to load messages.");
      } else {
        setMessages((messageData ?? []) as Message[]);
      }

      setLoading(false);
    }

    loadChat();

    return () => {
      active = false;
    };
  }, [conversationId, router]);

  useEffect(() => {
    if (!conversationId || !userId) return;

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("REALTIME MESSAGE RECEIVED:", payload.new);

          const incoming = payload.new as Message;

          setMessages((current) => {
            console.log("CURRENT MESSAGES:", current.length);
            console.log("INCOMING MESSAGE ID:", incoming.id);

            if (current.some((message) => message.id === incoming.id)) {
              return current;
            }

            return [...current, incoming].sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime(),
            );
          });
        },
      )
      .subscribe((status, err) => {
        console.log("CHAT REALTIME STATUS:", status);

        if (err) {
          console.error("CHAT REALTIME ERROR:", err);
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("Realtime connection failed:", status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();

    const content = messageText.trim();

    if (!content || !userId || !conversation || sending) return;

    if (content.length > 5000) {
      toast.error("Messages must be 5000 characters or fewer.");
      return;
    }

    setSending(true);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        sender_id: userId,
        content,
      })
      .select("*")
      .single();

    setSending(false);

    if (error) {
      console.error("SEND MESSAGE ERROR:", error);
      toast.error("Failed to send message.");
      return;
    }

    setMessages((current) => {
      const newMessage = data as Message;

      if (current.some((message) => message.id === newMessage.id)) {
        return current;
      }

      return [...current, newMessage].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    });

    setMessageText("");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading conversation...</p>
      </main>
    );
  }

  if (!conversation || !userId) return null;

  const isBuyer = userId === conversation.buyer_id;

  const otherPerson = isBuyer
    ? (conversation.listing?.seller_name ?? "Seller")
    : "Buyer";

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6">
      <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-lg">
        {/* Chat header */}
        <div className="flex items-center gap-4 border-b border-gray-200 p-4 sm:p-6">
          <Link
            href="/messages"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-blue-600"
            aria-label="Back to messages"
          >
            <FaArrowLeft />
          </Link>

          {conversation.listing?.image ? (
            <img
              src={conversation.listing.image}
              alt={conversation.listing.title}
              className="h-12 w-12 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <FaStore className="text-xl text-blue-600" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-bold text-gray-800">{otherPerson}</h1>

            <Link
              href={`/listing/${conversation.listing_id}`}
              className="truncate text-sm text-blue-600 hover:underline"
            >
              {conversation.listing?.title ?? "View listing"}
            </Link>
          </div>

          {conversation.listing && (
            <span className="hidden font-bold text-blue-600 sm:block">
              ₹{conversation.listing.price}
            </span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <FaStore className="text-2xl text-blue-600" />
              </div>

              <h2 className="text-lg font-bold text-gray-800">
                Start the conversation
              </h2>

              <p className="mt-2 max-w-sm text-sm text-gray-500">
                Ask questions about the listing, arrange a meetup, or discuss
                the price.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const ownMessage = message.sender_id === userId;

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    ownMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
                      ownMessage
                        ? "rounded-br-sm bg-blue-600 text-white"
                        : "rounded-bl-sm border border-gray-200 bg-white text-gray-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>

                    <p
                      className={`mt-2 text-right text-xs ${
                        ownMessage ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>

        {/* Message input */}
        <form
          onSubmit={handleSendMessage}
          className="flex items-end gap-3 border-t border-gray-200 bg-white p-4 sm:p-5"
        >
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            rows={1}
            maxLength={5000}
            className="max-h-32 min-h-12 flex-1 resize-y rounded-xl border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="submit"
            disabled={!messageText.trim() || sending}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaPaperPlane />

            <span className="hidden sm:inline">
              {sending ? "Sending..." : "Send"}
            </span>
          </button>
        </form>
      </div>
    </main>
  );
}
