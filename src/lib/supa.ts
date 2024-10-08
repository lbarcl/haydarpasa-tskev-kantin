import { browser } from "$app/environment";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Use a fallback to handle cases where the key is not defined
const supabaseUrl = "https://vyssbmnzigywmtcttpul.supabase.co";
let supabaseKey: string | undefined;

if (browser) {
  supabaseKey = import.meta.env.VITE_SUPABASE_KEY; // Ensure this is available on the client side

  // Optional: Log an error if the key is not available
  if (!supabaseKey) {
    console.error(
      "Supabase key is not defined. Check your environment variable."
    );
  }
}

// Initialize Supabase client, but ensure the key is defined
export const SClient = createClient<Database>(
  supabaseUrl,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5c3NibW56aWd5d210Y3R0cHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc3NDIyMzUsImV4cCI6MjA0MzMxODIzNX0.VezFjsCqw1hooQVXQo_7QVxk-wUircsmF2eCTpuxdd0"
);

export async function fetchProducts(
  limit: number = 20,
  searchQuery?: string,
  rangeStart: number = 0,
  categoryId?: Array<Number>
) {
  let queryBuilder = SClient.from("Product").select("*");

  // If there's a search query, use full-text search
  if (searchQuery != undefined && searchQuery.length > 0) {
    if (searchQuery.length < 3) return { data: [], error: null }; // Do not search for very short queries
    queryBuilder = queryBuilder.textSearch(
      "fts",
      searchQuery.replace(" ", "+")
    );
  }

  if (categoryId && categoryId.length > 0)
    queryBuilder.in("categoryId", categoryId);

  // Define the range for pagination
  queryBuilder = queryBuilder.range(rangeStart, rangeStart + limit - 1);

  const { data: productsData, error } = await queryBuilder;
  if (error) {
    console.error("Error loading items from Supabase:", error);
  }

  return { data: productsData, error };
}
