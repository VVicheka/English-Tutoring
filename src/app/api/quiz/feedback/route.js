import { NextResponse } from "next/server";
import { generateQuizFeedback } from "../../../lib/quizEngine.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { correct, total } = await request.json();
    if (typeof correct !== "number" || typeof total !== "number") {
      return NextResponse.json({ error: "correct and total must be numbers" }, { status: 400 });
    }
    const result = await generateQuizFeedback(correct, total);
    return NextResponse.json(result);
  } catch (err) {
    console.error("feedback error:", err);
    return NextResponse.json({ error: err.message || "Feedback generation failed" }, { status: 500 });
  }
}
