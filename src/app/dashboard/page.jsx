"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

// All lessons and quizzes structure
const allLessonsAndQuizzes = [
  { id: 1, type: 'lesson', title: 'Lesson 1: Jungle Animals – Short a Words' },
  { id: 2, type: 'lesson', title: 'Lesson 2: Farm Friends – Short e Words' },
  { id: 3, type: 'lesson', title: 'Lesson 3: Zoo Day – Short i Words' },
  { id: 4, type: 'lesson', title: 'Lesson 4: Animal Fun Review – Short a/e/i Review' },
  { id: 'quiz1', type: 'exam', title: 'Exam 1: Unit 1 Checkpoint Quiz' },
  { id: 5, type: 'lesson', title: 'Lesson 5: Forest Fun – Short o Words' },
  { id: 6, type: 'lesson', title: 'Lesson 6: Muddy Fun – Short u Words' },
  { id: 7, type: 'lesson', title: 'Lesson 7: Rainy Day Play – Consonant Blends' },
  { id: 8, type: 'lesson', title: 'Lesson 8: Unit 2 Review – Blends and Digraphs' },
  { id: 'quiz2', type: 'exam', title: 'Exam 2: Unit 2 Checkpoint Quiz' },
  { id: 9, type: 'lesson', title: 'Lesson 9: Windy Walk – Spiral Review' },
  { id: 10, type: 'lesson', title: 'Lesson 10: Sunny Streets – Long a Words (a_e)' },
  { id: 11, type: 'lesson', title: 'Lesson 11: Home Helpers – Long i Words (i_e)' },
  { id: 12, type: 'lesson', title: 'Lesson 12: Final Review – Our World Summary' },
  { id: 'quiz3', type: 'exam', title: 'Exam 3: Unit 3 Final Quiz' },
];

// Circular Progress Component
const CircularProgress = ({ value, max, label, sublabel, color }) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="relative w-56 h-56">
        <svg className="transform -rotate-90 w-56 h-56">
          <circle
            cx="112"
            cy="112"
            r="80"
            stroke="#F3F4F6"
            strokeWidth="20"
            fill="none"
          />
          <circle
            cx="112"
            cy="112"
            r="80"
            stroke={color}
            strokeWidth="20"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(252, 211, 77, 0.3))' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-blue-600 font-semibold text-lg mb-1">{label}</div>
          <div className="text-gray-900 font-bold text-4xl">{value} <span className="text-gray-500 text-2xl">of</span> {max}</div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [userProgress, setUserProgress] = useState([]);
  const [bestQuizScores, setBestQuizScores] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/sign-in');
          return;
        }

        // Fetch lesson progress and quiz completion in parallel
        const [lessonRes, quizRes] = await Promise.all([
          supabase.from('user_lesson').select('*').eq('user_id', user.id),
          supabase
            .from('personalized_quiz')
            .select('quiz_type, score')
            .eq('user_id', user.id)
            .eq('is_completed', true)
            .in('quiz_type', ['quiz1', 'quiz2', 'quiz3'])
        ]);

        setUserProgress(lessonRes.data || []);

        const best = {};
        (quizRes.data || []).forEach(q => {
          if (!best[q.quiz_type] || q.score > best[q.quiz_type]) {
            best[q.quiz_type] = q.score;
          }
        });
        setBestQuizScores(best);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Get remark based on score
  const getRemark = (score) => {
    if (score >= 90) return { text: 'Excellent!', color: 'text-green-600' };
    if (score >= 80) return { text: 'Great!', color: 'text-blue-600' };
    if (score >= 70) return { text: 'Good', color: 'text-yellow-600' };
    if (score >= 50) return { text: 'Fair', color: 'text-orange-600' };
    return { text: 'Need Practice', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const completedLessons = userProgress.filter(p => p.is_completed && typeof p.lesson_id === 'number').length;
  const totalLessons = 12;
  const completedExams = Object.keys(bestQuizScores).length;
  const totalExams = 3;

  return (
    <div className="min-h-screen bg-sky-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            ← Back
          </button>
        </div>

        {/* Dashboard Title */}
        <h1 className="text-6xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-16">
          Dashboard
        </h1>

        {/* Circular Progress Stats */}
        <div className="flex justify-center gap-12 mb-20">
          <CircularProgress
            value={completedExams}
            max={totalExams}
            label="Exams"
            sublabel="Completed"
            color="#FCD34D"
          />
          <CircularProgress
            value={completedLessons}
            max={totalLessons}
            label="Lessons"
            sublabel="Completed"
            color="#FCD34D"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <th className="px-8 py-5 text-left font-bold text-lg">Type</th>
                  <th className="px-8 py-5 text-left font-bold text-lg">Title</th>
                  <th className="px-8 py-5 text-center font-bold text-lg">Best Score</th>
                  <th className="px-8 py-5 text-center font-bold text-lg">Remark</th>
                  <th className="px-8 py-5 text-center font-bold text-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {allLessonsAndQuizzes.map((item) => {
                  const progress = userProgress.find(p => p.lesson_id === item.id);
                  const quizScore = item.type === 'exam' ? bestQuizScores[item.id] : undefined;
                  const isCompleted = quizScore !== undefined || progress?.is_completed || false;
                  const bestScore = quizScore !== undefined ? quizScore : (progress?.best_score || 0);
                  const remark = getRemark(bestScore);

                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-100 transition-all ${
                        isCompleted 
                          ? 'bg-white hover:bg-blue-50' 
                          : 'bg-gray-50 opacity-60'
                      }`}
                    >
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${
                          item.type === 'exam' 
                            ? 'bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700' 
                            : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700'
                        } ${!isCompleted && 'opacity-50'}`}>
                          {item.type === 'exam' ? '📝 Exam' : '📚 Lesson'}
                        </span>
                      </td>
                      <td className={`px-8 py-5 font-semibold text-base ${
                        isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {item.title}
                      </td>
                      <td className="px-8 py-5 text-center">
                        {isCompleted ? (
                          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {bestScore} / 100
                          </span>
                        ) : (
                          <span className="text-gray-400 text-2xl">—</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-center">
                        {isCompleted ? (
                          <span className={`font-bold text-lg ${remark.color}`}>
                            {remark.text}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-center">
                        {isCompleted ? (
                          <span className="inline-flex items-center px-5 py-2 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 font-bold shadow-sm">
                            ✓ Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-5 py-2 rounded-xl bg-gray-200 text-gray-500 font-bold">
                            🔒 Incomplete
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}