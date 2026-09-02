import { NextResponse } from "next/server";
import * as pantry from "@/lib/pantry";

export async function GET() {
  const categories = await pantry.getCategories();
  return NextResponse.json(categories);
}
