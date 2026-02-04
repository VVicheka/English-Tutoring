"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { generatePersonalizedQuiz, generateQuizFeedback } from '../../lib/gemini';
import { getLessonById } from '../../data/lessons';

// Quiz metadata
const quizMetadata = {
  quiz1: {
    unit: 1,
    title: "Unit 1 Checkpoint Quiz",
    lessonsIncluded: [1, 2, 3, 4],
    description: "Test your knowledge of short vowels a, e, and i!"
  },
  quiz2: {
    unit: 2,
    title: "Unit 2 Checkpoint Quiz",
    lessonsIncluded: [5, 6, 7, 8],
    description: "Show what you learned about short o, u, and blends!"
  },
  quiz3: {
    unit: 3,
    title: "Unit 3 Final Quiz",
    lessonsIncluded: [9, 10, 11, 12],
    description: "Final challenge with long vowels and all we've learned!"
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
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

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
          emoji: lesson.content.vocabulary.words.map(w => w.emoji || '📝') // Extract emojis
        };
      });

      // Prepare user performance data with score breakdown
      const userPerformance = metadata.lessonsIncluded.map(lessonId => {
        const progress = userProgress?.find(p => p.lesson_id === lessonId);
        const score = progress?.best_score || 0;
        const matchingScore = progress?.matching_score || 0;
        const fillwordsScore = progress?.fillwords_score || 0;
        const quizScore = progress?.quiz_score || 0;
        
        // Determine weak/strong areas based on individual activity scores
        let weakAreas = [];
        let strongAreas = [];
        
        if (matchingScore < 15) weakAreas.push('word-image matching');
        else if (matchingScore >= 18) strongAreas.push('word recognition');
        
        if (fillwordsScore < 28) weakAreas.push('spelling and word formation');
        else if (fillwordsScore >= 35) strongAreas.push('phonics and spelling');
        
        if (quizScore < 28) weakAreas.push('comprehension');
        else if (quizScore >= 35) strongAreas.push('reading comprehension');

        return {
          lessonId,
          score,
          matchingScore,
          fillwordsScore,
          quizScore,
          stars: progress?.best_stars || 0,
          weakAreas,
          strongAreas
        };
      });

      console.log('Generating quiz with data:', { lessonsData, userPerformance });

      // Generate quiz using Gemini - pass correct parameters
      const questions = await generatePersonalizedQuiz(
        { userPerformance }, // studentPerformance object
        lessonsData // lessonsInUnit array
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

  const handleAnswerSelect = (answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answer
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
          ? [`Practice ${incorrectQuestions.length} questions you missed`, 'Review the explanations below', 'Try the quiz again to improve your score']
          : ['You got all questions correct! Great job!', 'Try the next unit to continue learning']
      });
    } catch (err) {
      console.error('Error generating feedback:', err);
      // Set default feedback if API fails
      setFeedback({
        encouragement: score >= 80 ? "Great job!" : score >= 60 ? "Good work!" : "Keep practicing!",
        recommendations: ['Review the lessons again', 'Try the quiz again']
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
        
        // Save individual questions
        const questionsToInsert = quizData.questions.map((q, index) => ({
          personalized_quiz_id: insertData.id,
          question: q.question,
          correct_answer: q.correctAnswer,
          options: q.options,
          explanation: q.explanation
        }));

        const { error: questionsError } = await supabase
          .from('personalized_quiz_questions')
          .insert(questionsToInsert);

        if (questionsError) {
          console.error('Error saving questions:', questionsError);
        } else {
          console.log('✅ Questions saved successfully');
        }
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Generating quiz
  if (generating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4 animate-bounce">🎯</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Creating Your Personalized Quiz!</h2>
          <div className="flex justify-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
          <p className="text-gray-600">We're making special questions just for you based on what you've learned!</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={generateQuiz}
              className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-all"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results view
  if (showResults && quizResults) {
    const stars = quizResults.score >= 90 ? 3 : quizResults.score >= 70 ? 2 : quizResults.score >= 50 ? 1 : 0;
    const performanceColor = quizResults.score >= 90 ? 'text-yellow-500' : quizResults.score >= 70 ? 'text-green-500' : quizResults.score >= 50 ? 'text-blue-500' : 'text-orange-500';

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3].map((star) => (
                <span key={star} className={`text-4xl ${star <= stars ? 'animate-bounce' : 'opacity-30'}`}>
                  ⭐
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Quiz Complete!</h1>
            <p className="text-xl text-gray-600">{quizMetadata[quizId].title}</p>
          </div>

          {/* Score Display */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-2">Your Score</p>
              <div className="flex items-center justify-center space-x-4">
                <span className={`text-6xl font-bold ${performanceColor}`}>{quizResults.score}</span>
                <span className="text-3xl text-gray-400">/</span>
                <span className="text-4xl font-bold text-gray-600">100</span>
              </div>
              <p className="text-gray-600 mt-2">
                {quizResults.correct} out of {quizResults.total} correct
              </p>
            </div>
          </div>

          {/* AI Feedback */}
          {feedback && (
            <div className="mb-6">
              <div className="bg-blue-50 rounded-lg p-5 mb-4 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-2">💬 Your Teacher Says:</h3>
                <p className="text-gray-700">{feedback.encouragement}</p>
              </div>

              <div className="bg-green-50 rounded-lg p-5 border border-green-200">
                <h3 className="text-lg font-bold text-green-800 mb-3">📚 What to Practice:</h3>
                <ul className="space-y-2">
                  {feedback.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => {
                setShowResults(false);
                setQuizData(null);
                setCurrentQuestion(0);
                setSelectedAnswers({});
                generateQuiz();
              }}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all"
            >
              🔄 Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
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
  const isAnswered = selectedAnswers[currentQuestion] !== undefined;
  const isLastQuestion = currentQuestion === quizData.questions.length - 1;
  const allQuestionsAnswered = Object.keys(selectedAnswers).length === quizData.questions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">{quizMetadata[quizId].title}</h1>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-all"
            >
              Exit
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            Question {currentQuestion + 1} of {quizData.questions.length}
          </p>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="mb-8">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {currentQuestion + 1}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 flex-1">
                {question.question}
              </h2>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-4">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion] === option;
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-3 h-3 bg-white rounded-full"></div>}
                    </div>
                    <span className="text-lg font-medium text-gray-800">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              currentQuestion === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            ← Previous
          </button>

          {/* Answer Status Dots */}
          <div className="flex space-x-2">
            {quizData.questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  selectedAnswers[index] !== undefined
                    ? 'bg-purple-500'
                    : index === currentQuestion
                    ? 'bg-purple-300 ring-2 ring-purple-400'
                    : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                allQuestionsAnswered
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                isAnswered
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}