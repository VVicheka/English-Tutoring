"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLessonById } from '../../data/lessons';
import { supabase } from '../../lib/supabase';

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id;
  const [error, setError] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showPreviousScore, setShowPreviousScore] = useState(false);
  const [previousScore, setPreviousScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('LessonPage - lessonId:', lessonId);
    
    // Don't run if we're already redirecting
    if (isRedirecting) return;

    const loadLessonAndScore = async () => {
      try {
        // Get lesson data
        const lesson = getLessonById(lessonId);
        console.log('Found lesson:', lesson);
        
        if (!lesson) {
          console.log('No lesson found, redirecting to home');
          setError('Lesson not found');
          setTimeout(() => router.push('/'), 2000);
          return;
        }

        // Check if user has completed this lesson before
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { data: previousProgress } = await supabase
              .from('user_lesson')
              .select('*')
              .eq('user_id', user.id)
              .eq('lesson_id', parseInt(lessonId))
              .maybeSingle();

            if (previousProgress && previousProgress.is_completed) {
              // User has completed this lesson before, show their previous score
              setPreviousScore({
                totalScore: previousProgress.best_score || 0,
                stars: previousProgress.best_stars || 0,
                matchingScore: previousProgress.matching_score || 0,
                fillwordsScore: previousProgress.fillwords_score || 0,
                quizScore: previousProgress.quiz_score || 0
              });
              setShowPreviousScore(true);
              setLoading(false);
              return; // Don't auto-redirect, let user see their score
            }
          }
        } catch (err) {
          console.error('Error checking previous score:', err);
          // Continue even if this fails
        }

        // Get expanded activities (same logic as in ActivityPage)
        const getExpandedActivities = (lesson) => {
          if (!lesson?.content?.practice?.activityB) {
            return lesson.activities;
          }
          
          const activities = [...lesson.activities];
          const practiceIndex = activities.indexOf('practice');
          if (practiceIndex !== -1) {
            activities.splice(practiceIndex, 1, 'matching', 'fillwords');
          }
          return activities;
        };

        const expandedActivities = getExpandedActivities(lesson);
        
        // Auto-redirect to first activity
        const firstActivity = expandedActivities[0];
        console.log('Redirecting to first activity:', firstActivity);
        
        setIsRedirecting(true);
        router.push(`/lesson/${lessonId}/${firstActivity}`);
        
      } catch (err) {
        console.error('Error in LessonPage:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadLessonAndScore();
  }, [lessonId, router, isRedirecting]);

  // ✅ NEW: Clear all localStorage data for this lesson when starting
  const clearLessonData = () => {
    console.log('🧹 Clearing all lesson data for lesson:', lessonId);
    
    try {
      // Clear all lesson-related localStorage keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(`lesson_${lessonId}`)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log('🗑️ Removed:', key);
      });
      
      console.log('✅ Cleared', keysToRemove.length, 'localStorage items');
    } catch (e) {
      console.error('❌ Error clearing localStorage:', e);
    }
  };

  const handleStartLesson = () => {
    // ✅ Clear all previous data before starting
    clearLessonData();
    
    const lesson = getLessonById(lessonId);
    const getExpandedActivities = (lesson) => {
      if (!lesson?.content?.practice?.activityB) {
        return lesson.activities;
      }
      const activities = [...lesson.activities];
      const practiceIndex = activities.indexOf('practice');
      if (practiceIndex !== -1) {
        activities.splice(practiceIndex, 1, 'matching', 'fillwords');
      }
      return activities;
    };
    const expandedActivities = getExpandedActivities(lesson);
    const firstActivity = expandedActivities[0];
    
    setIsRedirecting(true);
    
    // ✅ Use window.location.href for hard reload to ensure clean state
    setTimeout(() => {
      window.location.href = `/lesson/${lessonId}/${firstActivity}`;
    }, 100);
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { level: 'Excellent!', emoji: '🌟', color: 'text-yellow-500', bgColor: 'bg-yellow-50' };
    if (score >= 70) return { level: 'Great Job!', emoji: '🎉', color: 'text-green-500', bgColor: 'bg-green-50' };
    if (score >= 50) return { level: 'Good Work!', emoji: '👍', color: 'text-blue-500', bgColor: 'bg-blue-50' };
    return { level: 'Keep Practicing!', emoji: '💪', color: 'text-orange-500', bgColor: 'bg-orange-50' };
  };

  // Show error if there's an issue
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">Lesson ID: {lessonId}</p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
          >
            🏠 Go Home
          </button>
        </div>
      </div>
    );
  }

  // Show previous score summary if user has completed before
  if (showPreviousScore && previousScore && !loading) {
    const lesson = getLessonById(lessonId);
    const performance = getPerformanceLevel(previousScore.totalScore);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{performance.emoji}</div>
            
            {/* Stars Display */}
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3].map((star) => (
                <span
                  key={star}
                  className={`text-4xl ${star <= previousScore.stars ? '' : 'opacity-30'}`}
                >
                  ⭐
                </span>
              ))}
            </div>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
            <p className="text-xl text-gray-600">{lesson?.title || `Lesson ${lessonId}`}</p>
            <p className="text-sm text-gray-500 mt-2">
              You previously earned {previousScore.stars} star{previousScore.stars !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Previous Score Display */}
          <div className={`${performance.bgColor} rounded-xl p-6 mb-6 border-2 border-gray-200`}>
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-2">Your Previous Best Score</p>
              <div className="flex items-center justify-center space-x-4">
                <span className={`text-6xl font-bold ${performance.color}`}>{previousScore.totalScore}</span>
                <span className="text-3xl text-gray-400">/</span>
                <span className="text-4xl font-bold text-gray-600">100</span>
              </div>
              <p className={`text-2xl font-semibold mt-3 ${performance.color}`}>{performance.level}</p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">📊 Previous Score Breakdown</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-purple-100 rounded-lg p-3 mb-2">
                  <span className="text-3xl">🔗</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Matching</p>
                <p className="text-2xl font-bold text-purple-600">{previousScore.matchingScore}</p>
                <p className="text-xs text-gray-500">out of 20</p>
              </div>

              <div className="text-center">
                <div className="bg-orange-100 rounded-lg p-3 mb-2">
                  <span className="text-3xl">✏️</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Fill Words</p>
                <p className="text-2xl font-bold text-orange-600">{previousScore.fillwordsScore}</p>
                <p className="text-xs text-gray-500">out of 40</p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 rounded-lg p-3 mb-2">
                  <span className="text-3xl">🎯</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Quiz</p>
                <p className="text-2xl font-bold text-green-600">{previousScore.quizScore}</p>
                <p className="text-xs text-gray-500">out of 40</p>
              </div>
            </div>
          </div>

          {/* Encouragement Message */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
            <p className="text-center text-gray-700">
              {previousScore.totalScore >= 90 && "You mastered this lesson! Want to try again for fun? 🎓"}
              {previousScore.totalScore >= 70 && previousScore.totalScore < 90 && "Great job! Want to improve your score? 📚"}
              {previousScore.totalScore >= 50 && previousScore.totalScore < 70 && "Good work! Ready to aim for more stars? 💪"}
              {previousScore.totalScore < 50 && "Let's practice again and improve your score! 🌱"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handleStartLesson}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>▶️</span>
              <span>Start Fresh</span>
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>🏠</span>
              <span>Go Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Lesson...</h2>
        <p className="text-gray-600 mb-4">Getting everything ready for you!</p>
        <p className="text-sm text-gray-500">Lesson ID: {lessonId}</p>
        
        <div className="mt-6 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
}