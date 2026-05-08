"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from './lib/supabase';
import { getHighestUnlockedLesson, isLessonUnlocked, isQuizUnlocked, getLockMessage } from './lib/lessonUtils';

// Static SVG positions for the roadmap
const lessonPositions = {
  "get-started": { x: 660, y: 1140 },
  1: { x: 490, y: 1100 },
  2: { x: 352, y: 1050 },
  3: { x: 480, y: 960 },
  4: { x: 600, y: 870 },
  "quiz1": { x: 710, y: 750 },
  5: { x: 550, y: 700 },
  6: { x: 410, y: 870 },
  7: { x: 260, y: 1020 },
  8: { x: 140, y: 850 },
  "quiz2": { x: 310, y: 650 },
  9: { x: 650, y: 600 },
  10: { x: 680, y: 320 },
  11: { x: 440, y: 460 },
  12: { x: 240, y: 340 },
  "reward": { x: 385, y: 90 } // This is quiz3 but displayed as reward
};

// Hardcoded quiz data for roadmap display
const quizData = [
  {
    id: "quiz1",
    type: "quiz",
    title: "Unit 1 Checkpoint Quiz",
    focus: "Unit 1 Checkpoint",
    unlockAfterLesson: 4 // Unlocks after lesson 4
  },
  {
    id: "quiz2", 
    type: "quiz",
    title: "Unit 2 Checkpoint Quiz",
    focus: "Unit 2 Checkpoint",
    unlockAfterLesson: 8 // Unlocks after lesson 8
  },
  {
    id: "reward",
    type: "reward", // Display as reward but it's actually quiz3
    title: "🏆 Final Quiz!",
    focus: "Congratulations!",
    unlockAfterLesson: 12 // Unlocks after lesson 12
  }
];

// Fixed Navigation Buttons Component
const NavigationButtons = ({ user, userProfile, router, challengeUnlocked }) => {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      window.location.reload();
    }
  };

  const handleChallengeClick = () => {
    if (challengeUnlocked) {
      router.push('/challenge');
    } else {
      alert('🔒 Finish all 12 lessons to unlock the Endless Challenge Quiz!');
    }
  };

  return (
    <div className="fixed left-32 top-16 z-50 flex flex-col gap-6">
      {/* Profile Button Group */}
      <div className="flex flex-col items-center gap-1">
        <button
          className="w-14 h-14 bg-blue-300 hover:bg-blue-400 rounded-full shadow-md flex items-center justify-center text-white transition-all duration-200 hover:scale-105 overflow-hidden"
          onClick={() => router.push('/profile')}
        >
          {userProfile?.avatar_url ? (
            <Image
              src={userProfile.avatar_url}
              alt="Profile Avatar"
              width={40}
              height={40}
              className="object-contain"
            />
          ) : (
            <span className="text-lg">👤</span>
          )}
        </button>
        <span className="text-sm font-medium text-gray-700">
          {userProfile?.name || 'Profile'}
        </span>
      </div>

      {/* History Button Group */}
      <div className="flex flex-col items-center gap-1">
        <button
          className="w-14 h-14 bg-orange-300 hover:bg-orange-400 rounded-full shadow-md flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
          onClick={() => router.push('/history')}
        >
          <span className="text-lg">📚</span>
        </button>
        <span className="text-sm font-medium text-gray-700">History</span>
      </div>

      {/* Details Button Group */}
      <div className="flex flex-col items-center gap-1">
        <button
          className="w-14 h-14 bg-purple-300 hover:bg-purple-400 rounded-full shadow-md flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
          onClick={() => router.push('/details')}
        >
          <span className="text-lg">📋</span>
        </button>
        <span className="text-sm font-medium text-gray-700">Details</span>
      </div>

      {/* Leaderboard Button */}
      <div className="flex flex-col items-center gap-1">
        <button
          className="w-14 h-14 bg-amber-300 hover:bg-amber-400 rounded-full shadow-md flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
          onClick={() => router.push('/leaderboard')}
        >
          <span className="text-lg">🏆</span>
        </button>
        <span className="text-sm font-medium text-gray-700">Ranks</span>
      </div>

      {/* Challenge Quiz Button */}
      <div className="flex flex-col items-center gap-1">
        <button
          className={`w-14 h-14 rounded-full shadow-md flex items-center justify-center text-white transition-all duration-200 hover:scale-105 ${
            challengeUnlocked
              ? 'bg-pink-400 hover:bg-pink-500'
              : 'bg-gray-300 hover:bg-gray-400 opacity-70'
          }`}
          onClick={handleChallengeClick}
          title={challengeUnlocked ? 'Endless Challenge Quiz' : 'Finish all 12 lessons to unlock'}
        >
          <span className="text-lg">{challengeUnlocked ? '🎯' : '🔒'}</span>
        </button>
        <span className="text-sm font-medium text-gray-700">Challenge</span>
      </div>

      {/* Sign Out Button */}
      {user && (
        <div className="flex flex-col items-center gap-1">
          <button
            className="w-14 h-14 bg-red-300 hover:bg-red-400 rounded-full shadow-md flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
            onClick={handleSignOut}
          >
            <span className="text-lg">🚪</span>
          </button>
          <span className="text-sm font-medium text-gray-700">Sign Out</span>
        </div>
      )}
    </div>
  );
};

