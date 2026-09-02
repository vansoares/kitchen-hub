import { NextResponse } from "next/server";

// Open Food Facts: publica, gratuita, sem chave de API. Usada so pra
// pre-preencher nome/categoria quando o usuario escaneia um produto.
const OFF_URL = (code: string) => `https://world.openfoodfacts.org/api/v2/product/${code}.json`;

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  try {
    const res = await fetch(OFF_URL(code), { signal: AbortSignal.timeout(5000) });
    const data = await res.json();

    if (data?.status !== 1) {
      return NextResponse.json({ found: false, barcode: code });
    }

    const product = data.product ?? {};
    const categories: string = product.categories ?? "";
    const firstCategory = categories.split(",")[0]?.trim() || null;

    return NextResponse.json({
      found: true,
      barcode: code,
      name: product.product_name || product.generic_name || null,
      category: firstCategory,
      imageUrl: product.image_front_small_url || null,
    });
  } catch {
    return NextResponse.json({ found: false, barcode: code });
  }
}
