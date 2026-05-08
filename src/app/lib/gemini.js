async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return res.json();
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value, null, 2));
  } catch {}
}

export async function generatePersonalizedQuiz(studentPerformance, lessonsInUnit) {
  const data = await postJSON("/api/quiz/personalized", { studentPerformance, lessonsInUnit });
  safeSetItem("last_ai_quiz_response", { ...data.meta, questions: data.questions });
  return data.questions;
}

export async function generateChallengeQuiz(level = "medium") {
  const data = await postJSON("/api/quiz/challenge", { level });
  safeSetItem("last_challenge_quiz", { ...data.meta, questions: data.questions });
  return data.questions;
}

export async function generateQuizFeedback(correct, total) {
  const data = await postJSON("/api/quiz/feedback", { correct, total });
  safeSetItem("last_ai_feedback", {
    timestamp: new Date().toISOString(),
    feedback: data.feedback,
    score: { correct, total, percentage: (correct / total) * 100 }
  });
  return data.feedback;
}
