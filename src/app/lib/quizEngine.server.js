import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("Missing GEMINI_API_KEY (server env)");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL_NAME = "gemini-2.5-flash";

const TESTING_MODE = false;
const TEST_SCORES = {
  userPerformance: [
    { lessonId: 1, matchingScore: 20, fillwordsScore: 40, quizScore: 24, score: 84 },
    { lessonId: 2, matchingScore: 20, fillwordsScore: 24, quizScore: 40, score: 84 },
    { lessonId: 3, matchingScore: 20, fillwordsScore: 40, quizScore: 40, score: 100 },
    { lessonId: 4, matchingScore: 20, fillwordsScore: 40, quizScore: 16, score: 76 }
  ]
};

const HIGH_SCORE_THRESHOLD = 80;
const MAX_QUESTIONS = 10;

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function stripCodeFence(text) {
  let clean = text.trim();
  if (clean.startsWith("```json")) {
    clean = clean.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
  } else if (clean.startsWith("```")) {
    clean = clean.replace(/```\n?/g, "").replace(/```\n?$/g, "");
  }
  return clean.trim();
}

async function callGemini(prompt) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function generatePersonalizedQuiz(studentPerformance, lessonsInUnit) {
  if (TESTING_MODE) studentPerformance = TEST_SCORES;

  const eligibleLessons = [];
  const skippedLessons = [];
  studentPerformance.userPerformance.forEach(perf => {
    if (perf.score >= HIGH_SCORE_THRESHOLD) {
      skippedLessons.push({ lessonId: perf.lessonId, score: perf.score });
    } else {
      eligibleLessons.push(perf);
    }
  });

  if (eligibleLessons.length === 0) {
    eligibleLessons.push(...studentPerformance.userPerformance);
  }

  const eligibleLessonIds = eligibleLessons.map(l => l.lessonId);
  const filteredLessons = lessonsInUnit.filter(lesson => eligibleLessonIds.includes(lesson.id));
  const totalAvailableWords = filteredLessons.reduce((sum, l) => sum + (l.words?.length || 0), 0);

  const totalQuestions = Math.min(MAX_QUESTIONS, totalAvailableWords);
  if (totalQuestions === 0) throw new Error("No words available for quiz generation");

  const invertedScores = eligibleLessons.map(perf => ({
    lessonId: perf.lessonId,
    score: perf.score,
    invertedScore: 100 - perf.score,
    ...perf
  }));
  const totalInvertedScore = invertedScores.reduce((sum, l) => sum + l.invertedScore, 0);

  const questionDistribution = invertedScores.map(lesson => {
    const lessonData = filteredLessons.find(l => l.id === lesson.lessonId);
    const maxWordsInLesson = lessonData?.words?.length || 0;
    const proportion = lesson.invertedScore / totalInvertedScore;
    const exactQuestions = proportion * totalQuestions;
    const roundedQuestions = Math.round(exactQuestions);
    const assignedQuestions = Math.min(roundedQuestions, maxWordsInLesson);
    return { ...lesson, maxWordsInLesson, proportion, exactQuestions, assignedQuestions };
  });

  let totalAssigned = questionDistribution.reduce((sum, l) => sum + l.assignedQuestions, 0);
  if (totalAssigned !== totalQuestions) {
    questionDistribution.sort((a, b) => (b.exactQuestions - b.assignedQuestions) - (a.exactQuestions - a.assignedQuestions));
    const diff = totalQuestions - totalAssigned;
    for (let i = 0; i < Math.abs(diff); i++) {
      const lesson = questionDistribution[i % questionDistribution.length];
      if (diff > 0 && lesson.assignedQuestions < lesson.maxWordsInLesson) lesson.assignedQuestions++;
      else if (diff < 0 && lesson.assignedQuestions > 0) lesson.assignedQuestions--;
    }
  }

  questionDistribution.forEach(lesson => {
    if (lesson.assignedQuestions === 0 && lesson.maxWordsInLesson > 0 && eligibleLessons.length <= totalQuestions) {
      const highest = questionDistribution.reduce((max, l) => l.assignedQuestions > max.assignedQuestions ? l : max);
      if (highest.assignedQuestions > 1) {
        highest.assignedQuestions--;
        lesson.assignedQuestions = 1;
      }
    }
  });

  const lessonSummaries = filteredLessons.map(lesson => {
    const wordsWithEmoji = lesson.words.map((word, i) => `${lesson.emoji?.[i] || "📝"} ${word}`).join(", ");
    return `Lesson ${lesson.id}: "${lesson.title}"
- Focus: ${lesson.focus}
- Words: ${wordsWithEmoji}
- Total words: ${lesson.words.length}`;
  }).join("\n\n");

  const performanceAnalysis = eligibleLessons.map(perf => {
    const issues = [];
    issues.push(perf.matchingScore < 15 ? `❌ WEAK: Word matching (${perf.matchingScore}/20)` : perf.matchingScore >= 18 ? `✅ STRONG: Word matching (${perf.matchingScore}/20)` : `⚠️ OK: Word matching (${perf.matchingScore}/20)`);
    issues.push(perf.fillwordsScore < 28 ? `❌ WEAK: Spelling (${perf.fillwordsScore}/40)` : perf.fillwordsScore >= 35 ? `✅ STRONG: Spelling (${perf.fillwordsScore}/40)` : `⚠️ OK: Spelling (${perf.fillwordsScore}/40)`);
    issues.push(perf.quizScore < 28 ? `❌ WEAK: Comprehension (${perf.quizScore}/40)` : perf.quizScore >= 35 ? `✅ STRONG: Comprehension (${perf.quizScore}/40)` : `⚠️ OK: Comprehension (${perf.quizScore}/40)`);
    return `Lesson ${perf.lessonId}: ${perf.score}/100 points\n${issues.join("\n")}`;
  }).join("\n\n");

  const distributionText = questionDistribution
    .filter(l => l.assignedQuestions > 0)
    .map(l => `- Lesson ${l.lessonId}: EXACTLY ${l.assignedQuestions} question${l.assignedQuestions > 1 ? "s" : ""} (score: ${l.score}/100, ${l.maxWordsInLesson} words available)`)
    .join("\n");

  const randomSeed = Math.floor(Math.random() * 10000);
  const timestamp = new Date().toISOString();
  const basePositions = [];
  for (let i = 0; i < totalQuestions; i++) basePositions.push(i % 3);
  const randomPositions = shuffleArray(basePositions);

  const prompt = `You are a teacher making a CHALLENGING quiz for kids learning to read English (ages 5-7).

🎲 RANDOMIZATION SEED: ${randomSeed}
⏰ GENERATED AT: ${timestamp}

📚 AVAILABLE LESSONS (Words you CAN use):
${lessonSummaries}

📊 STUDENT'S PERFORMANCE:
${performanceAnalysis}

📊 EXACT QUESTION DISTRIBUTION (MUST FOLLOW):
${distributionText}

TOTAL: Exactly ${totalQuestions} questions${totalQuestions < MAX_QUESTIONS ? ` (reduced from ${MAX_QUESTIONS} due to limited words)` : ""}

🚫 EXCLUDED LESSONS (DO NOT USE):
${skippedLessons.length > 0 ? skippedLessons.map(l => `- Lesson ${l.lessonId}: Scored ${l.score}/100 (too high, >= ${HIGH_SCORE_THRESHOLD})`).join("\n") : "None - all lessons included"}

⚠️ CRITICAL RULES:
1. Use ONLY words from the lessons listed above
2. NEVER use words from excluded lessons
3. Each word can appear ONLY ONCE across all questions
4. Follow the EXACT question count for each lesson
5. Do NOT repeat any emoji/word combination
6. You have exactly ${totalAvailableWords} unique words available - use each word ONCE only

🎯 CREATE EXACTLY ${totalQuestions} UNIQUE QUESTIONS

🔥 CRITICAL RULES:

1. QUESTION FORMAT - RANDOMLY vary (don't repeat):
   • "What is this? [emoji]"
   • "Find: [emoji]"
   • "Which word? [emoji]"
   • "This is? [emoji]"
   • "Read: [emoji]"
   • "Choose: [emoji]"
   • "What? [emoji]"
   • "Select: [emoji]"
   • "Identify: [emoji]"
   • "Name: [emoji]"

2. NEVER PUT THE ANSWER IN THE QUESTION:
   ❌ "Which is 🐔 hen??" (gives away answer!)
   ✅ "What is this? 🐔" (must read)

3. 🔀 SHUFFLE ANSWER POSITIONS - USE THESE EXACT POSITIONS:
   ${randomPositions.map((pos, i) => `Question ${i + 1}: Put correct answer at position ${pos} ${pos === 0 ? "(FIRST)" : pos === 1 ? "(MIDDLE)" : "(LAST)"}`).join("\n   ")}

   Position 0 = FIRST option in the array
   Position 1 = MIDDLE option in the array
   Position 2 = LAST option in the array

4. CREATE VARIETY - Use DIFFERENT strategies:
   STRATEGY A - Mix different vowel sounds
   STRATEGY B - Similar starting letters
   STRATEGY C - Words that look similar
   STRATEGY D - Random mix

5. NO DUPLICATES:
   • Each word/emoji can only appear ONCE as the correct answer
   • Use different words from the available lessons

6. EXPLANATION - Keep short:
   ✅ "🐱 = cat"

RESPONSE FORMAT - Return ONLY JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "What is this? 🐱",
      "options": ["bet", "cat", "pin"],
      "correctAnswer": "cat",
      "explanation": "🐱 = cat",
      "emoji": "🐱"
    }
  ]
}

Make ${totalQuestions} DIFFERENT questions now. Return ONLY the JSON.`;

  const rawText = await callGemini(prompt);
  const quizData = JSON.parse(stripCodeFence(rawText));

  return {
    questions: quizData.questions || [],
    meta: {
      timestamp,
      randomSeed,
      randomPositions,
      model: MODEL_NAME,
      actualQuestions: totalQuestions,
      totalAvailableWords,
      eligibleLessons: eligibleLessons.map(l => ({ id: l.lessonId, score: l.score })),
      skippedLessons,
      questionDistribution: questionDistribution.map(l => ({
        lessonId: l.lessonId,
        score: l.score,
        questions: l.assignedQuestions,
        availableWords: l.maxWordsInLesson
      }))
    }
  };
}

