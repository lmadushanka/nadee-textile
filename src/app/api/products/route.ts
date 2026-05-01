import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get("featured") === "1";
  const category = searchParams.get("category")?.trim() ?? "";
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? Math.min(50, Math.max(1, Number(limitRaw))) : undefined;
  try {
    const products = await getProducts({
      featured,
      limit,
      category: category || undefined,
    });
    return NextResponse.json(products);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 },
    );
  }
}
