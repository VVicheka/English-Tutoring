import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('⚠️ NEXT_PUBLIC_GEMINI_API_KEY is not set!');
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(API_KEY);

const MODEL_NAME = "gemini-2.5-flash";

// ========================================
// 🧪 TESTING MODE - EDIT SCORES HERE
// ========================================
const TESTING_MODE = false; // ✅ SET TO true TO USE TEST SCORES

const TEST_SCORES = {
  userPerformance: [
    { lessonId: 1, matchingScore: 20, fillwordsScore: 40, quizScore: 24, score: 84 },
    { lessonId: 2, matchingScore: 20, fillwordsScore: 24, quizScore: 40, score: 84 },
    { lessonId: 3, matchingScore: 20, fillwordsScore: 40, quizScore: 40, score: 100 },
    { lessonId: 4, matchingScore: 20, fillwordsScore: 40, quizScore: 16, score: 76 }
  ]
};

// ========================================
// ⚙️ CONFIGURATION
// ========================================
const HIGH_SCORE_THRESHOLD = 80;
const MAX_QUESTIONS = 10;

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function generatePersonalizedQuiz(studentPerformance, lessonsInUnit) {
  console.log('🔑 API Key present:', !!API_KEY);
  console.log(`🤖 Using model: ${MODEL_NAME}`);
  
  if (TESTING_MODE) {
    console.log('🧪 TESTING MODE ENABLED');
    studentPerformance = TEST_SCORES;
  }
  
  try {
    // STEP 1: Filter lessons
    const eligibleLessons = [];
    const skippedLessons = [];
    
    studentPerformance.userPerformance.forEach(perf => {
      if (perf.score >= HIGH_SCORE_THRESHOLD) {
        skippedLessons.push({
          lessonId: perf.lessonId,
          score: perf.score,
          reason: `Score ${perf.score}/100 is too high (>= ${HIGH_SCORE_THRESHOLD})`
        });
      } else {
        eligibleLessons.push(perf);
      }
    });

    console.log('📊 Eligible lessons:', eligibleLessons.map(l => `L${l.lessonId}(${l.score})`).join(', '));
    console.log('🎯 Skipped lessons:', skippedLessons.map(l => `L${l.lessonId}(${l.score})`).join(', ') || 'None');

    if (eligibleLessons.length === 0) {
      console.warn('⚠️ All lessons scored high! Using all lessons.');
      eligibleLessons.push(...studentPerformance.userPerformance);
    }

    // STEP 2: Get lessons and count words
    const eligibleLessonIds = eligibleLessons.map(l => l.lessonId);
    const filteredLessons = lessonsInUnit.filter(lesson => 
      eligibleLessonIds.includes(lesson.id)
    );

    const totalAvailableWords = filteredLessons.reduce((sum, lesson) => 
      sum + (lesson.words?.length || 0), 0
    );

    console.log('📚 Total available words:', totalAvailableWords);

    // STEP 3: Adjust question count
    const totalQuestions = Math.min(MAX_QUESTIONS, totalAvailableWords);
    
    if (totalQuestions < MAX_QUESTIONS) {
      console.warn(`⚠️ Only ${totalAvailableWords} unique words available!`);
      console.warn(`📉 Reducing quiz from ${MAX_QUESTIONS} to ${totalQuestions} questions`);
    }

    if (totalQuestions === 0) {
      throw new Error('No words available for quiz generation!');
    }

    // STEP 4: Calculate distribution
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
      
      return {
        ...lesson,
        maxWordsInLesson,
        proportion,
        exactQuestions,
        assignedQuestions
      };
    });

    // STEP 5: Adjust totals
    let totalAssigned = questionDistribution.reduce((sum, l) => sum + l.assignedQuestions, 0);
    
    if (totalAssigned !== totalQuestions) {
      questionDistribution.sort((a, b) => {
        const remainderA = a.exactQuestions - a.assignedQuestions;
        const remainderB = b.exactQuestions - b.assignedQuestions;
        return remainderB - remainderA;
      });
      
      const diff = totalQuestions - totalAssigned;
      for (let i = 0; i < Math.abs(diff); i++) {
        const lesson = questionDistribution[i % questionDistribution.length];
        
        if (diff > 0) {
          if (lesson.assignedQuestions < lesson.maxWordsInLesson) {
            lesson.assignedQuestions++;
          }
        } else {
          if (lesson.assignedQuestions > 0) {
            lesson.assignedQuestions--;
          }
        }
      }
    }

    questionDistribution.forEach((lesson) => {
      if (lesson.assignedQuestions === 0 && lesson.maxWordsInLesson > 0 && eligibleLessons.length <= totalQuestions) {
        const highest = questionDistribution.reduce((max, l) => 
          l.assignedQuestions > max.assignedQuestions ? l : max
        );
        if (highest.assignedQuestions > 1) {
          highest.assignedQuestions--;
          lesson.assignedQuestions = 1;
        }
      }
    });

    console.log('📊 Question Distribution:');
    questionDistribution.forEach(l => {
      console.log(`  Lesson ${l.lessonId}: ${l.assignedQuestions} questions (score: ${l.score}/100)`);
    });

    // STEP 6-7: Build summaries
    const lessonSummaries = filteredLessons.map(lesson => {
      const wordsWithEmoji = lesson.words.map((word, index) => {
        const emoji = lesson.emoji?.[index] || '📝';
        return `${emoji} ${word}`;
      }).join(', ');
      
      return `Lesson ${lesson.id}: "${lesson.title}"
- Focus: ${lesson.focus}
- Words: ${wordsWithEmoji}
- Total words: ${lesson.words.length}`;
    }).join('\n\n');

    const performanceAnalysis = eligibleLessons.map(perf => {
      const issues = [];
      
      if (perf.matchingScore < 15) issues.push(`❌ WEAK: Word matching (${perf.matchingScore}/20)`);
      else if (perf.matchingScore >= 18) issues.push(`✅ STRONG: Word matching (${perf.matchingScore}/20)`);
      else issues.push(`⚠️ OK: Word matching (${perf.matchingScore}/20)`);
      
      if (perf.fillwordsScore < 28) issues.push(`❌ WEAK: Spelling (${perf.fillwordsScore}/40)`);
      else if (perf.fillwordsScore >= 35) issues.push(`✅ STRONG: Spelling (${perf.fillwordsScore}/40)`);
      else issues.push(`⚠️ OK: Spelling (${perf.fillwordsScore}/40)`);
      
      if (perf.quizScore < 28) issues.push(`❌ WEAK: Comprehension (${perf.quizScore}/40)`);
      else if (perf.quizScore >= 35) issues.push(`✅ STRONG: Comprehension (${perf.quizScore}/40)`);
      else issues.push(`⚠️ OK: Comprehension (${perf.quizScore}/40)`);

      return `Lesson ${perf.lessonId}: ${perf.score}/100 points
${issues.join('\n')}`;
    }).join('\n\n');

    // STEP 8: Distribution prompt
    const distributionText = questionDistribution
      .filter(l => l.assignedQuestions > 0)
      .map(l => `- Lesson ${l.lessonId}: EXACTLY ${l.assignedQuestions} question${l.assignedQuestions > 1 ? 's' : ''} (score: ${l.score}/100, ${l.maxWordsInLesson} words available)`)
      .join('\n');

    const questionDistributionPrompt = `
📊 EXACT QUESTION DISTRIBUTION (MUST FOLLOW):
${distributionText}

TOTAL: Exactly ${totalQuestions} questions${totalQuestions < MAX_QUESTIONS ? ` (reduced from ${MAX_QUESTIONS} due to limited words)` : ''}

🚫 EXCLUDED LESSONS (DO NOT USE):
${skippedLessons.length > 0 ? 
  skippedLessons.map(l => `- Lesson ${l.lessonId}: Scored ${l.score}/100 (too high, >= ${HIGH_SCORE_THRESHOLD})`).join('\n') :
  'None - all lessons included'}

⚠️ CRITICAL RULES:
1. Use ONLY words from the lessons listed above
2. NEVER use words from excluded lessons
3. Each word can appear ONLY ONCE across all questions
4. Follow the EXACT question count for each lesson
5. Do NOT repeat any emoji/word combination
6. You have exactly ${totalAvailableWords} unique words available - use each word ONCE only`;

    // ✅ STEP 9: IMPROVED RANDOMIZATION - Ensure good distribution
    const randomSeed = Math.floor(Math.random() * 10000);
    const timestamp = new Date().toISOString();
    
    // Create base positions array based on number of questions
    const basePositions = [];
    for (let i = 0; i < totalQuestions; i++) {
      basePositions.push(i % 3); // 0, 1, 2, 0, 1, 2, 0, 1, 2, 0...
    }
    
    // Shuffle to randomize
    const randomPositions = shuffleArray(basePositions);
    
    console.log('🎲 Random answer positions:', randomPositions);
    console.log('   Distribution:', {
      first: randomPositions.filter(p => p === 0).length,
      middle: randomPositions.filter(p => p === 1).length,
      last: randomPositions.filter(p => p === 2).length
    });

    const prompt = `You are a teacher making a CHALLENGING quiz for kids learning to read English (ages 5-7).

🎲 RANDOMIZATION SEED: ${randomSeed}
⏰ GENERATED AT: ${timestamp}

📚 AVAILABLE LESSONS (Words you CAN use):
${lessonSummaries}

📊 STUDENT'S PERFORMANCE:
${performanceAnalysis}

${questionDistributionPrompt}

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
   
   🎲 MANDATORY: Use these randomly generated positions for each question:
   ${randomPositions.map((pos, i) => `Question ${i + 1}: Put correct answer at position ${pos} ${pos === 0 ? '(FIRST)' : pos === 1 ? '(MIDDLE)' : '(LAST)'}`).join('\n   ')}
   
   Position 0 = FIRST option in the array
   Position 1 = MIDDLE option in the array  
   Position 2 = LAST option in the array
   
   Example for position 0: {"options": ["cat", "bat", "hat"], "correctAnswer": "cat"}
   Example for position 1: {"options": ["bat", "cat", "hat"], "correctAnswer": "cat"}
   Example for position 2: {"options": ["bat", "hat", "cat"], "correctAnswer": "cat"}

4. CREATE VARIETY - Use DIFFERENT strategies:
   STRATEGY A - Mix different vowel sounds
   STRATEGY B - Similar starting letters
   STRATEGY C - Words that look similar
   STRATEGY D - Random mix

5. NO DUPLICATES:
   • Each word/emoji can only appear ONCE as the correct answer
   • Use different words from the available lessons
   • You have exactly ${totalAvailableWords} words - use each ONCE

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

🎲 REMEMBER: 
1. Create EXACTLY ${totalQuestions} questions
2. Follow the EXACT answer positions listed above
3. NO duplicate words/emojis
4. MUST follow the position array exactly!

Make ${totalQuestions} DIFFERENT questions now. Return ONLY the JSON.`;

    console.log('📤 Sending request to Gemini...');
    
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    
    console.log('📥 Received response');

    // Save to localStorage
    try {
      localStorage.setItem('last_ai_quiz_response', JSON.stringify({
        timestamp,
        randomSeed,
        randomPositions,
        model: MODEL_NAME,
        testingMode: TESTING_MODE,
        highScoreThreshold: HIGH_SCORE_THRESHOLD,
        maxQuestions: MAX_QUESTIONS,
        actualQuestions: totalQuestions,
        totalAvailableWords,
        eligibleLessons: eligibleLessons.map(l => ({ id: l.lessonId, score: l.score })),
        skippedLessons: skippedLessons,
        questionDistribution: questionDistribution.map(l => ({
          lessonId: l.lessonId,
          score: l.score,
          questions: l.assignedQuestions,
          availableWords: l.maxWordsInLesson
        })),
        rawResponse: rawText,
        prompt: prompt,
        lessonSummaries,
        performanceAnalysis
      }, null, 2));
      console.log('💾 Saved to localStorage');
    } catch (e) {
      console.warn('⚠️ Could not save to localStorage');
    }

    // Parse response
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }
    
    const quizData = JSON.parse(cleanText);
    console.log('✅ Generated', quizData.questions?.length || 0, 'unique questions');
    
    // Verify
    if (quizData.questions?.length !== totalQuestions) {
      console.warn(`⚠️ Expected ${totalQuestions} questions but got ${quizData.questions?.length}`);
    }
    
    const usedWords = new Set();
    const duplicates = [];
    quizData.questions.forEach(q => {
      if (usedWords.has(q.correctAnswer)) {
        duplicates.push(q.correctAnswer);
      }
      usedWords.add(q.correctAnswer);
    });
    
    if (duplicates.length > 0) {
      console.warn('⚠️ Found duplicate words:', duplicates);
    } else {
      console.log('✅ No duplicates - all words unique!');
    }
    
    console.log('🎯 Verifying answer positions...');
    quizData.questions.forEach((q, i) => {
      const actualPos = q.options.indexOf(q.correctAnswer);
      const expectedPos = randomPositions[i];
      if (actualPos === expectedPos) {
        console.log(`  Q${i + 1}: ✅ Position ${actualPos} (expected ${expectedPos})`);
      } else {
        console.warn(`  Q${i + 1}: ❌ Position ${actualPos} (expected ${expectedPos})`);
      }
    });

    return quizData.questions || [];

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

export async function generateQuizFeedback(correct, total, incorrectQuestions) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    try {
      localStorage.setItem('last_ai_feedback', JSON.stringify({
        timestamp: new Date().toISOString(),
        feedback: text,
        score: { correct, total, percentage }
      }, null, 2));
    } catch (e) {}
    
    return text;

  } catch (error) {
    console.error('❌ Feedback error:', error);
    throw error;
  }
}