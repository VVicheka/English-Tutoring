import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('⚠️ NEXT_PUBLIC_GEMINI_API_KEY is not set!');
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(API_KEY);

const MODEL_NAME = "gemini-2.5-flash";

/**
 * Generate personalized quiz questions based on student performance
 * @param {Object} studentPerformance - Contains userPerformance array with scores
 * @param {Array} lessonsInUnit - Array of lesson objects with id, title, focus, words, emoji
 * @returns {Promise<Array>} - Array of quiz questions
 */
export async function generatePersonalizedQuiz(studentPerformance, lessonsInUnit) {
  console.log('🔑 API Key present:', !!API_KEY);
  console.log(`🤖 Using model: ${MODEL_NAME} (1,500 free requests/day)`);
  
  try {
    // Build lesson summaries with emojis
    const lessonSummaries = lessonsInUnit.map(lesson => {
      const wordsWithEmoji = lesson.words.map((word, index) => {
        const emoji = lesson.emoji?.[index] || '📝';
        return `${emoji} ${word}`;
      }).join(', ');
      
      return `Lesson ${lesson.id}: "${lesson.title}"
- Focus: ${lesson.focus}
- Words: ${wordsWithEmoji}`;
    }).join('\n\n');

    // Analyze and count weak/ok/strong lessons
    const weakLessons = [];
    const okLessons = [];
    const strongLessons = [];
    
    studentPerformance.userPerformance.forEach(perf => {
      const avgScore = (perf.matchingScore/20 + perf.fillwordsScore/40 + perf.quizScore/40) / 3;
      
      if (avgScore < 0.60) { // Less than 60% average
        weakLessons.push(perf.lessonId);
      } else if (avgScore >= 0.85) { // 85% or higher
        strongLessons.push(perf.lessonId);
      } else {
        okLessons.push(perf.lessonId);
      }
    });

    // Build performance analysis
    const performanceAnalysis = studentPerformance.userPerformance.map(perf => {
      const issues = [];
      
      if (perf.matchingScore < 15) {
        issues.push(`❌ WEAK: Word matching (${perf.matchingScore}/20)`);
      } else if (perf.matchingScore >= 18) {
        issues.push(`✅ STRONG: Word matching (${perf.matchingScore}/20)`);
      } else {
        issues.push(`⚠️ OK: Word matching (${perf.matchingScore}/20)`);
      }
      
      if (perf.fillwordsScore < 28) {
        issues.push(`❌ WEAK: Spelling (${perf.fillwordsScore}/40)`);
      } else if (perf.fillwordsScore >= 35) {
        issues.push(`✅ STRONG: Spelling (${perf.fillwordsScore}/40)`);
      } else {
        issues.push(`⚠️ OK: Spelling (${perf.fillwordsScore}/40)`);
      }
      
      if (perf.quizScore < 28) {
        issues.push(`❌ WEAK: Comprehension (${perf.quizScore}/40)`);
      } else if (perf.quizScore >= 35) {
        issues.push(`✅ STRONG: Comprehension (${perf.quizScore}/40)`);
      } else {
        issues.push(`⚠️ OK: Comprehension (${perf.quizScore}/40)`);
      }

      return `Lesson ${perf.lessonId}: ${perf.score}/100 points
${issues.join('\n')}`;
    }).join('\n\n');

    // Calculate question distribution
    let questionDistribution = '';
    if (weakLessons.length > 0) {
      questionDistribution = `
📊 QUESTION DISTRIBUTION (Total: 10 questions):
- WEAK lessons (${weakLessons.join(', ')}): Generate 6-7 questions from these lessons
- OK lessons (${okLessons.join(', ') || 'none'}): Generate 2-3 questions from these lessons  
- STRONG lessons (${strongLessons.join(', ') || 'none'}): Generate 0-1 questions from these lessons

FOCUS MORE on lessons where student scored LOW!`;
    } else {
      questionDistribution = 'Generate questions evenly from all lessons.';
    }

    // Add randomization seed
    const randomSeed = Math.floor(Math.random() * 10000);
    const timestamp = new Date().toISOString();

    const prompt = `You are a teacher making a CHALLENGING quiz for kids learning to read English (ages 5-7).

🎲 RANDOMIZATION SEED: ${randomSeed}
⏰ GENERATED AT: ${timestamp}

IMPORTANT: Use the seed number above to create DIFFERENT questions each time!

📚 WORDS THE STUDENT LEARNED:
${lessonSummaries}

📊 STUDENT'S PERFORMANCE:
${performanceAnalysis}

${questionDistribution}

🎯 CREATE 10 UNIQUE CHALLENGING QUESTIONS - FOCUS ON ❌ WEAK AREAS

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
   ❌ "Which is 🐔 hen?" (gives away answer!)
   ✅ "What is this? 🐔" (must read)

3. 🔀 SHUFFLE ANSWER POSITIONS (VERY IMPORTANT):
   DON'T always put correct answer FIRST!
   
   MIX IT UP! Put correct answer at:
   - Position 0 (first) sometimes
   - Position 1 (middle) sometimes  
   - Position 2 (last) sometimes

4. CREATE VARIETY - Use DIFFERENT strategies:

   STRATEGY A - Mix different vowel sounds:
   Example: "Find: 🐔" → ["pig", "hen", "cat"] (i, e, a)
   
   STRATEGY B - Similar starting letters:
   Example: "Read: 🐷" → ["pen", "pig", "pan"] (all 'p')
   
   STRATEGY C - Words that look similar:
   Example: "Select: 🦇" → ["bet", "bat", "bit"] (only vowel changes)
   
   STRATEGY D - Random mix:
   Example: "What? 🎩" → ["fig", "pen", "hat"] (completely different)

5. EXPLANATION - Keep short:
   ✅ "🐱 = cat"
   ✅ "This is hen 🐔"

EXAMPLES WITH SHUFFLED ANSWERS:

✅ Correct at position 0 (first):
{"question": "Find: 🐱", "options": ["cat", "bet", "pin"], "correctAnswer": "cat"}

✅ Correct at position 1 (middle):
{"question": "What? 🐔", "options": ["pig", "hen", "cat"], "correctAnswer": "hen"}

✅ Correct at position 2 (last):
{"question": "Read: 🛏️", "options": ["bid", "bad", "bed"], "correctAnswer": "bed"}

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
1. Use seed ${randomSeed} for uniqueness
2. SHUFFLE answer positions (not always first!)
3. Generate MORE questions from WEAK lessons!

Make 10 DIFFERENT challenging questions now. Return ONLY the JSON.`;

    console.log('📤 Sending request to Gemini...');
    console.log('🎲 Randomization seed:', randomSeed);
    console.log('📊 Weak lessons:', weakLessons);
    console.log('📊 OK lessons:', okLessons);
    console.log('📊 Strong lessons:', strongLessons);
    
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
        model: MODEL_NAME,
        weakLessons,
        okLessons,
        strongLessons,
        rawResponse: rawText,
        prompt: prompt,
        lessonSummaries,
        performanceAnalysis
      }, null, 2));
      console.log('💾 Saved to localStorage with seed:', randomSeed);
    } catch (e) {
      console.warn('⚠️ Could not save to localStorage');
    }

    // Clean and parse JSON
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }
    
    const quizData = JSON.parse(cleanText);
    console.log('✅ Generated', quizData.questions?.length || 0, 'unique questions');

    return quizData.questions || [];

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

/**
 * Generate encouraging feedback for quiz completion
 */
export async function generateQuizFeedback(correct, total, incorrectQuestions) {
  try {
    console.log('💬 Generating feedback...');
    
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
    
    // Save feedback
    try {
      localStorage.setItem('last_ai_feedback', JSON.stringify({
        timestamp: new Date().toISOString(),
        feedback: text,
        score: { correct, total, percentage }
      }, null, 2));
      console.log('💾 Saved feedback to localStorage');
    } catch (e) {
      console.warn('⚠️ Could not save feedback');
    }
    
    console.log('✅ Feedback generated');
    return text;

  } catch (error) {
    console.error('❌ Feedback error:', error);
    throw error;
  }
}