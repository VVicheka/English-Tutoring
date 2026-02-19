"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { generatePersonalizedQuiz, generateQuizFeedback } from '../../lib/gemini';
import { getLessonById } from '../../data/lessons';
import { MultipleChoiceQuestion } from '../../lesson/components/QuizQuestionComponents';

// Quiz metadata
const quizMetadata = {
  quiz1: {
    unit: 1,
    title: "Unit 1 Adventure Quiz",
    lessonsIncluded: [1, 2, 3, 4],
    description: "Join the jungle safari to test your reading skills!",
    mascot: "🦁",
    theme: "jungle"
  },
  quiz2: {
    unit: 2,
    title: "Unit 2 Ocean Quest",
    lessonsIncluded: [5, 6, 7, 8],
    description: "Dive deep and discover ocean words!",
    mascot: "🐠",
    theme: "ocean"
  },
  quiz3: {
    unit: 3,
    title: "Unit 3 Space Mission",
    lessonsIncluded: [9, 10, 11, 12],
    description: "Blast off and reach for the stars!",
    mascot: "🚀",
    theme: "space"
  }
};

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Theme colors based on quiz type
  const themes = {
    jungle: {
      bg: "from-green-300 via-yellow-200 to-green-400",
      primary: "bg-green-500 hover:bg-green-600",
      secondary: "bg-yellow-500 hover:bg-yellow-600",
      accent: "border-green-400",
      text: "text-green-700"
    },
    ocean: {
      bg: "from-blue-300 via-cyan-200 to-blue-400",
      primary: "bg-blue-500 hover:bg-blue-600",
      secondary: "bg-cyan-500 hover:bg-cyan-600",
      accent: "border-blue-400",
      text: "text-blue-700"
    },
    space: {
      bg: "from-purple-400 via-pink-300 to-indigo-400",
      primary: "bg-purple-500 hover:bg-purple-600",
      secondary: "bg-pink-500 hover:bg-pink-600",
      accent: "border-purple-400",
      text: "text-purple-700"
    }
  };

  const currentTheme = themes[quizMetadata[quizId]?.theme] || themes.jungle;

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/sign-in');
          return;
        }
        setUser(user);
      } catch (error) {
        console.error('Error checking auth:', error);
        setError('Authentication error');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  // Generate quiz when component loads
  useEffect(() => {
    if (user && !quizData) {
      generateQuiz();
    }
  }, [user, quizId]);

  const generateQuiz = async () => {
    setGenerating(true);
    setError(null);

    try {
      const metadata = quizMetadata[quizId];
      if (!metadata) {
        throw new Error('Invalid quiz ID');
      }

      // Fetch user's performance on the lessons
      const { data: userProgress, error: progressError } = await supabase
        .from('user_lesson')
        .select('*')
        .eq('user_id', user.id)
        .in('lesson_id', metadata.lessonsIncluded);

      if (progressError) throw progressError;

      // Prepare lessons data with emoji
      const lessonsData = metadata.lessonsIncluded.map(lessonId => {
        const lesson = getLessonById(lessonId);
        return {
          id: lessonId,
          title: lesson.title,
          focus: lesson.focus,
          words: lesson.content.vocabulary.words.map(w => w.word),
          emoji: lesson.content.vocabulary.words.map(w => w.emoji || '📝')
        };
      });

      // Prepare user performance data with score breakdown
      const userPerformance = metadata.lessonsIncluded.map(lessonId => {
        const progress = userProgress?.find(p => p.lesson_id === lessonId);
        const score = progress?.best_score || 0;
        const matchingScore = progress?.matching_score || 0;
        const fillwordsScore = progress?.fillwords_score || 0;
        const quizScore = progress?.quiz_score || 0;

        return {
          lessonId,
          score,
          matchingScore,
          fillwordsScore,
          quizScore,
          stars: progress?.best_stars || 0
        };
      });

      console.log('Generating quiz with data:', { lessonsData, userPerformance });

      // Generate quiz using Gemini
      const questions = await generatePersonalizedQuiz(
        { userPerformance },
        lessonsData
      );

      // Structure the quiz data
      const generatedQuizData = {
        quizId,
        metadata: metadata,
        questions: questions
      };

      setQuizData(generatedQuizData);
      console.log('Quiz generated successfully:', generatedQuizData);
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError(error.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerSelect = (answer, isCorrect) => {
    // Store the answer
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answer
    });

    // Mark this question as answered
    setAnsweredQuestions({
      ...answeredQuestions,
      [currentQuestion]: {
        answer,
        isCorrect,
        timestamp: Date.now()
      }
    });
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Calculate results
    let correct = 0;
    const incorrectQuestions = [];

    quizData.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      } else {
        incorrectQuestions.push({
          question: question.question,
          correctAnswer: question.correctAnswer,
          userAnswer: selectedAnswers[index] || 'No answer'
        });
      }
    });

    const score = Math.round((correct / quizData.questions.length) * 100);
    const results = {
      score,
      correct,
      total: quizData.questions.length
    };

    setQuizResults(results);

    if (score >= 70) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    setShowResults(true);

    // Generate AI feedback
    try {
      const feedbackText = await generateQuizFeedback(
        correct,
        quizData.questions.length,
        incorrectQuestions
      );

      setFeedback({
        encouragement: feedbackText,
        recommendations: incorrectQuestions.length > 0
          ? [`Practice ${incorrectQuestions.length} questions you missed`, 'Review the explanations', 'Try the quiz again to improve']
          : ['Perfect score! Amazing job!', 'Try the next quiz to continue learning']
      });
    } catch (err) {
      console.error('Error generating feedback:', err);
      setFeedback({
        encouragement: score >= 80 ? "Great job! 🎉" : score >= 60 ? "Good work! 👍" : "Keep practicing! 💪",
        recommendations: ['Review the lessons', 'Try again']
      });
    }

    // Save to database
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('personalized_quiz')
        .insert({
          user_id: user.id,
          quiz_type: quizId,
          score: score,
          correct_answers: correct,
          total_questions: quizData.questions.length,
          quiz_data: quizData,
          user_answers: selectedAnswers,
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error saving quiz:', insertError);
      } else {
        console.log('✅ Quiz saved successfully:', insertData);
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} flex items-center justify-center`}>
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center transform hover:scale-105 transition-transform">
          <div className="text-8xl mb-6 animate-bounce">🎈</div>
          <div className="flex space-x-2 justify-center">
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-4 h-4 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // Generating quiz
  if (generating) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} flex items-center justify-center p-4`}>
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg transform hover:rotate-1 transition-transform">
          <div className="text-9xl mb-6 animate-spin">{quizMetadata[quizId]?.mascot}</div>
          <h2 className="text-4xl font-black text-gray-800 mb-4 animate-pulse">
            Creating Your Adventure!
          </h2>
          <div className="flex justify-center space-x-3 mb-6">
            <div className="w-5 h-5 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-5 h-5 bg-yellow-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-5 h-5 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
          <p className="text-xl text-gray-600">
            ✨ Making special questions just for you! ✨
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} flex items-center justify-center p-4`}>
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <div className="text-9xl mb-6 animate-bounce">😢</div>
          <h2 className="text-4xl font-black text-gray-800 mb-4">Oops!</h2>
          <p className="text-xl text-red-600 mb-8">{error}</p>
          <div className="space-y-4">
            <button
              onClick={generateQuiz}
              className={`w-full px-8 py-4 ${currentTheme.primary} text-white rounded-2xl font-black text-xl shadow-lg transform hover:scale-105 transition-all`}
            >
              🔄 Try Again!
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full px-8 py-4 bg-gray-400 hover:bg-gray-500 text-white rounded-2xl font-black text-xl shadow-lg transform hover:scale-105 transition-all"
            >
              🏠 Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results view
  if (showResults && quizResults) {
    const stars = quizResults.score >= 90 ? 3 : quizResults.score >= 70 ? 2 : quizResults.score >= 50 ? 1 : 0;
    const celebration = quizResults.score >= 90 ? "🎉🎊🏆" : quizResults.score >= 70 ? "🎉😊👏" : quizResults.score >= 50 ? "👍😊✨" : "💪🌟📚";

    return (
      <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} flex items-center justify-center p-4 relative overflow-hidden`}>
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  fontSize: '2rem'
                }}
              >
                {['🎉', '⭐', '🎊', '✨', '🌟'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-3xl w-full transform hover:scale-105 transition-transform">
          {/* Celebration */}
          <div className="text-center mb-10">
            <div className="text-9xl mb-6 animate-bounce">{celebration.split('').map((emoji, i) => (
              <span key={i} className="inline-block animate-bounce" style={{animationDelay: `${i * 0.1}s`}}>
                {emoji}
              </span>
            ))}</div>

            {/* Stars */}
            <div className="flex justify-center space-x-4 mb-6">
              {[1, 2, 3].map((star) => (
                <span
                  key={star}
                  className={`text-7xl transition-all duration-500 ${
                    star <= stars ? 'animate-bounce scale-100' : 'opacity-20 scale-75'
                  }`}
                  style={{ animationDelay: `${star * 0.2}s` }}
                >
                  ⭐
                </span>
              ))}
            </div>

            <h1 className="text-5xl font-black text-gray-800 mb-3 animate-pulse">
              Quiz Complete!
            </h1>
            <p className="text-2xl text-gray-600 font-bold">{quizMetadata[quizId].title}</p>
          </div>

          {/* Score Display */}
          <div className={`bg-gradient-to-r ${currentTheme.bg} rounded-3xl p-10 mb-10 shadow-xl transform hover:scale-105 transition-transform`}>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700 mb-4">YOUR SCORE</p>
              <div className="flex items-center justify-center space-x-6">
                <span className="text-8xl font-black text-white drop-shadow-lg">
                  {quizResults.score}
                </span>
                <span className="text-6xl text-white/70">/</span>
                <span className="text-7xl font-black text-white/90">100</span>
              </div>
              <p className="text-2xl font-bold text-gray-700 mt-4">
                {quizResults.correct} out of {quizResults.total} correct! 🎯
              </p>
            </div>
          </div>

          {/* AI Feedback */}
          {feedback && (
            <div className="mb-10">
              <div className="bg-yellow-50 rounded-3xl p-8 mb-6 border-4 border-yellow-300 shadow-lg transform hover:rotate-1 transition-transform">
                <div className="flex items-start space-x-4">
                  <div className="text-5xl">{quizMetadata[quizId]?.mascot}</div>
                  <div>
                    <h3 className="text-2xl font-black text-yellow-800 mb-3">Your Teacher Says:</h3>
                    <p className="text-xl text-gray-800 leading-relaxed">{feedback.encouragement}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-3xl p-8 border-4 border-green-300 shadow-lg">
                <h3 className="text-2xl font-black text-green-800 mb-4">📚 What to Practice:</h3>
                <ul className="space-y-3">
                  {feedback.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-2xl text-green-600 mt-1">✓</span>
                      <span className="text-lg text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => {
                setShowResults(false);
                setQuizData(null);
                setCurrentQuestion(0);
                setSelectedAnswers({});
                setAnsweredQuestions({});
                generateQuiz();
              }}
              className={`px-10 py-6 ${currentTheme.primary} text-white rounded-3xl font-black text-2xl shadow-xl transform hover:scale-110 hover:rotate-2 transition-all`}
            >
              🔄 Try Again!
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-10 py-6 bg-gray-500 hover:bg-gray-600 text-white rounded-3xl font-black text-2xl shadow-xl transform hover:scale-110 hover:rotate-2 transition-all"
            >
              🏠 Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz interface
  if (!quizData || !quizData.questions) {
    return null;
  }

  const question = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;
  const isQuestionAnswered = answeredQuestions[currentQuestion] !== undefined;
  const allQuestionsAnswered = Object.keys(answeredQuestions).length === quizData.questions.length;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} p-4`}>
      <div className="max-w-5xl mx-auto py-8">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-6xl animate-bounce">{quizMetadata[quizId].mascot}</div>
              <div>
                <h1 className="text-3xl font-black text-gray-800">{quizMetadata[quizId].title}</h1>
                <p className="text-lg text-gray-600">{quizMetadata[quizId].description}</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-red-400 hover:bg-red-500 text-white rounded-2xl font-black text-lg shadow-lg transform hover:scale-110 transition-all"
            >
              ✖️ Exit
            </button>
          </div>

          {/* Fun Progress Bar */}
          <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full bg-gradient-to-r ${currentTheme.bg} transition-all duration-500 flex items-center justify-end pr-4`}
              style={{ width: `${progress}%` }}
            >
              <span className="text-2xl animate-bounce">{quizMetadata[quizId].mascot}</span>
            </div>
          </div>
          <p className="text-center text-xl font-bold text-gray-700 mt-4">
            Question {currentQuestion + 1} of {quizData.questions.length} 🎯
          </p>
        </div>

        {/* Question Component */}
        <MultipleChoiceQuestion
          question={question.question}
          options={question.options}
          correctAnswer={question.correctAnswer}
          onAnswer={handleAnswerSelect}
          showResult={isQuestionAnswered}
          userAnswer={selectedAnswers[currentQuestion]}
        />

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`px-10 py-5 rounded-3xl font-black text-2xl shadow-xl transform transition-all ${
              currentQuestion === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-500 hover:bg-gray-600 text-white hover:scale-110 hover:rotate-2'
            }`}
          >
            ⬅️ Back
          </button>

          {/* Progress Dots */}
          <div className="flex space-x-3">
            {quizData.questions.map((_, index) => (
              <div
                key={index}
                className={`w-5 h-5 rounded-full transition-all duration-300 ${
                  answeredQuestions[index]
                    ? `${currentTheme.primary} animate-bounce`
                    : index === currentQuestion
                    ? 'bg-gray-400 ring-4 ring-gray-300 scale-125'
                    : 'bg-gray-200'
                }`}
              ></div>
            ))}
          </div>

          {currentQuestion === quizData.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered}
              className={`px-10 py-5 rounded-3xl font-black text-2xl shadow-xl transform transition-all ${
                allQuestionsAnswered
                  ? 'bg-green-500 hover:bg-green-600 text-white hover:scale-110 hover:rotate-2 animate-pulse'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              🎉 Finish!
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isQuestionAnswered}
              className={`px-10 py-5 rounded-3xl font-black text-2xl shadow-xl transform transition-all ${
                isQuestionAnswered
                  ? `${currentTheme.primary} text-white hover:scale-110 hover:rotate-2`
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