// SVG-based roadmap component
const SVGRoadmap = ({ curriculum, onClick, isAuthenticated, furthestUnlockedPosition }) => {
  const getNodeColor = (item) => {
    if (item.type === "start") {
      return "#22C55E";
    }
    if (item.type === "reward") {
      if (!item.unlocked) return "#FCD34D";
      return "#F59E0B";
    }
    if (item.type === "quiz") {
      if (!item.unlocked) return "#FDBA74";
      return "#F97316";
    }
    if (item.type === "lesson") {
      if (!item.unlocked) return "#9CA3AF";
      if (item.completed) return "#10B981";
      return "#3B82F6";
    }
    return "#9CA3AF";
  };

  return (
    <div className="flex justify-center">
      <svg 
        viewBox="0 0 800 1175" 
        style={{ 
          width: '70vw',
          height: 'auto',
          display: 'block'
        }}
      >
        {/* Background roadmap image */}
        <image 
          href="/roadmap.svg" 
          x="0" 
          y="0" 
          width="800" 
          height="1175"
          preserveAspectRatio="xMidYMid meet"
        />
        
        {/* Lesson nodes */}
        {curriculum
          .filter(item => {
            // Hide "Get Started" button if user is authenticated
            if (item.type === "start") {
              return !isAuthenticated;
            }
            return true;
          })
          .map((item) => {
            const position = lessonPositions[item.id] || { x: 400, y: 600 };
            const { x, y } = position;
            const isClickable = item.unlocked || item.completed;
            
            return (
              <g key={item.id}>
                {/* Highlight for furthest unlocked lesson */}
                {furthestUnlockedPosition && 
                 furthestUnlockedPosition.x === x && 
                 furthestUnlockedPosition.y === y && (
                  <circle
                    cx={x}
                    cy={y}
                    r="35"
                    fill="none"
                    stroke="#FFD700"
                    strokeWidth="3"
                    className="animate-pulse"
                  />
                )}
                
                {/* Stars above completed items */}
                {item.completed && item.stars > 0 && (
                  <g>
                    {[...Array(item.stars)].map((_, index) => (
                      <text
                        key={index}
                        x={x - 12 + (index * 8)}
                        y={y - 22}
                        fontSize="12"
                        fill="#FFD700"
                        textAnchor="middle"
                      >
                        ⭐
                      </text>
                    ))}
                  </g>
                )}

                {/* Lock icon for locked lessons */}
                {!item.unlocked && !item.completed && item.type !== "start" && (
                  <text
                    x={x}
                    y={y - 28}
                    fontSize="16"
                    textAnchor="middle"
                  >
                    🔒
                  </text>
                )}
                
                {/* Main lesson circle or start button rectangle */}
                {item.type === "start" ? (
                  <rect
                    x={x - 50}
                    y={y - 18}
                    width="100"
                    height="36"
                    rx="18"
                    ry="18"
                    fill={getNodeColor(item)}
                    stroke="white"
                    strokeWidth="3"
                    className={`${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'} transition-all duration-200`}
                    style={{ 
                      opacity: isClickable ? 1 : 0.6,
                      filter: isClickable ? 'none' : 'grayscale(0.5)'
                    }}
                    onClick={isClickable ? () => onClick(item) : undefined}
                  />
                ) : (
                  <circle
                    cx={x}
                    cy={y}
                    r="22"
                    fill={getNodeColor(item)}
                    stroke="white"
                    strokeWidth="3"
                    className={`${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'} transition-all duration-200`}
                    style={{ 
                      opacity: isClickable ? 1 : 0.6,
                      filter: isClickable ? 'none' : 'grayscale(0.5)'
                    }}
                    onClick={isClickable ? () => onClick(item) : undefined}
                  />
                )}
                
                {/* Lesson number or icon */}
                <text
                  x={x}
                  y={y + 1}
                  fontSize={item.type === "start" ? "13" : "16"}
                  fontWeight="bold"
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                  onClick={isClickable ? () => onClick(item) : undefined}
                >
                  {item.type === "start" ? "Get Started" : 
                   item.type === "reward" ? "🏆" : 
                   item.type === "quiz" ? "📝" : 
                   item.id}
                </text>
                
                {/* Hover effect */}
                {isClickable && (
                  item.type === "start" ? (
                    <rect
                      x={x - 50}
                      y={y - 18}
                      width="100"
                      height="36"
                      rx="18"
                      ry="18"
                      fill="transparent"
                      stroke="transparent"
                      strokeWidth="3"
                      className="hover:stroke-yellow-300 hover:stroke-4 transition-all duration-200 cursor-pointer"
                      onClick={() => onClick(item)}
                    />
                  ) : (
                    <circle
                      cx={x}
                      cy={y}
                      r="22"
                      fill="transparent"
                      stroke="transparent"
                      strokeWidth="3"
                      className="hover:stroke-yellow-300 hover:stroke-4 transition-all duration-200 cursor-pointer"
                      onClick={() => onClick(item)}
                    />
                  )
                )}
              </g>
            );
          })}
      </svg>
    </div>
  );
};

