"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { generateChallengeQuiz, generateQuizFeedback } from '../lib/gemini';
import { MultipleChoiceQuestion } from '../lesson/components/QuizQuestionComponents';

const LEVELS = [
  {
    id: 'easy',
    title: 'Easy',
    mascot: '🐣',
    blurb: 'Simple words and short vowels',
    bg: 'from-green-300 via-emerald-200 to-green-400',
    primary: 'bg-green-500 hover:bg-green-600'
  },
  {
    id: 'medium',
    title: 'Medium',
    mascot: '🦊',
    blurb: 'Blends, digraphs, longer words',
    bg: 'from-blue-300 via-cyan-200 to-blue-400',
    primary: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    id: 'hard',
    title: 'Hard',
    mascot: '🐉',
    blurb: 'Long vowels, silent e, rhyming',
    bg: 'from-purple-400 via-pink-300 to-indigo-400',
    primary: 'bg-purple-500 hover:bg-purple-600'
  }
];

export default function ChallengePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/sign-in');
        return;
      }
      setUser(user);
      setAuthChecked(true);
    })();
  }, [router]);

  const currentLevelConfig = selectedLevel
    ? LEVELS.find(l => l.id === selectedLevel)
    : LEVELS[1];

  const startQuiz = async (levelId) => {
    setSelectedLevel(levelId);
    setError(null);
    setGenerating(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setAnsweredQuestions({});
    setShowResults(false);
    setQuizResults(null);
    setFeedback(null);

    try {
      const questions = await generateChallengeQuiz(levelId);
      setQuizData({ level: levelId, questions });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not generate challenge quiz.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerSelect = (answer, isCorrect) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: answer });
    setAnsweredQuestions({
      ...answeredQuestions,
      [currentQuestion]: { answer, isCorrect, timestamp: Date.now() }
    });
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const handleSubmit = async () => {
    let correct = 0;
    const incorrectQuestions = [];
    quizData.questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctAnswer) correct++;
      else incorrectQuestions.push({
        question: q.question,
        correctAnswer: q.correctAnswer,
        userAnswer: selectedAnswers[i] || 'No answer'
      });
    });

    const score = Math.round((correct / quizData.questions.length) * 100);
    const results = { score, correct, total: quizData.questions.length };
    setQuizResults(results);
    setShowResults(true);

    try {
      const feedbackText = await generateQuizFeedback(
        correct,
        quizData.questions.length,
        incorrectQuestions
      );
      setFeedback({
        encouragement: feedbackText,
        recommendations: incorrectQuestions.length > 0
          ? [`Review ${incorrectQuestions.length} words you missed`, 'Try a harder level when ready!']
          : ['Perfect round! Try a harder level!', 'Come back anytime for fresh questions']
      });
    } catch (err) {
      setFeedback({
        encouragement: score >= 80 ? 'Awesome job! 🎉' : score >= 60 ? 'Nice work! 👍' : 'Keep practicing! 💪',
        recommendations: ['Try again with fresh questions']
      });
    }

    try {
      await supabase.from('personalized_quiz').insert({
        user_id: user.id,
        quiz_type: `challenge_${selectedLevel}`,
        score,
        correct_answers: correct,
        total_questions: quizData.questions.length,
        quiz_data: quizData,
        user_answers: selectedAnswers,
        is_completed: true,
        completed_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving challenge attempt:', err);
    }
  };

  const playAgainSameLevel = () => startQuiz(selectedLevel);
  const chooseDifferentLevel = () => {
    setSelectedLevel(null);
    setQuizData(null);
    setShowResults(false);
    setQuizResults(null);
    setFeedback(null);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setAnsweredQuestions({});
    setError(null);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="text-8xl mb-6 animate-bounce">🏆</div>
          <p className="text-xl text-gray-600">Loading challenge…</p>
        </div>
      </div>
    );
  }

  if (!selectedLevel && !quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 p-4">
        <div className="max-w-5xl mx-auto py-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="text-6xl animate-bounce">🏆</div>
                <div>
                  <h1 className="text-3xl font-black text-gray-800">Endless Challenge Quiz</h1>
                  <p className="text-lg text-gray-600">Fresh questions every time — pick your level!</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-red-400 hover:bg-red-500 text-white rounded-2xl font-black text-lg shadow-lg"
              >
                ✖️ Exit
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => startQuiz(level.id)}
                  className={`bg-gradient-to-br ${level.bg} rounded-3xl p-8 text-left shadow-xl transform hover:scale-105 transition-all`}
                >
                  <div className="text-7xl mb-4">{level.mascot}</div>
                  <h2 className="text-3xl font-black text-white drop-shadow mb-2">{level.title}</h2>
                  <p className="text-white/90 text-lg">{level.blurb}</p>
                  <div className={`mt-6 inline-block ${level.primary} text-white px-5 py-2 rounded-xl font-bold shadow`}>
                    Play ▶
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (generating) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${currentLevelConfig.bg} flex items-center justify-center p-4`}>
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg">
          <div className="text-9xl mb-6 animate-spin">{currentLevelConfig.mascot}</div>
          <h2 className="text-4xl font-black text-gray-800 mb-4 animate-pulse">
            Cooking up {currentLevelConfig.title} questions!
          </h2>
          <div className="flex justify-center space-x-3">
            <div className="w-5 h-5 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-5 h-5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-5 h-5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${currentLevelConfig.bg} flex items-center justify-center p-4`}>
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <div className="text-9xl mb-6">😢</div>
          <h2 className="text-4xl font-black text-gray-800 mb-4">Oops!</h2>
          <p className="text-xl text-red-600 mb-8">{error}</p>
          <div className="space-y-3">
            <button
              onClick={playAgainSameLevel}
              className={`w-full px-8 py-4 ${currentLevelConfig.primary} text-white rounded-2xl font-black text-xl shadow-lg`}
            >
              🔄 Try Again
            </button>
            <button
              onClick={chooseDifferentLevel}
              className="w-full px-8 py-4 bg-gray-400 hover:bg-gray-500 text-white rounded-2xl font-black text-xl shadow-lg"
            >
              🎯 Choose Level
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && quizResults) {
    const stars = quizResults.score >= 90 ? 3 : quizResults.score >= 70 ? 2 : quizResults.score >= 50 ? 1 : 0;

    return (
      <div className={`min-h-screen bg-gradient-to-br ${currentLevelConfig.bg} flex items-center justify-center p-4`}>
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-3xl w-full">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4 animate-bounce">{currentLevelConfig.mascot}</div>
            <div className="flex justify-center space-x-4 mb-6">
              {[1, 2, 3].map((star) => (
                <span
                  key={star}
                  className={`text-6xl transition-all ${star <= stars ? 'animate-bounce' : 'opacity-20 scale-75'}`}
                  style={{ animationDelay: `${star * 0.2}s` }}
                >
                  ⭐
                </span>
              ))}
            </div>
            <h1 className="text-5xl font-black text-gray-800 mb-2">Challenge Complete!</h1>
            <p className="text-xl text-gray-600 font-bold">{currentLevelConfig.title} Level</p>
          </div>

          <div className={`bg-gradient-to-r ${currentLevelConfig.bg} rounded-3xl p-10 mb-8 shadow-xl`}>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-700 mb-4">YOUR SCORE</p>
              <div className="flex items-center justify-center space-x-4">
                <span className="text-7xl font-black text-white drop-shadow">{quizResults.score}</span>
                <span className="text-5xl text-white/70">/</span>
                <span className="text-6xl font-black text-white/90">100</span>
              </div>
              <p className="text-xl font-bold text-gray-700 mt-3">
                {quizResults.correct} out of {quizResults.total} correct! 🎯
              </p>
            </div>
          </div>

          {feedback && (
            <div className="mb-8">
              <div className="bg-yellow-50 rounded-3xl p-6 mb-4 border-4 border-yellow-300 shadow">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{currentLevelConfig.mascot}</div>
                  <div>
                    <h3 className="text-xl font-black text-yellow-800 mb-2">Your Teacher Says:</h3>
                    <p className="text-lg text-gray-800">{feedback.encouragement}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-3xl p-6 border-4 border-green-300 shadow">
                <h3 className="text-xl font-black text-green-800 mb-3">📚 What to Try Next:</h3>
                <ul className="space-y-2">
                  {feedback.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <span className="text-xl text-green-600">✓</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={playAgainSameLevel}
              className={`px-6 py-4 ${currentLevelConfig.primary} text-white rounded-2xl font-black text-lg shadow-xl transform hover:scale-105 transition-all`}
            >
              🔄 Play Again
            </button>
            <button
              onClick={chooseDifferentLevel}
              className="px-6 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl transform hover:scale-105 transition-all"
            >
              🎯 Change Level
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl font-black text-lg shadow-xl transform hover:scale-105 transition-all"
            >
              🏠 Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quizData || !quizData.questions) return null;

  const question = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;
  const isQuestionAnswered = answeredQuestions[currentQuestion] !== undefined;
  const allQuestionsAnswered = Object.keys(answeredQuestions).length === quizData.questions.length;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentLevelConfig.bg} p-4`}>
      <div className="max-w-5xl mx-auto py-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-5xl animate-bounce">{currentLevelConfig.mascot}</div>
              <div>
                <h1 className="text-2xl font-black text-gray-800">Challenge Quiz — {currentLevelConfig.title}</h1>
                <p className="text-gray-600">Endless mode: every round is new!</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-5 py-2 bg-red-400 hover:bg-red-500 text-white rounded-2xl font-black shadow-lg"
            >
              ✖️ Exit
            </button>
          </div>

          <div className="relative w-full h-7 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full bg-gradient-to-r ${currentLevelConfig.bg} transition-all duration-500 flex items-center justify-end pr-3`}
              style={{ width: `${progress}%` }}
            >
              <span className="text-xl">{currentLevelConfig.mascot}</span>
            </div>
          </div>
          <p className="text-center text-lg font-bold text-gray-700 mt-3">
            Question {currentQuestion + 1} of {quizData.questions.length} 🎯
          </p>
        </div>

        <MultipleChoiceQuestion
          question={question.question}
          options={question.options}
          correctAnswer={question.correctAnswer}
          onAnswer={handleAnswerSelect}
          showResult={isQuestionAnswered}
          userAnswer={selectedAnswers[currentQuestion]}
        />

        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`px-8 py-4 rounded-3xl font-black text-xl shadow-xl transform transition-all ${
              currentQuestion === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-500 hover:bg-gray-600 text-white hover:scale-105'
            }`}
          >
            ⬅️ Back
          </button>

          <div className="flex space-x-2">
            {quizData.questions.map((_, index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all ${
                  answeredQuestions[index]
                    ? `${currentLevelConfig.primary} animate-bounce`
                    : index === currentQuestion
                    ? 'bg-gray-400 ring-4 ring-gray-300 scale-125'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {currentQuestion === quizData.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered}
              className={`px-8 py-4 rounded-3xl font-black text-xl shadow-xl transform transition-all ${
                allQuestionsAnswered
                  ? 'bg-green-500 hover:bg-green-600 text-white hover:scale-105 animate-pulse'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              🎉 Finish!
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isQuestionAnswered}
              className={`px-8 py-4 rounded-3xl font-black text-xl shadow-xl transform transition-all ${
                isQuestionAnswered
                  ? `${currentLevelConfig.primary} text-white hover:scale-105`
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next ➡️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
