"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLessonById } from '../../../data/lessons';
import { supabase } from '../../../lib/supabase';
import { isLessonUnlocked } from '../../../lib/lessonUtils';

export default function LessonCompletePage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id;
  
  const [lesson, setLesson] = useState(null);
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProgress, setUserProgress] = useState([]);
  const [canUnlockNext, setCanUnlockNext] = useState(false);
  
  // ✅ Use ref to prevent double save
  const hasSavedRef = useRef(false);

  // Calculate stars based on score (0-3 stars max)
  const calculateStars = (totalScore) => {
    if (totalScore >= 90) return 3;
    if (totalScore >= 70) return 2;
    if (totalScore >= 50) return 1;
    return 0;
  };

  // Fetch user progress to check unlock status
  const fetchUserProgress = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_lesson')
        .select('*')
        .eq('user_id', userId)
        .order('lesson_id', { ascending: true });

      if (error) {
        console.error('Error fetching user progress:', error);
        return;
      }

      setUserProgress(data || []);

      // Check if next lesson can be unlocked
      const nextLessonId = parseInt(lessonId) + 1;
      if (nextLessonId <= 12) {
        const nextLessonUnlocked = isLessonUnlocked(nextLessonId, data || []);
        setCanUnlockNext(nextLessonUnlocked);
        console.log(`🔓 Next lesson (${nextLessonId}) unlocked:`, nextLessonUnlocked);
      }
    } catch (err) {
      console.error('Error in fetchUserProgress:', err);
    }
  };

  // Save score to Supabase database with breakdown
  const saveScoreToDatabase = async (lessonId, scoreData) => {
    // ✅ Check if already saved
    if (hasSavedRef.current) {
      console.log('⏭️ Already saved, skipping duplicate save');
      return;
    }

    hasSavedRef.current = true;

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
      const matchingScore = scoreData.scores?.matching || 0;
      const fillwordsScore = scoreData.scores?.fillwords || 0;
      const quizScore = scoreData.scores?.quiz || 0;
      const stars = calculateStars(totalScore);

      console.log('📊 Score data:', {
        lessonId: parseInt(lessonId),
        totalScore,
        matchingScore,
        fillwordsScore,
        quizScore,
        stars: `${stars}/3`,
        userId: user.id
      });

      // 🆕 STEP 1: SAVE TO lesson_attempts (ALL attempts history)
      try {
        const { data: attemptData, error: attemptError } = await supabase
          .from('lesson_attempts')
          .insert({
            user_id: user.id,
            lesson_id: parseInt(lessonId),
            matching_score: matchingScore,
            fillwords_score: fillwordsScore,
            quiz_score: quizScore,
            total_score: totalScore,
            stars: stars,
            completed_at: new Date().toISOString()
            // attempt_number is auto-calculated by trigger
          })
          .select();

        if (attemptError) {
          console.error('❌ Error saving attempt history:', attemptError);
        } else {
          console.log('✅ Attempt #' + attemptData[0]?.attempt_number + ' saved to history');
          // ✅ Mark as saved after successful insert
          // hasSavedRef.current = true;
        }
      } catch (err) {
        console.error('❌ Error saving to lesson_attempts:', err);
      }

      // STEP 2: UPDATE user_lesson (BEST score only)
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

      const dataToSave = {
        user_id: user.id,
        lesson_id: parseInt(lessonId),
        best_score: totalScore,
        matching_score: matchingScore,
        fillwords_score: fillwordsScore,
        quiz_score: quizScore,
        best_stars: stars,
        is_completed: true,
        percentage_completed: 100,
        last_accessed: new Date().toISOString()
      };

      // If record exists, update or keep existing if it's better
      if (existingProgress) {
        console.log('🔄 Record exists, checking if score is better...');
        console.log('   Old score:', existingProgress.best_score, 'New score:', totalScore);
        
        if (totalScore > (existingProgress.best_score || 0)) {
          console.log('✨ New score is better! Updating...');
          
          const { data: updateData, error: updateError } = await supabase
            .from('user_lesson')
            .update({
              best_score: totalScore,
              matching_score: matchingScore,
              fillwords_score: fillwordsScore,
              quiz_score: quizScore,
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
          console.log('✅ Score breakdown saved:', { matchingScore, fillwordsScore, quizScore });
          console.log('✅ Update result:', updateData);
        } else {
          console.log('ℹ️ Existing score is better or equal, not updating');
          console.log('   Keeping old score:', existingProgress.best_score, `Stars: ${existingProgress.best_stars}/3`);
        }
      } else {
        // No existing record, use UPSERT to handle race conditions
        console.log('➕ No existing record, creating new one with UPSERT...');
        
        const { data: upsertData, error: upsertError } = await supabase
          .from('user_lesson')
          .upsert(dataToSave, {
            onConflict: 'user_id,lesson_id',
            ignoreDuplicates: false
          })
          .select();

        if (upsertError) {
          console.error('❌ Upsert error:', upsertError);
          throw upsertError;
        }
        
        console.log('✅ Saved new score:', totalScore, `Stars: ${stars}/3`);
        console.log('✅ Score breakdown saved:', { matchingScore, fillwordsScore, quizScore });
        console.log('✅ Upsert result:', upsertData);
      }

      // After saving, fetch updated progress to check if next lesson is unlocked
      await fetchUserProgress(user.id);

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
    
    const initializePage = async () => {
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
      
      // Get user and fetch progress
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fetchUserProgress(user.id);
        }
      } catch (err) {
        console.error('Error getting user:', err);
      }
      
      // Save to database after loading scores
      if (loadedScores) {
        await saveScoreToDatabase(lessonId, loadedScores);
      }
      
      setLoading(false);
    };

    initializePage();
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
    
    const totalScore = scores?.totalScore || 0;
    const nextLessonId = parseInt(lessonId) + 1;

    // Check if score is sufficient (>= 50)
    if (totalScore < 50) {
      alert('You need a score of at least 50 to unlock the next lesson. Try again to improve your score! 💪');
      return;
    }

    // Check if next lesson exists
    if (nextLessonId > 12) {
      alert('Congratulations! You\'ve completed all lessons! 🎉');
      handleGoHome();
      return;
    }

    // Check if next lesson is actually unlocked (should be after save)
    if (!canUnlockNext) {
      alert('The next lesson is not yet unlocked. Please ensure you scored at least 50 points! 🔒');
      return;
    }
    
    // Clear current lesson scores from localStorage
    try {
      localStorage.removeItem(`lesson_${lessonId}_scores`);
      console.log('✅ Cleared current lesson scores');
    } catch (e) {
      console.error('❌ Error clearing localStorage:', e);
    }
    
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

  // Check if this is the last lesson
  const isLastLesson = parseInt(lessonId) >= 12;
  const nextLessonId = parseInt(lessonId) + 1;

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

        {/* Quick Score Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">📊 Score Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* Matching Score */}
            <div className="text-center">
              <div className="bg-purple-100 rounded-lg p-3 mb-2">
                <span className="text-3xl">🔗</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Matching</p>
              <p className="text-2xl font-bold text-purple-600">{matchingScore}</p>
              <p className="text-xs text-gray-500">out of 20</p>
            </div>

            {/* Fill Words Score */}
            <div className="text-center">
              <div className="bg-orange-100 rounded-lg p-3 mb-2">
                <span className="text-3xl">✏️</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Fill Words</p>
              <p className="text-2xl font-bold text-orange-600">{fillwordsScore}</p>
              <p className="text-xs text-gray-500">out of 40</p>
            </div>

            {/* Quiz Score */}
            <div className="text-center">
              <div className="bg-green-100 rounded-lg p-3 mb-2">
                <span className="text-3xl">🎯</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Quiz</p>
              <p className="text-2xl font-bold text-green-600">{quizScore}</p>
              <p className="text-xs text-gray-500">out of 40</p>
            </div>
          </div>
        </div>

        {/* Score Requirement Notice */}
        {totalScore < 50 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-2xl">🔒</span>
              <h3 className="text-lg font-bold text-red-700">Score Too Low</h3>
            </div>
            <p className="text-center text-red-600 text-sm">
              You need a score of at least <strong>50 points</strong> to unlock the next lesson.
              Try again to improve your score!
            </p>
          </div>
        )}

        {/* Next Lesson Unlocked Notice */}
        {totalScore >= 50 && !isLastLesson && (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-2xl">🎉</span>
              <h3 className="text-lg font-bold text-green-700">Next Lesson Unlocked!</h3>
            </div>
            <p className="text-center text-green-600 text-sm">
              Great job! You can now move on to <strong>Lesson {nextLessonId}</strong>!
            </p>
          </div>
        )}

        {/* Completion Notice for Last Lesson */}
        {isLastLesson && totalScore >= 50 && (
          <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-2xl">🏆</span>
              <h3 className="text-lg font-bold text-purple-700">Congratulations!</h3>
            </div>
            <p className="text-center text-purple-600 text-sm">
              You've completed all lessons! Amazing work! 🎓
            </p>
          </div>
        )}

        {/* Performance Message */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <p className="text-center text-gray-700">
            {totalScore >= 90 && "Outstanding work! You've mastered this lesson! 🎓"}
            {totalScore >= 70 && totalScore < 90 && "Excellent progress! You're doing great! 📚"}
            {totalScore >= 50 && totalScore < 70 && "Good effort! Keep practicing to improve! 💪"}
            {totalScore < 50 && "Don't give up! Practice makes perfect! Try again to score higher! 🌱"}
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
          
          {!isLastLesson && (
            <button
              onClick={handleNextLesson}
              disabled={totalScore < 50}
              className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg ${
                totalScore >= 50
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>{totalScore >= 50 ? '➡️' : '🔒'}</span>
              <span>Next Lesson</span>
            </button>
          )}
          
          <button
            onClick={handleGoHome}
            className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
          >
            <span>🏠</span>
            <span>Go Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}