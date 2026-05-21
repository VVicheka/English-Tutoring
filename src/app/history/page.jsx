"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { getLessonById } from '../data/lessons';
import { getPerformanceInfo, formatDate } from '../lib/lessonUtils';

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState('all');
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/sign-in');
          return;
        }
        
        setUser(user);
        await fetchAttempts(user.id);
        await fetchLessons();
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title')
        .order('id');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchAttempts = async (userId, lessonId = null) => {
    try {
      let query = supabase
        .from('lesson_attempts')
        .select('*')
        .eq('user_id', userId);

      if (lessonId && lessonId !== 'all') {
        query = query.eq('lesson_id', parseInt(lessonId));
      }

      const { data, error } = await query.order('completed_at', { ascending: false });

      if (error) throw error;
      setAttempts(data || []);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  };

  const handleLessonFilter = async (lessonId) => {
    setSelectedLesson(lessonId);
    if (user) {
      await fetchAttempts(user.id, lessonId);
    }
  };


  // Group attempts by lesson
  const attemptsByLesson = attempts.reduce((acc, attempt) => {
    const lessonId = attempt.lesson_id;
    if (!acc[lessonId]) {
      acc[lessonId] = [];
    }
    acc[lessonId].push(attempt);
    return acc;
  }, {});

  // Calculate stats
  const totalAttempts = attempts.length;
  const averageScore = attempts.length > 0 
    ? Math.round(attempts.reduce((sum, a) => sum + a.total_score, 0) / attempts.length)
    : 0;
  const bestScore = attempts.length > 0
    ? Math.max(...attempts.map(a => a.total_score))
    : 0;
  const totalStars = attempts.reduce((sum, a) => sum + (a.stars || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all flex items-center space-x-2"
              >
                <span>←</span>
                <span>Home</span>
              </button>
              <h1 className="text-3xl font-bold text-gray-800">📚 Lesson History</h1>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Total Attempts</p>
              <p className="text-3xl font-bold text-blue-600">{totalAttempts}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Average Score</p>
              <p className="text-3xl font-bold text-green-600">{averageScore}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Best Score</p>
              <p className="text-3xl font-bold text-yellow-600">{bestScore}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Total Stars</p>
              <p className="text-3xl font-bold text-purple-600">{totalStars} ⭐</p>
            </div>
          </div>

          {/* Filter */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Lesson:</label>
            <select
              value={selectedLesson}
              onChange={(e) => handleLessonFilter(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Lessons</option>
              {lessons.map(lesson => (
                <option key={lesson.id} value={lesson.id}>
                  Lesson {lesson.id}: {lesson.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Attempts List */}
        {attempts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Attempts Yet</h2>
            <p className="text-gray-600 mb-6">
              {selectedLesson === 'all' 
                ? "Start completing lessons to see your progress here!"
                : "You haven't attempted this lesson yet."}
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all"
            >
              Start Learning
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(attemptsByLesson)
              .sort((a, b) => b - a)
              .map(lessonId => {
                const lessonAttempts = attemptsByLesson[lessonId];
                const lesson = lessons.find(l => l.id === parseInt(lessonId));
                const bestAttempt = lessonAttempts.reduce((best, curr) => 
                  curr.total_score > best.total_score ? curr : best
                );

                return (
                  <div key={lessonId} className="bg-white rounded-2xl shadow-xl p-6">
                    {/* Lesson Header */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          Lesson {lessonId}
                        </h2>
                        <p className="text-gray-600">{lesson?.title || 'Unknown Lesson'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Best Score</p>
                        <p className="text-3xl font-bold text-purple-600">{bestAttempt.total_score}</p>
                        <p className="text-sm text-gray-500">{lessonAttempts.length} attempt{lessonAttempts.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {/* Attempts Timeline */}
                    <div className="space-y-3">
                      {lessonAttempts.map((attempt) => (
                        <div
                          key={attempt.id}
                          className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between">
                            {/* Attempt Info */}
                            <div className="flex items-center space-x-4">
                              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center">
                                <span className="text-xl font-bold text-purple-600">
                                  #{attempt.attempt_number}
                                </span>
                              </div>
                              
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPerformanceInfo(attempt.total_score).badgeClass}`}>
                                    {attempt.total_score}/100
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {getPerformanceInfo(attempt.total_score).label}
                                  </span>
                                  <div className="flex space-x-1">
                                    {[...Array(attempt.stars || 0)].map((_, i) => (
                                      <span key={i} className="text-yellow-500">⭐</span>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Score Breakdown */}
                                <div className="flex space-x-4 text-xs text-gray-600">
                                  <span>🔗 {attempt.matching_score}/20</span>
                                  <span>✏️ {attempt.fillwords_score}/40</span>
                                  <span>🎯 {attempt.quiz_score}/40</span>
                                </div>
                              </div>
                            </div>

                            {/* Time */}
                            <div className="text-right text-sm text-gray-500">
                              {formatDate(attempt.completed_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}