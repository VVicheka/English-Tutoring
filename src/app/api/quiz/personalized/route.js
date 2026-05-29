import { NextResponse } from "next/server";
import { generatePersonalizedQuiz } from "../../../lib/quizEngine.server";
import { requireUser } from "../../../lib/supabase.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  const auth = await requireUser(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { studentPerformance, lessonsInUnit } = await request.json();
    if (!studentPerformance || !lessonsInUnit) {
      return NextResponse.json({ error: "Missing studentPerformance or lessonsInUnit" }, { status: 400 });
    }
    const result = await generatePersonalizedQuiz(studentPerformance, lessonsInUnit);
    return NextResponse.json(result);
  } catch (err) {
    console.error("personalized quiz error:", err);
    return NextResponse.json({ error: err.message || "Quiz generation failed" }, { status: 500 });
  }
}
