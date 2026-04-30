import { NextRequest, NextResponse } from "next/server";
import groq from "@/lib/groq";
import carsData from "@/data/cars.json";
import { Car } from "@/lib/types";

const cars: Car[] = carsData as Car[];

const carSummary = cars.map((car) => ({
  id: car.id,
  name: car.name,
  brand: car.brand,
  price_min: car.price_min,
  price_max: car.price_max,
  price_display: car.price_display,
  body_type: car.body_type,
  fuel: car.fuel,
  mileage_kmpl: car.mileage_kmpl,
  range_km: car.range_km,
  seating: car.seating,
  safety_rating: car.safety_rating,
  transmission: car.transmission,
  use_case: car.use_case,
  tags: car.tags,
  best_for: car.best_for,
  pros: car.pros,
}));

const SYSTEM_PROMPT = `You are a car matching engine. Given a user's query about what car they want, analyze their needs and return matching cars from the database.

IMPORTANT: If the query is NOT related to cars, car buying, or car comparisons (e.g. math, coding, general knowledge), return this exact JSON:
{"matches": [], "summary": "I can only help with car searches. Try asking about cars, like 'best SUV under 15 lakhs' or 'safest car for family'.", "interpreted_needs": {}}

Car database:
${JSON.stringify(carSummary, null, 2)}

PRICE CONVERSION (CRITICAL — apply BEFORE matching):
- Prices in the database are in raw rupees (e.g. 699000 means ₹6.99 lakhs).
- Users write prices informally. You MUST convert them:
  "5 lac" / "5 lacs" / "5 lakh" / "5 lakhs" / "5L" = 500000
  "10 lac" / "10 lacs" / "10 lakh" / "10 lakhs" / "10L" = 1000000
  "15 lac" / "15 lacs" / "15 lakh" / "15 lakhs" / "15L" = 1500000
  "20 lac" / "20 lacs" / "20 lakh" / "20 lakhs" / "20L" = 2000000
- "under X" means price_min must be ≤ X. Ideally price_max should also be ≤ X, but if few cars match, you may include cars whose price_min is ≤ X even if price_max exceeds it.
- "around X" means price_min should be near X (within ~20%).

RULES:
1. Return ONLY a raw JSON object. No explanation, no reasoning, no markdown, no code blocks, no text before or after. Your entire response must be valid JSON in this exact format:
{
  "matches": ["car-id-1", "car-id-2", ...],
  "summary": "A brief 1-2 sentence explanation of why these cars match",
  "interpreted_needs": {
    "budget": "under 10L" or null,
    "use_case": "city" or null,
    "body_type": "SUV" or null,
    "fuel": "petrol" or null,
    "priority": "safety" or "mileage" or "features" or null
  }
}
2. Order matches by best fit first.
3. Return 2-6 matching cars.
4. If the query is vague, return the most popular/best-value options.
5. ONLY return car IDs that exist in the database.
6. BUDGET IS A HARD FILTER. If the user specifies a budget, NEVER include cars whose starting price (price_min) exceeds the budget. This rule overrides all other matching criteria.`;

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query?.trim()) {
    return NextResponse.json({ cars: [], summary: "" });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const responseText = completion.choices[0]?.message?.content || "";
    console.log("AI raw response:", responseText);

    // Extract JSON — handle markdown code blocks and raw JSON
    let jsonStr = responseText;
    const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ cars: [], summary: "Couldn't understand the query. Try being more specific." });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const matchedIds: string[] = parsed.matches || [];
    let matchedCars = matchedIds
      .map((id: string) => cars.find((c) => c.id === id))
      .filter(Boolean) as Car[];

    // Server-side budget enforcement — LLMs can't be trusted to filter strictly
    const budgetStr: string | undefined = parsed.interpreted_needs?.budget;
    if (budgetStr) {
      const budgetMatch = budgetStr.match(/([\d.]+)/);
      if (budgetMatch) {
        const budgetLakhs = parseFloat(budgetMatch[1]);
        const budgetRupees = budgetLakhs * 100000;
        matchedCars = matchedCars.filter((c) => c.price_min <= budgetRupees);
      }
    }

    return NextResponse.json({
      cars: matchedCars,
      summary: parsed.summary || "",
      interpreted_needs: parsed.interpreted_needs || {},
      total: matchedCars.length,
    });
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json(
      { cars: [], summary: "AI search failed. Please try again." },
      { status: 500 }
    );
  }
}
