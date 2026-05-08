"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '../lib/supabase';

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [rows, setRows] = useState([]);
  const [currentUserRow, setCurrentUserRow] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/sign-in');
          return;
        }
        setCurrentUserId(user.id);

        const [usersRes, lessonRes, quizRes] = await Promise.all([
          supabase.from('users').select('id, name, avatar_url'),
          supabase.from('user_lesson').select('user_id, lesson_id, best_score, best_stars, is_completed'),
          supabase.from('personalized_quiz').select('user_id, quiz_type, score')
        ]);

        if (usersRes.error) throw usersRes.error;
        if (lessonRes.error) throw lessonRes.error;
        if (quizRes.error) throw quizRes.error;

        const users = usersRes.data || [];
        const lessons = lessonRes.data || [];
        const quizzes = quizRes.data || [];

        const bestQuizByType = new Map();
        quizzes.forEach(q => {
          const key = `${q.user_id}|${q.quiz_type}`;
          const prev = bestQuizByType.get(key) || 0;
          if ((q.score || 0) > prev) bestQuizByType.set(key, q.score || 0);
        });

        const perUserQuizTotal = new Map();
        bestQuizByType.forEach((score, key) => {
          const uid = key.split('|')[0];
          perUserQuizTotal.set(uid, (perUserQuizTotal.get(uid) || 0) + score);
        });

        const lessonStatsByUser = new Map();
        lessons.forEach(l => {
          const entry = lessonStatsByUser.get(l.user_id) || {
            lessonTotal: 0,
            lessonsCompleted: 0,
            stars: 0
          };
          entry.lessonTotal += l.best_score || 0;
          if (l.is_completed) entry.lessonsCompleted += 1;
          entry.stars += l.best_stars || 0;
          lessonStatsByUser.set(l.user_id, entry);
        });

        const aggregated = users.map(u => {
          const stats = lessonStatsByUser.get(u.id) || { lessonTotal: 0, lessonsCompleted: 0, stars: 0 };
          const quizTotal = perUserQuizTotal.get(u.id) || 0;
          return {
            userId: u.id,
            name: u.name || 'Anonymous Learner',
            avatarUrl: u.avatar_url,
            totalScore: stats.lessonTotal + quizTotal,
            lessonTotal: stats.lessonTotal,
            quizTotal,
            lessonsCompleted: stats.lessonsCompleted,
            stars: stats.stars
          };
        });

        aggregated.sort((a, b) => {
          if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
          if (b.lessonsCompleted !== a.lessonsCompleted) return b.lessonsCompleted - a.lessonsCompleted;
          return b.stars - a.stars;
        });

        const ranked = aggregated.map((row, idx) => ({ ...row, rank: idx + 1 }));
        const top20 = ranked.slice(0, 20);
        const me = ranked.find(r => r.userId === user.id) || null;

        setRows(top20);
        setCurrentUserRow(me);
      } catch (err) {
        console.error('Leaderboard error:', err);
        setError(err.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard…</p>
        </div>
      </div>
    );
  }

  const renderRow = (row, highlight) => {
    const isTop3 = row.rank <= 3;
    return (
      <tr
        key={row.userId}
        className={`border-b border-gray-100 transition-all ${
          highlight
            ? 'bg-gradient-to-r from-amber-50 to-yellow-50 ring-2 ring-amber-300'
            : 'bg-white hover:bg-amber-50'
        }`}
      >
        <td className="px-6 py-4 text-center">
          <div className="flex items-center justify-center">
            {MEDAL[row.rank] ? (
              <span className="text-3xl">{MEDAL[row.rank]}</span>
            ) : (
              <span className={`text-xl font-bold ${isTop3 ? 'text-amber-600' : 'text-gray-600'}`}>
                #{row.rank}
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {row.avatarUrl ? (
                <Image src={row.avatarUrl} alt="" width={48} height={48} className="object-contain" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div>
              <p className={`font-bold text-gray-800 ${highlight ? 'text-amber-700' : ''}`}>
                {row.name} {highlight && <span className="text-sm text-amber-600">(You)</span>}
              </p>
              <p className="text-xs text-gray-500">
                {row.lessonsCompleted} lessons • {row.stars} ⭐
              </p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-xl font-bold">
            {row.lessonTotal}
          </span>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-xl font-bold">
            {row.quizTotal}
          </span>
        </td>
        <td className="px-6 py-4 text-center">
          <span className="text-2xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            {row.totalScore}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-5xl md:text-6xl">🏆</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-800">Honor Roll</h1>
                <p className="text-gray-600 mt-1">Top 20 students across the whole academy</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition-colors font-semibold"
            >
              ← Home
            </button>
          </div>

          {currentUserRow && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl p-4 text-center">
                <p className="text-xs text-gray-600 mb-1">Your Rank</p>
                <p className="text-3xl font-black text-amber-600">
                  {currentUserRow.rank <= 3 ? MEDAL[currentUserRow.rank] : `#${currentUserRow.rank}`}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-4 text-center">
                <p className="text-xs text-gray-600 mb-1">Your Total</p>
                <p className="text-3xl font-black text-blue-600">{currentUserRow.totalScore}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-4 text-center">
                <p className="text-xs text-gray-600 mb-1">Lessons Done</p>
                <p className="text-3xl font-black text-green-600">{currentUserRow.lessonsCompleted}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-4 text-center">
                <p className="text-xs text-gray-600 mb-1">Stars Earned</p>
                <p className="text-3xl font-black text-purple-600">{currentUserRow.stars} ⭐</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6 text-center">
            <p className="text-red-700 font-semibold">⚠️ {error}</p>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <th className="px-6 py-4 text-center font-bold">Rank</th>
                  <th className="px-6 py-4 text-left font-bold">Student</th>
                  <th className="px-6 py-4 text-center font-bold">Lessons</th>
                  <th className="px-6 py-4 text-center font-bold">Quizzes</th>
                  <th className="px-6 py-4 text-center font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No scores yet — be the first to get on the board! 🎯
                    </td>
                  </tr>
                ) : (
                  rows.map(row => renderRow(row, row.userId === currentUserId))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {currentUserRow && currentUserRow.rank > 20 && (
          <div className="mt-6 bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 font-bold">
              Your Position
            </div>
            <table className="w-full">
              <tbody>
                {renderRow(currentUserRow, true)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
