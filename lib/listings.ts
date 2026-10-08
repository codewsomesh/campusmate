import { supabase } from "./supabase";
import { Listing } from "@/types/listing";

export async function getListings() {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET LISTINGS ERROR:", error);
    return [];
  }

  console.log("LISTINGS:", data);

  return data as Listing[];
}

export async function getListing(id: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("GET LISTING ERROR:", error);
    return null;
  }

  return data as Listing;
}
