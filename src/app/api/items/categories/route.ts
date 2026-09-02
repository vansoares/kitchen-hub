import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as pantry from "@/lib/pantry";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const group = searchParams.get("group") ?? undefined;

  const categories = await pantry.getCategories(group);
  return NextResponse.json(categories);
}
