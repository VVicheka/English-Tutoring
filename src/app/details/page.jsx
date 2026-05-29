"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

// Course curriculum structure
const courseStructure = [
  {
    unit: 1,
    title: "Unit 1: Animal Fun",
    emoji: "📘",
    focus: "Short Vowels (a, e, i) + Animals and Sounds",
    lessons: [
      {
        id: 1,
        title: "Lesson 1: Jungle Animals – Short a Words",
        focus: "Words like cat, bat, hat, map"
      },
      {
        id: 2,
        title: "Lesson 2: Farm Friends – Short e Words",
        focus: "Words like hen, pen, bed, net"
      },
      {
        id: 3,
        title: "Lesson 3: Zoo Day – Short i Words",
        focus: "Words like pig, fig, lid, bin"
      },
      {
        id: 4,
        title: "Lesson 4: Animal Fun Review – Short a/e/i Review",
        focus: "Combines and reviews previous short vowel words"
      }
    ],
    quiz: {
      id: "quiz1",
      title: "Checkpoint Quiz – Unit 1",
      coverage: "Covers Lessons 1 to 4",
      examples: [
        "Rhyming with 'hat'",
        "Identifying items like bat, bed, or fig"
      ]
    }
  },
  {
    unit: 2,
    title: "Unit 2: Weather & Play",
    emoji: "🌦️",
    focus: "Short o/u, Blends & Digraphs + Weather Activities",
    lessons: [
      {
        id: 5,
        title: "Lesson 5: Forest Fun – Short o Words",
        focus: "Words like fox, log, box, top"
      },
      {
        id: 6,
        title: "Lesson 6: Muddy Fun – Short u Words",
        focus: "Words like bug, rug, sun, mug"
      },
      {
        id: 7,
        title: "Lesson 7: Rainy Day Play – Consonant Blends",
        focus: "Words like frog, drip, rain, flag"
      },
      {
        id: 8,
        title: "Lesson 8: Unit 2 Review – Blends and Digraphs",
        focus: "Combines words from Lessons 5–7"
      }
    ],
    quiz: {
      id: "quiz2",
      title: "Checkpoint Quiz – Unit 2",
      coverage: "Covers Lessons 5 to 8",
      examples: [
        "Identify blend/digraph words",
        "Match images to drip, frog, flag"
      ]
    }
  },
  {
    unit: 3,
    title: "Unit 3: Our World",
    emoji: "🌍",
    focus: "Long Vowels with Silent e + Description & Opinion",
    lessons: [
      {
        id: 9,
        title: "Lesson 9: Windy Walk – Spiral Review",
        focus: "Mix of earlier learned words (cat, sun, frog, drip)"
      },
      {
        id: 10,
        title: "Lesson 10: Sunny Streets – Long a Words (a_e)",
        focus: "Words like cake, gate, rake, plane"
      },
      {
        id: 11,
        title: "Lesson 11: Home Helpers – Long i Words (i_e)",
        focus: "Words like bike, kite, pipe, time"
      },
      {
        id: 12,
        title: "Lesson 12: Final Review – Our World Summary",
        focus: "Combines long vowels and speaking/writing skills"
      }
    ],
    quiz: {
      id: "quiz3",
      title: "Checkpoint Quiz – Unit 3",
      coverage: "Covers Lessons 9 to 12",
      examples: [
        "Fill-in-the-blanks and picture matching",
        "Final comprehension & sentence practice"
      ]
    }
  }
];

export default function DetailsPage() {
  const router = useRouter();
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/sign-in');
          return;
        }

        // Fetch user progress for all lessons
        const { data: progressData } = await supabase
          .from('user_lesson')
          .select('*')
          .eq('user_id', user.id);

        setUserProgress(progressData || []);

      } catch (error) {
        console.error('Error loading details:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const getLessonProgress = (lessonId) => {
    return userProgress.find(p => p.lesson_id === lessonId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Course Details</h1>
            <p className="text-gray-600 mt-2">Complete curriculum overview</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Roadmap
          </button>
        </div>

        {/* Course Units */}
        <div className="space-y-8">
          {courseStructure.map((unit) => (
            <div key={unit.unit} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Unit Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{unit.emoji}</span>
                  <h2 className="text-2xl font-bold">{unit.title}</h2>
                </div>
                <p className="text-blue-100 ml-14">
                  <strong>Focus:</strong> {unit.focus}
                </p>
              </div>

              {/* Lessons */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span>✏️</span> Lessons
                </h3>
                <div className="space-y-3">
                  {unit.lessons.map((lesson) => {
                    const progress = getLessonProgress(lesson.id);
                    const isCompleted = progress?.is_completed || false;
                    const stars = progress?.best_stars || 0;

                    return (
                      <div
                        key={lesson.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          <span className="text-white font-bold">{lesson.id}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{lesson.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">➤ Focus: {lesson.focus}</p>
                        </div>
                        {isCompleted && (
                          <div className="flex gap-1">
                            {[...Array(stars)].map((_, i) => (
                              <span key={i} className="text-yellow-500">⭐</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Checkpoint Quiz */}
                <div className="mt-6 p-5 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-orange-800 text-lg">{unit.quiz.title}</h4>
                      <p className="text-orange-700 mt-1">{unit.quiz.coverage}</p>
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-semibold text-orange-800">Example questions include:</p>
                        {unit.quiz.examples.map((example, idx) => (
                          <p key={idx} className="text-sm text-orange-700 ml-4">• {example}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Statistics */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Lessons</h3>
            <p className="text-4xl font-bold text-blue-600">12</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Completed</h3>
            <p className="text-4xl font-bold text-green-600">
              {userProgress.filter(p => p.is_completed).length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Units</h3>
            <p className="text-4xl font-bold text-purple-600">3</p>
          </div>
        </div> */}
      </div>
    </div>
  );
}