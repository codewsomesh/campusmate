"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import { supabase } from "@/lib/supabase-client";

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async (userId: string) => {
    const { data: conversations, error: conversationError } = await supabase
      .from("conversations")
      .select("id")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

    if (conversationError) {
      console.error("LOAD CONVERSATIONS ERROR:", conversationError);
      return;
    }

    const conversationIds = (conversations ?? []).map((c) => c.id);

    if (conversationIds.length === 0) {
      setUnreadCount(0);
      return;
    }

    const { data: reads, error: readsError } = await supabase
      .from("conversation_reads")
      .select("conversation_id,last_read_at")
      .eq("user_id", userId)
      .in("conversation_id", conversationIds);

    if (readsError) {
      console.error("LOAD READ STATUS ERROR:", readsError);
      return;
    }

    const readTimes = new Map(
      (reads ?? []).map((r) => [r.conversation_id, r.last_read_at]),
    );

    let totalUnread = 0;

    for (const conversationId of conversationIds) {
      let query = supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId);

      const lastReadAt = readTimes.get(conversationId);

      if (lastReadAt) {
        query = query.gt("created_at", lastReadAt);
      }

      const { count, error } = await query;

      if (error) {
        console.error("COUNT UNREAD MESSAGES ERROR:", error);
        continue;
      }

      totalUnread += count ?? 0;
    }

    setUnreadCount(totalUnread);
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const { data } = await supabase.auth.getUser();

      if (!active) return;

      setUser(data.user);

      if (data.user) {
        await loadUnreadCount(data.user.id);
      }
    }

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        void loadUnreadCount(currentUser.id);
      } else {
        setUnreadCount(0);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadUnreadCount]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`unread-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const message = payload.new as {
            sender_id: string;
            conversation_id: string;
          };

          if (message.sender_id !== user.id) {
            void loadUnreadCount(user.id);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, loadUnreadCount]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setOpen(false);
    window.location.href = "/";
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 transition hover:bg-gray-100"
        >
          Login
        </Link>

        <Link
          href="/signup"
          className="rounded-lg bg-blue-600 px-5 py-2 text-white shadow-md transition hover:bg-blue-700"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  const username = user.email?.split("@")[0] ?? "User";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-gray-100"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
          {username.charAt(0).toUpperCase()}
        </div>

        <span className="font-semibold text-gray-800">{username}</span>

        <FaChevronDown
          className={`text-sm text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
          <Link
            href="/wishlist"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
          >
            ❤️ Wishlist
          </Link>

          <Link
            href="/messages"
            onClick={() => {
              setOpen(false);
              setUnreadCount(0);
            }}
            className="flex items-center justify-between px-4 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
          >
            <span>💬 Messages</span>

            {unreadCount > 0 && (
              <span className="ml-3 min-w-6 rounded-full bg-blue-600 px-2 py-1 text-center text-xs font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/my-listings"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
          >
            My Listings
          </Link>

          <Link
            href="/sell"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-gray-700 transition hover:bg-blue-50 hover:text-blue-600"
          >
            Sell Item
          </Link>

          <div className="my-1 border-t border-gray-100" />

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
