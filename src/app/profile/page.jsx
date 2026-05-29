"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "../lib/supabase";

// Lessons + Exams master list
const allLessonsAndQuizzes = [
  { id: 1, type: "lesson", title: "Lesson 1: Jungle Animals – Short a Words" },
  { id: 2, type: "lesson", title: "Lesson 2: Farm Friends – Short e Words" },
  { id: 3, type: "lesson", title: "Lesson 3: Zoo Day – Short i Words" },
  { id: 4, type: "lesson", title: "Lesson 4: Animal Fun Review – Short a/e/i Review" },
  { id: "quiz1", type: "exam", title: "Exam 1: Unit 1 Checkpoint Quiz" },
  { id: 5, type: "lesson", title: "Lesson 5: Forest Fun – Short o Words" },
  { id: 6, type: "lesson", title: "Lesson 6: Muddy Fun – Short u Words" },
  { id: 7, type: "lesson", title: "Lesson 7: Rainy Day Play – Consonant Blends" },
  { id: 8, type: "lesson", title: "Lesson 8: Unit 2 Review – Blends and Digraphs" },
  { id: "quiz2", type: "exam", title: "Exam 2: Unit 2 Checkpoint Quiz" },
  { id: 9, type: "lesson", title: "Lesson 9: Windy Walk – Spiral Review" },
  { id: 10, type: "lesson", title: "Lesson 10: Sunny Streets – Long a Words (a_e)" },
  { id: 11, type: "lesson", title: "Lesson 11: Home Helpers – Long i Words (i_e)" },
  { id: 12, type: "lesson", title: "Lesson 12: Final Review – Our World Summary" },
  { id: "quiz3", type: "exam", title: "Exam 3: Unit 3 Final Quiz" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userProgress, setUserProgress] = useState([]);
  const [bestQuizScores, setBestQuizScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showInfo, setShowInfo] = useState(true); // toggled by "v" button

  const [formData, setFormData] = useState({ name: "", email: "" });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/sign-in");
          return;
        }
        setUser(user);

        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        setUserProfile(profile);
        setFormData({ name: profile?.name || "", email: user.email || "" });

        const [lessonRes, quizRes] = await Promise.all([
          supabase.from("user_lesson").select("*").eq("user_id", user.id),
          supabase
            .from("personalized_quiz")
            .select("quiz_type, score")
            .eq("user_id", user.id)
            .eq("is_completed", true)
            .in("quiz_type", ["quiz1", "quiz2", "quiz3"])
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
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ name: formData.name })
        .eq("id", user.id);
      if (error) throw error;
      setUserProfile({ ...userProfile, name: formData.name });
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    }
  };

  // Helpers
  const getRemark = (score) => {
    if (score >= 85) return { text: "Excellent!", color: "text-green-600" };
    // if (score >= 80) return { text: "Great!", color: "text-blue-600" };
    if (score >= 70) return { text: "Good", color: "text-yellow-600" };
    if (score >= 50) return { text: "Fair", color: "text-orange-600" };
    return { text: "Need More Practice", color: "text-red-600" };
  };

  // Progress math — numeric IDs as lessons, string IDs as exams
  const totalLessons = allLessonsAndQuizzes.filter((i) => i.type === "lesson").length;
  const totalExams = allLessonsAndQuizzes.filter((i) => i.type === "exam").length;
  const completedLessons = userProgress.filter((p) => p.is_completed && typeof p.lesson_id === "number").length;
  const completedExams = Object.keys(bestQuizScores).length;

  // Circular Progress Component (amber like before)
  const CircularProgress = ({ value, max, label, color = "#FCD34D" }) => {
    const percentage = max === 0 ? 0 : (value / max) * 100;
    const radius = 72; // fits nicely next to PF
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center bg-white rounded-3xl shadow-lg p-4 hover:shadow-xl transition-shadow w-full h-[220px]">
        <div className="relative w-48 h-48">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle cx="96" cy="96" r={radius} stroke="#F3F4F6" strokeWidth="18" fill="none" />
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke={color}
              strokeWidth="18"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{ filter: "drop-shadow(0 4px 6px rgba(252, 211, 77, 0.3))" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-blue-600 font-semibold text-base mb-1">{label}</div>
            <div className="text-gray-900 font-bold text-3xl">
              {value} <span className="text-gray-500 text-xl">of</span> {max}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Layout switches:
  // - showInfo === false => PF and Progress are side-by-side; PF set to fixed height equal to progress cards
  // - showInfo === true  => PF spans full width, Progress moves below in its own row
  return (
    <div className="min-h-screen bg-sky-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Profile</h1>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Roadmap
          </button>
        </div>

        {/* Top Section: conditional grid */}
        {showInfo ? (
          // OPEN: PF full row, Progress under it
          <div className="space-y-8 mb-10">
            {/* PF full width */}
            <div className="bg-white rounded-3xl shadow-md p-6">
              {/* Card header with "v" toggle */}
              <div className="flex items-start gap-5">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {userProfile?.avatar_url ? (
                    <Image src={userProfile.avatar_url} alt="Profile Avatar" width={96} height={96} className="object-contain" />
                  ) : (
                    <span className="text-4xl">👤</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-1 truncate">{userProfile?.name || "No name set"}</h2>
                      <p className="text-gray-600 truncate">{user?.email}</p>
                    </div>
                    <button
                    onClick={() => setShowInfo(false)}
                    className="h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all duration-300 rotate-180"
                    aria-label="Collapse details"
                    title="Collapse details"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06 0L10 10.94l3.71-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 010-1.06z" clipRule="evenodd" />
                    </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Details (visible when open) */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-800 text-lg">{userProfile?.name || "Not set"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <p className="text-gray-800 text-lg">{user?.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                    <p className="text-gray-800 text-lg">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  {editing ? (
                    <>
                      <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg transition-colors">Save Changes</button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setFormData({ name: userProfile?.name || "", email: user?.email || "" });
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg transition-colors">Edit Profile</button>
                  )}
                </div>
              </div>
            </div>

            {/* Progress on its own row when open */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CircularProgress value={completedExams} max={totalExams} label="Exams" />
              <CircularProgress value={completedLessons} max={totalLessons} label="Lessons" />
            </div>
          </div>
        ) : (
          // CLOSED: PF and Progress side-by-side; PF same height as progress cards
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* PF (collapsed) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-md p-6 h-[220px] flex items-center">
                <div className="w-full flex items-start gap-5">
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {userProfile?.avatar_url ? (
                      <Image src={userProfile.avatar_url} alt="Profile Avatar" width={96} height={96} className="object-contain" />
                    ) : (
                      <span className="text-4xl">👤</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-1 truncate">{userProfile?.name || "No name set"}</h2>
                        <p className="text-gray-600 truncate">{user?.email}</p>
                      </div>
                      <button
                      onClick={() => setShowInfo(true)}
                      className="h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all duration-300"
                      aria-label="Expand details"
                      title="Expand details"
                      >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06 0L10 10.94l3.71-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 010-1.06z" clipRule="evenodd" />
                      </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress to the right (same row) */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
                <CircularProgress value={completedExams} max={totalExams} label="Exams" />
                <CircularProgress value={completedLessons} max={totalLessons} label="Lessons" />
              </div>
            </div>
          </div>
        )}

        {/* Progress Table */}
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
                  const progress = userProgress.find((p) => p.lesson_id === item.id);
                  const quizScore = item.type === "exam" ? bestQuizScores[item.id] : undefined;
                  const isCompleted = quizScore !== undefined || progress?.is_completed || false;
                  const bestScore = quizScore !== undefined ? quizScore : (progress?.best_score || 0);
                  const remark = getRemark(bestScore);

                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-100 transition-all ${
                        isCompleted ? "bg-white hover:bg-blue-50" : "bg-gray-50 opacity-60"
                      }`}
                    >
                      <td className="px-8 py-5">
                        <span
                          className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${
                            item.type === "exam"
                              ? "bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700"
                              : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700"
                          } ${!isCompleted && "opacity-50"}`}
                        >
                          {item.type === "exam" ? "📝 Exam" : "📚 Lesson"}
                        </span>
                      </td>
                      <td className={`px-8 py-5 font-semibold text-base ${isCompleted ? "text-gray-900" : "text-gray-500"}`}>
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
                          <span className={`font-bold text-lg ${remark.color}`}>{remark.text}</span>
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