const CHALLENGE_LEVELS = {
  easy: {
    label: "Easy",
    description: "Simple 3-4 letter words, short vowel sounds",
    wordPool: "cat, dog, run, sun, box, fan, pig, bed, cup, bus, pen, map, hat, bat, jam, top, hop, lip, mud, hen",
    guidance: "Use simple CVC words and short-vowel sounds similar to early phonics lessons."
  },
  medium: {
    label: "Medium",
    description: "Blends, digraphs, 4-5 letter words",
    wordPool: "frog, drum, plant, shell, brick, flag, ship, chin, bath, drip, clap, stop, fresh, grass, trick, click, bench, crab, print, sting",
    guidance: "Use consonant blends (br, cl, st, fr), digraphs (sh, ch, th), and longer vocabulary than easy level."
  },
  hard: {
    label: "Hard",
    description: "Long vowels, silent e, tricky spelling patterns",
    wordPool: "cake, kite, slide, shape, brave, stone, smile, grape, plane, drive, flame, prize, snake, bride, stove, globe, slime, flute, spine, grade",
    guidance: "Use long-vowel patterns (a_e, i_e, o_e, u_e), silent-e words, and trickier spellings. Include occasional rhyming questions."
  }
};

export async function generateChallengeQuiz(level = "medium") {
  const levelConfig = CHALLENGE_LEVELS[level] || CHALLENGE_LEVELS.medium;
  const totalQuestions = 10;
  const randomSeed = Math.floor(Math.random() * 10000);
  const timestamp = new Date().toISOString();
  const basePositions = [];
  for (let i = 0; i < totalQuestions; i++) basePositions.push(i % 3);
  const randomPositions = shuffleArray(basePositions);

  const prompt = `You are an expert English teacher creating a CHALLENGE QUIZ for kids (ages 6-8) who have already finished a beginner phonics course.

🎲 RANDOMIZATION SEED: ${randomSeed}
⏰ GENERATED AT: ${timestamp}
🎯 DIFFICULTY LEVEL: ${levelConfig.label} — ${levelConfig.description}

${levelConfig.guidance}

📚 WORD POOL INSPIRATION (you may use these OR similar-difficulty words):
${levelConfig.wordPool}

🔥 CRITICAL RULES:

1. Create EXACTLY ${totalQuestions} UNIQUE multiple-choice questions.
2. Each question must have 3 options and ONE correct answer.
3. This is a CHALLENGE quiz — questions should be harder than basic lessons.
4. Mix question styles (vary to keep it fun):
   • "What is this? [emoji]"
   • "Which word rhymes with [word]?"
   • "Which word has the same sound as [word]?"
   • "Pick the correct spelling: [emoji]"
   • "Which one is a [category]?"
5. NEVER put the answer inside the question text.
6. SHUFFLE ANSWER POSITIONS — use these exact positions:
${randomPositions.map((pos, i) => `   Question ${i + 1}: position ${pos} ${pos === 0 ? "(FIRST)" : pos === 1 ? "(MIDDLE)" : "(LAST)"}`).join("\n")}
7. Make the distractor options look believable (similar length, similar letters).
8. NO duplicate correct answers across questions.
9. Add a relevant emoji to each question when possible.
10. Keep explanations short and kid-friendly (e.g., "🐍 = snake", "cake rhymes with bake").

RESPONSE FORMAT — Return ONLY valid JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "What is this? 🐍",
      "options": ["snake", "stake", "smoke"],
      "correctAnswer": "snake",
      "explanation": "🐍 = snake",
      "emoji": "🐍"
    }
  ]
}

Create ${totalQuestions} ${levelConfig.label.toLowerCase()}-difficulty questions now. Return ONLY the JSON.`;

  const rawText = await callGemini(prompt);
  const quizData = JSON.parse(stripCodeFence(rawText));
  return {
    questions: quizData.questions || [],
    meta: { timestamp, level, randomSeed }
  };
}

export async function generateQuizFeedback(correct, total) {
  const percentage = (correct / total) * 100;
  const prompt = `You are a kind teacher. A 5-7 year old student just finished a quiz.

RESULTS:
- Got ${correct} out of ${total} correct
- Score: ${percentage.toFixed(0)}%

Write 2-3 VERY SIMPLE encouraging sentences using easy words.
Add 1-2 emojis.
Make it DIFFERENT each time - vary your wording!

Use simple words like: good, great, nice, awesome, try, practice, you, can, keep going, well done

Return ONLY the feedback text.`;

  const rawText = await callGemini(prompt);
  return { feedback: rawText.trim() };
}
