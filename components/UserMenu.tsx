"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import { supabase } from "@/lib/supabase-client";

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
          className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          Login
        </Link>

        <Link
          href="/signup"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
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
        className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-gray-100 transition"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
          {username.charAt(0).toUpperCase()}
        </div>

        <span className="font-semibold text-gray-800">{username}</span>

        <FaChevronDown
          className={`text-gray-500 text-sm transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-52 rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
          <Link
            href="/my-listings"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            My Listings
          </Link>

          <Link
            href="/sell"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            Sell Item
          </Link>

          <div className="my-1 border-t border-gray-100" />

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
