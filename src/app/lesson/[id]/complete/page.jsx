"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLessonById } from '../../../data/lessons';
import { supabase } from '../../../lib/supabase';

export default function LessonCompletePage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id;
  
  const [lesson, setLesson] = useState(null);
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Calculate stars based on score (0-3 stars max)
  const calculateStars = (totalScore) => {
    if (totalScore >= 90) return 3;
    if (totalScore >= 70) return 2;
    if (totalScore >= 50) return 1;
    return 0;
  };

  // Save score to Supabase database
  const saveScoreToDatabase = async (lessonId, scoreData) => {
    setSaving(true);
    console.log('💾 Saving score to database...', scoreData);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ Error getting user:', userError);
        setSaving(false);
        return;
      }
      
      if (!user) {
        console.error('❌ No user found, cannot save score');
        setSaving(false);
        return;
      }

      console.log('✅ User found:', user.id);

      const totalScore = scoreData.totalScore;
      const stars = calculateStars(totalScore);

      console.log('📊 Score data:', {
        lessonId: parseInt(lessonId),
        totalScore,
        stars: `${stars}/3`,
        userId: user.id
      });

      // Check if user_lesson record exists
      const { data: existingProgress, error: fetchError } = await supabase
        .from('user_lesson')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', parseInt(lessonId))
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Error fetching existing progress:', fetchError);
        throw fetchError;
      }

      console.log('📝 Existing progress:', existingProgress);

      // If record exists, only update if new score is better
      if (existingProgress) {
        console.log('🔄 Record exists, checking if score is better...');
        console.log('   Old score:', existingProgress.best_score, 'New score:', totalScore);
        
        if (totalScore > (existingProgress.best_score || 0)) {
          console.log('✨ New score is better! Updating...');
          
          const { data: updateData, error: updateError } = await supabase
            .from('user_lesson')
            .update({
              best_score: totalScore,
              best_stars: stars,
              is_completed: true,
              percentage_completed: 100,
              last_accessed: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('lesson_id', parseInt(lessonId))
            .select();

          if (updateError) {
            console.error('❌ Update error:', updateError);
            throw updateError;
          }
          
          console.log('✅ Updated better score:', totalScore, `Stars: ${stars}/3`);
          console.log('✅ Update result:', updateData);
        } else {
          console.log('ℹ️ Existing score is better or equal, not updating');
          console.log('   Keeping old score:', existingProgress.best_score, `Stars: ${existingProgress.best_stars}/3`);
        }
      } else {
        // Create new record
        console.log('➕ No existing record, creating new one...');
        
        const { data: insertData, error: insertError } = await supabase
          .from('user_lesson')
          .insert({
            user_id: user.id,
            lesson_id: parseInt(lessonId),
            best_score: totalScore,
            best_stars: stars,
            is_completed: true,
            percentage_completed: 100,
            last_accessed: new Date().toISOString()
          })
          .select();

        if (insertError) {
          console.error('❌ Insert error:', insertError);
          console.error('❌ Insert error details:', {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code
          });
          throw insertError;
        }
        
        console.log('✅ Saved new score:', totalScore, `Stars: ${stars}/3`);
        console.log('✅ Insert result:', insertData);
      }

      console.log('🎉 Score save completed successfully!');

    } catch (error) {
      console.error('❌ Error saving to database:', error);
      if (error && typeof error === 'object') {
        console.error('❌ Error details:', {
          message: error.message || 'Unknown error',
          name: error.name || 'Error',
          code: error.code || 'No code',
          details: error.details || 'No details',
          hint: error.hint || 'No hint'
        });
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Complete page mounted, loading data...');
    
    // Load lesson data
    const lessonData = getLessonById(lessonId);
    setLesson(lessonData);
    console.log('📚 Lesson data loaded:', lessonData?.title);

    // Load scores from localStorage ONLY
    let loadedScores = null;
    
    try {
      const stored = localStorage.getItem(`lesson_${lessonId}_scores`);
      if (stored) {
        loadedScores = JSON.parse(stored);
        console.log('✅ Scores loaded from localStorage:', {
          totalScore: loadedScores.totalScore,
          matching: loadedScores.scores?.matching,
          fillwords: loadedScores.scores?.fillwords,
          quiz: loadedScores.scores?.quiz,
          timestamp: loadedScores.timestamp,
          age: loadedScores.timestamp ? `${Math.round((Date.now() - loadedScores.timestamp) / 1000)}s ago` : 'unknown'
        });
      } else {
        console.warn('⚠️ No scores found in localStorage for lesson:', lessonId);
      }
    } catch (e) {
      console.error('❌ Error loading from localStorage:', e);
    }

    setScores(loadedScores);
    
    // Save to database after loading scores
    if (loadedScores) {
      saveScoreToDatabase(lessonId, loadedScores);
    }
    
    setLoading(false);
  }, [lessonId]);

  const handleGoHome = () => {
    console.log('🏠 Going home, clearing lesson scores...');
    
    // Clear scores from localStorage
    try {
      localStorage.removeItem(`lesson_${lessonId}_scores`);
      console.log('✅ Cleared localStorage scores');
    } catch (e) {
      console.error('❌ Error clearing localStorage:', e);
    }
    
    router.push('/');
  };

  const handleRetry = () => {
    console.log('🔄 Retry button clicked - clearing ALL data for fresh start');
    
    try {
      // Clear lesson scores
      localStorage.removeItem(`lesson_${lessonId}_scores`);
      
      // Clear all activity progress
      localStorage.removeItem(`lesson_${lessonId}_matching`);
      localStorage.removeItem(`lesson_${lessonId}_fillwords`);
      localStorage.removeItem(`lesson_${lessonId}_quiz`);
      localStorage.removeItem(`lesson_${lessonId}_story`);
      
      // Clear any other lesson-related keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(`lesson_${lessonId}`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log('✅ Cleared localStorage keys:', keysToRemove);
    } catch (e) {
      console.error('❌ Error clearing localStorage:', e);
    }
    
    // Navigate to lesson start with hard reload
    setTimeout(() => {
      console.log('🚀 Navigating to lesson start with hard reload');
      window.location.href = `/lesson/${lessonId}`;
    }, 100);
  };

  const handleNextLesson = () => {
    console.log('➡️ Going to next lesson, clearing current lesson scores...');
    
    // Clear current lesson scores from localStorage
    try {
      localStorage.removeItem(`lesson_${lessonId}_scores`);
      console.log('✅ Cleared current lesson scores');
    } catch (e) {
      console.error('❌ Error clearing localStorage:', e);
    }
    
    const nextLessonId = parseInt(lessonId) + 1;
    router.push(`/lesson/${nextLessonId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  const totalScore = scores?.totalScore || 0;
  const matchingScore = scores?.scores?.matching || 0;
  const fillwordsScore = scores?.scores?.fillwords || 0;
  const quizScore = scores?.scores?.quiz || 0;
  const stars = calculateStars(totalScore);

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { level: 'Excellent!', emoji: '🌟', color: 'text-yellow-500', bgColor: 'bg-yellow-50' };
    if (score >= 70) return { level: 'Great Job!', emoji: '🎉', color: 'text-green-500', bgColor: 'bg-green-50' };
    if (score >= 50) return { level: 'Good Work!', emoji: '👍', color: 'text-blue-500', bgColor: 'bg-blue-50' };
    return { level: 'Keep Practicing!', emoji: '💪', color: 'text-orange-500', bgColor: 'bg-orange-50' };
  };

  const performance = getPerformanceLevel(totalScore);

  if (!scores || totalScore === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-100 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Scores Found</h2>
          <p className="text-gray-600 mb-4">
            It looks like you haven't completed any activities yet, or the scores weren't saved properly.
          </p>
          
          {/* Debug info for troubleshooting */}
          <details className="mb-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              🔍 Debug Info (click to expand)
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
              <p>Lesson ID: {lessonId}</p>
              <p>LocalStorage key: lesson_{lessonId}_scores</p>
              <p>LocalStorage data: {localStorage.getItem(`lesson_${lessonId}_scores`) ? 'Found' : 'Not found'}</p>
              {localStorage.getItem(`lesson_${lessonId}_scores`) && (
                <pre className="mt-2 text-xs overflow-auto">
                  {localStorage.getItem(`lesson_${lessonId}_scores`)}
                </pre>
              )}
            </div>
          </details>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/lesson/${lessonId}`)}
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all"
            >
              Start Lesson
            </button>
            <button
              onClick={handleGoHome}
              className="w-full px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-all"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        {/* Saving Indicator */}
        {saving && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm text-blue-700">Saving your progress...</span>
          </div>
        )}

        {/* Header with Stars */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">{performance.emoji}</div>
          
          {/* Stars Display */}
          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3].map((star) => (
              <span
                key={star}
                className={`text-4xl ${star <= stars ? 'animate-bounce' : 'opacity-30'}`}
                style={{ animationDelay: `${star * 0.1}s` }}
              >
                ⭐
              </span>
            ))}
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Lesson Complete!</h1>
          <p className="text-xl text-gray-600">{lesson?.title || `Lesson ${lessonId}`}</p>
          <p className="text-sm text-gray-500 mt-2">
            You earned {stars} star{stars !== 1 ? 's' : ''}! 
            {stars < 3 && ' Try again to earn more stars!'}
          </p>
        </div>

        {/* Total Score Display */}
        <div className={`${performance.bgColor} rounded-xl p-6 mb-6 border-2 border-gray-200`}>
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-2">Your Total Score</p>
            <div className="flex items-center justify-center space-x-4">
              <span className={`text-6xl font-bold ${performance.color}`}>{totalScore}</span>
              <span className="text-3xl text-gray-400">/</span>
              <span className="text-4xl font-bold text-gray-600">100</span>
            </div>
            <p className={`text-2xl font-semibold mt-3 ${performance.color}`}>{performance.level}</p>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">Activity Scores</h3>
          <div className="space-y-4">
            {/* Matching Activity */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                    🔗
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Matching Activity</p>
                    <p className="text-sm text-gray-500">Connect words with images</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-purple-600">{matchingScore}</p>
                  <p className="text-sm text-gray-500">out of 20</p>
                </div>
              </div>
              <div className="mt-3 w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(matchingScore / 20) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Fill Words Activity */}
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl">
                    ✏️
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Fill Words Activity</p>
                    <p className="text-sm text-gray-500">Connect letters to form words</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-orange-600">{fillwordsScore}</p>
                  <p className="text-sm text-gray-500">out of 40</p>
                </div>
              </div>
              <div className="mt-3 w-full bg-orange-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(fillwordsScore / 40) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Quiz Activity */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                    🎯
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Quiz Activity</p>
                    <p className="text-sm text-gray-500">Match characters to actions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">{quizScore}</p>
                  <p className="text-sm text-gray-500">out of 40</p>
                </div>
              </div>
              <div className="mt-3 w-full bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(quizScore / 40) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Message */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <p className="text-center text-gray-700">
            {totalScore >= 90 && "Outstanding work! You've mastered this lesson! 🎓"}
            {totalScore >= 70 && totalScore < 90 && "Excellent progress! You're doing great! 📚"}
            {totalScore >= 50 && totalScore < 70 && "Good effort! Keep practicing to improve! 💪"}
            {totalScore < 50 && "Don't give up! Practice makes perfect! 🌱"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={handleRetry}
            className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>🔄</span>
            <span>Try Again</span>
          </button>
          
          <button
            onClick={handleNextLesson}
            className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>➡️</span>
            <span>Next Lesson</span>
          </button>
          
          <button
            onClick={handleGoHome}
            className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>🏠</span>
            <span>Go Home</span>
          </button>
        </div>

        {/* Debug Info (collapsible) */}
        <details className="mt-6">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
            Debug Info
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
            <p>Lesson ID: {lessonId}</p>
            <p>Total Score: {totalScore}</p>
            <p>Timestamp: {scores?.timestamp ? new Date(scores.timestamp).toLocaleString() : 'N/A'}</p>
            <p>Data Age: {scores?.timestamp ? `${Math.round((Date.now() - scores.timestamp) / 1000)}s ago` : 'N/A'}</p>
          </div>
        </details>
      </div>
    </div>
  );
}