// Main Component
export default function HomePage() {
  const router = useRouter();
  const [curriculum, setCurriculum] = useState([]);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [furthestUnlockedPosition, setFurthestUnlockedPosition] = useState(null);

  // Fetch lessons from database
  const fetchLessons = async () => {
    try {
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('*')
        .order('id');

      if (error) throw error;

      return lessons || [];
    } catch (error) {
      console.error('Error fetching lessons:', error);
      return [];
    }
  };

  // Fetch user progress
  const fetchUserProgress = async (userId) => {
    try {
      // Get overall progress
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        throw progressError;
      }

      // Get lesson-specific progress
      const { data: lessonProgress, error: lessonError } = await supabase
        .from('user_lesson')
        .select('*')
        .eq('user_id', userId);

      if (lessonError) throw lessonError;

      return {
        overall: progress,
        lessons: lessonProgress || []
      };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return { overall: null, lessons: [] };
    }
  };

  // Build curriculum data from database + hardcoded quizzes with score-based unlocking
  const buildCurriculum = (lessons, userProgress) => {
    const curriculumItems = [];
    const highestUnlockedLesson = getHighestUnlockedLesson(userProgress.lessons);

    console.log('🔓 Building curriculum with highest unlocked:', highestUnlockedLesson);

    // Add "Get Started" button
    curriculumItems.push({
      id: "get-started",
      type: "start",
      title: "Get Started",
      focus: "Sign up to begin",
      completed: false,
      stars: 0,
      unlocked: true
    });

    // Add lessons from database with score-based unlocking
    lessons.forEach(lesson => {
      const lessonProgress = userProgress.lessons.find(lp => lp.lesson_id === lesson.id);
      const isCompleted = lessonProgress?.is_completed || false;
      const score = lessonProgress?.best_score || 0;
      
      // Lesson is unlocked if:
      // 1. It's lesson 1, OR
      // 2. Previous lesson is completed with score >= 50
      const isUnlocked = isLessonUnlocked(lesson.id, userProgress.lessons);
      
      // Check if previous lesson exists but doesn't meet score requirement
      const needsMinScore = lesson.id > 1 && !isUnlocked && 
        userProgress.lessons.some(lp => lp.lesson_id === lesson.id - 1 && 
          lp.is_completed && (lp.best_score || 0) < 50);
      
      console.log(`Lesson ${lesson.id}: unlocked=${isUnlocked}, completed=${isCompleted}, score=${score}`);
      
      curriculumItems.push({
        id: lesson.id,
        type: "lesson",
        title: `Lesson ${lesson.id}`,
        focus: lesson.title,
        completed: isCompleted,
        stars: lessonProgress?.best_stars || 0,
        score: score,
        unlocked: isUnlocked,
        needsMinScore: needsMinScore
      });
    });

    // Add hardcoded quizzes with score-based unlocking
    quizData.forEach(quiz => {
      const lastLessonInUnit = quiz.unlockAfterLesson;
      const isUnlocked = isQuizUnlocked(lastLessonInUnit, userProgress.lessons);
      
      // Check if last lesson is completed but doesn't meet score requirement
      const lastLessonProgress = userProgress.lessons.find(lp => lp.lesson_id === lastLessonInUnit);
      const needsMinScore = lastLessonProgress?.is_completed && 
        (lastLessonProgress?.best_score || 0) < 50;
      
      console.log(`Quiz ${quiz.id}: unlocked=${isUnlocked}, lastLesson=${lastLessonInUnit}`);
      
      curriculumItems.push({
        id: quiz.id,
        type: quiz.type,
        title: quiz.title,
        focus: quiz.focus,
        completed: false, // Check personalized_quiz table for completion
        stars: 0,
        unlocked: isUnlocked,
        needsMinScore: needsMinScore
      });
    });

    return curriculumItems;
  };

  // Calculate scroll position for furthest unlocked lesson (latest one, not first incomplete)
  const calculateScrollPosition = (curriculum) => {
    // Get all unlocked lessons (including completed ones)
    const unlockedLessons = curriculum
      .filter(item => item.type === "lesson" && item.unlocked)
      .sort((a, b) => {
        // Sort by lesson ID in descending order to get the latest
        const aId = typeof a.id === 'number' ? a.id : 0;
        const bId = typeof b.id === 'number' ? b.id : 0;
        return bId - aId; // Descending order
      });

    // Get the latest unlocked lesson (highest lesson number)
    const latestUnlocked = unlockedLessons[0];

    if (latestUnlocked && lessonPositions[latestUnlocked.id]) {
      const position = lessonPositions[latestUnlocked.id];
      setFurthestUnlockedPosition(position);
      
      console.log('🎯 Scrolling to latest unlocked lesson:', latestUnlocked.id, latestUnlocked.title);
      
      // Calculate scroll position based on SVG coordinates
      const svgHeight = 1175;
      const viewportHeight = window.innerHeight;
      const scrollRatio = position.y / svgHeight;
      const documentHeight = document.body.scrollHeight;
      
      return documentHeight * scrollRatio - (viewportHeight / 2);
    }
    
    return 0;
  };

  // Check authentication and load data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        let progress = { overall: null, lessons: [] };

        if (user) {
          // Fetch user profile
          const { data: profile, error } = await supabase
            .from('users')
            .select('name, avatar_url')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user profile:', error);
          } else {
            setUserProfile(profile);
            
            // If user doesn't have name or avatar, redirect to profile setup
            if (!profile.name || !profile.avatar_url) {
              router.push('/profile-setup');
              return;
            }
          }

          // Fetch user progress
          progress = await fetchUserProgress(user.id);
          setUserProgress(progress);
        }

        // Always fetch lessons (for display purposes)
        const lessons = await fetchLessons();
        
        // Build curriculum based on user progress with score-based unlocking
        const curriculumData = buildCurriculum(lessons, progress);
        setCurriculum(curriculumData);

      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        setUserProgress(null);
      } else if (event === 'SIGNED_IN') {
        checkAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Scroll to furthest unlocked lesson
  useEffect(() => {
    if (!loading && curriculum.length > 0 && user) {
      const timer = setTimeout(() => {
        const scrollPosition = calculateScrollPosition(curriculum);
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }, 500);
      
      return () => clearTimeout(timer);
    } else if (!loading && !user) {
      // For non-authenticated users, scroll to bottom (Get Started button)
      const timer = setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loading, curriculum, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-sky-100'>
      {/* Fixed Navigation Buttons - only show if authenticated */}
      {user && (
        <NavigationButtons
          user={user}
          userProfile={userProfile}
          router={router}
          challengeUnlocked={
            (userProgress?.lessons || []).filter(l => l.is_completed && typeof l.lesson_id === 'number').length >= 12
          }
        />
      )}

      <SVGRoadmap 
        curriculum={curriculum}
        isAuthenticated={!!user}
        furthestUnlockedPosition={furthestUnlockedPosition}
        onClick={(clickedItem) => {
          if (clickedItem.type === "start") {        
            router.push('/sign-up');
            return;                                  
          }
          
          if (clickedItem.type === "lesson") {
            if (clickedItem.unlocked || clickedItem.completed) {
              router.push(`/lesson/${clickedItem.id}`);
            } else {
              // Show specific message based on why it's locked
              if (clickedItem.needsMinScore) {
                alert('⚠️ Complete the previous lesson with a score of at least 50 to unlock this lesson!\n\nTry again to improve your score! 💪');
              } else {
                alert('🔒 Complete previous lessons to unlock this one!');
              }
            }
            return;
          }
          
          if (clickedItem.type === "quiz" || clickedItem.type === "reward") {
            if (clickedItem.unlocked || clickedItem.completed) {
              router.push(`/quiz/${clickedItem.id}`);
            } else {
              // Show specific message for quizzes
              if (clickedItem.needsMinScore) {
                alert('⚠️ Complete all lessons in this unit with a score of at least 50 to unlock this quiz!\n\nKeep practicing! 📚');
              } else {
                alert('🔒 Complete more lessons to unlock this quiz!');
              }
            }
            return;
          }
          
          console.log('Clicked:', clickedItem.title);
        }}
      />
    </div>
  );
}