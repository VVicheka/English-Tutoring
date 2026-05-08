import { NextResponse } from "next/server";
import { generateChallengeQuiz } from "../../../lib/quizEngine.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { level } = await request.json();
    const result = await generateChallengeQuiz(level || "medium");
    return NextResponse.json(result);
  } catch (err) {
    console.error("challenge quiz error:", err);
    return NextResponse.json({ error: err.message || "Challenge generation failed" }, { status: 500 });
  }
}
