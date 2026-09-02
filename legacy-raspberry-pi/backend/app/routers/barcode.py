import httpx
from fastapi import APIRouter

from .. import schemas

router = APIRouter(prefix="/api/barcode", tags=["barcode"])

# Open Food Facts: free, public, no API key needed. Good enough to prefill
# name/category when the user scans a packaged product.
OFF_URL = "https://world.openfoodfacts.org/api/v2/product/{code}.json"


@router.get("/lookup/{code}", response_model=schemas.BarcodeLookupOut)
async def lookup_barcode(code: str):
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            resp = await client.get(OFF_URL.format(code=code))
            data = resp.json()
        except (httpx.HTTPError, ValueError):
            return schemas.BarcodeLookupOut(found=False, barcode=code)

    if data.get("status") != 1:
        return schemas.BarcodeLookupOut(found=False, barcode=code)

    product = data.get("product", {})
    categories = product.get("categories", "")
    first_category = categories.split(",")[0].strip() if categories else None

    return schemas.BarcodeLookupOut(
        found=True,
        barcode=code,
        name=product.get("product_name") or product.get("generic_name"),
        category=first_category,
        image_url=product.get("image_front_small_url"),
    )
