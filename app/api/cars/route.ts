import { NextRequest, NextResponse } from "next/server";
import carsData from "@/data/cars.json";
import { Car } from "@/lib/types";

const cars: Car[] = carsData as Car[];

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const search = params.get("search")?.toLowerCase();
  const brands = params.get("brand")?.split(",").filter(Boolean);
  const models = params.get("model")?.split(",").filter(Boolean);
  const budgetMin = params.get("budgetMin") ? Number(params.get("budgetMin")) : undefined;
  const budgetMax = params.get("budgetMax") ? Number(params.get("budgetMax")) : undefined;
  const bodyTypes = params.get("bodyType")?.split(",").filter(Boolean);
  const fuelTypes = params.get("fuelType")?.split(",").filter(Boolean);
  const transmissions = params.get("transmission")?.split(",").filter(Boolean);
  const seating = params.get("seating") ? Number(params.get("seating")) : undefined;
  const safetyRating = params.get("safetyRating") ? Number(params.get("safetyRating")) : undefined;

  let filtered = cars;

  if (search) {
    filtered = filtered.filter(
      (car) =>
        car.name.toLowerCase().includes(search) ||
        car.brand.toLowerCase().includes(search) ||
        car.body_type.toLowerCase().includes(search) ||
        car.tags.some((tag) => tag.includes(search)) ||
        car.best_for.toLowerCase().includes(search)
    );
  }

  if (brands?.length) {
    filtered = filtered.filter((car) =>
      brands.some((b) => car.brand.toLowerCase() === b.toLowerCase())
    );
  }

  if (models?.length) {
    filtered = filtered.filter((car) =>
      models.some((m) => car.name.toLowerCase().includes(m.toLowerCase()))
    );
  }

  if (budgetMin !== undefined) {
    filtered = filtered.filter((car) => car.price_max >= budgetMin);
  }

  if (budgetMax !== undefined) {
    filtered = filtered.filter((car) => car.price_min <= budgetMax);
  }

  if (bodyTypes?.length) {
    filtered = filtered.filter((car) =>
      bodyTypes.some((bt) => car.body_type.toLowerCase().includes(bt.toLowerCase()))
    );
  }

  if (fuelTypes?.length) {
    filtered = filtered.filter((car) =>
      fuelTypes.some((ft) => car.fuel.some((f) => f.toLowerCase() === ft.toLowerCase()))
    );
  }

  if (transmissions?.length) {
    filtered = filtered.filter((car) =>
      transmissions.some((t) =>
        car.transmission.some((ct) => ct.toLowerCase() === t.toLowerCase())
      )
    );
  }

  if (seating) {
    filtered = filtered.filter((car) => car.seating >= seating);
  }

  if (safetyRating) {
    filtered = filtered.filter((car) => car.safety_rating >= safetyRating);
  }

  return NextResponse.json({ cars: filtered, total: filtered.length });
}
