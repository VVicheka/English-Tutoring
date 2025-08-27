// /app/lesson/[id]/[activity]/page.jsx - FIXED VERSION
"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLessonById } from '../../../data/lessons';
import { 
  WarmUpActivity, 
  VocabularyActivity, 
  StoryActivity, 
  MatchingActivity,
  FillWordsActivity, 
  QuizActivity
} from '../../components/activityComponents';
import { useTextToSpeech } from '../../components/useTextToSpeech';

// Enhanced Progress Bar Component
const ProgressBar = ({ currentIndex, totalActivities, lessonTitle, lessonId }) => {
  const percentage = ((currentIndex + 1) / totalActivities) * 100;
  
  return (
    <div className="bg-white shadow-lg border-b border-gray-200 py-3 px-4 flex-shrink-0">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {lessonId}
            </div>
            <h1 className="text-sm md:text-lg font-bold text-gray-800 truncate">{lessonTitle}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs md:text-sm text-gray-600 flex-shrink-0">
              {currentIndex + 1} of {totalActivities}
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          >
            <div className="h-full bg-white opacity-30 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Navigation Component
const ActivityNavigation = ({ 
  currentActivity, 
  lessonId, 
  hasNext, 
  hasPrevious,
  activityName,
  expandedActivities,
  currentIndex
}) => {
  const router = useRouter();
  
  const handleNext = () => {
    if (hasNext) {
      const nextActivity = expandedActivities[currentIndex + 1];
      router.push(`/lesson/${lessonId}/${nextActivity}`);
    } else {
      // Lesson completed, go back to roadmap
      router.push('/');
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      const prevActivity = expandedActivities[currentIndex - 1];
      router.push(`/lesson/${lessonId}/${prevActivity}`);
    }
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <div className="bg-white border-t border-gray-200 py-4 px-4 flex-shrink-0 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleHome}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-1"
          >
            <span>🏠</span>
            <span className="hidden sm:inline">Home</span>
          </button>
          
          <button
            onClick={handlePrevious}
            disabled={!hasPrevious}
            className={`px-4 md:px-6 py-2 rounded-lg font-semibold text-sm md:text-base transition-all duration-200 flex items-center space-x-1 ${
              hasPrevious 
                ? 'bg-gray-500 hover:bg-gray-600 text-white transform hover:scale-105' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>←</span>
            <span className="hidden sm:inline">Previous</span>
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 capitalize">{activityName}</p>
        </div>

        <button
          onClick={handleNext}
          className="px-4 md:px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-lg font-semibold text-sm md:text-base transition-all duration-200 transform hover:scale-105 flex items-center space-x-1"
        >
          <span className="hidden sm:inline">{hasNext ? 'Next' : 'Finish'}</span>
          <span>{hasNext ? '→' : '🎉'}</span>
        </button>
      </div>
    </div>
  );
};

// Enhanced Speech Control Panel
const SpeechControlPanel = () => {
  const { stop, isSpeaking, isSupported } = useTextToSpeech();

  if (!isSupported) {
    return (
      <div className="fixed top-4 right-4 bg-orange-100 border border-orange-300 rounded-lg p-3 z-50 shadow-lg">
        <p className="text-orange-600 text-xs font-medium">🔇 Speech not available</p>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-3 shadow-lg z-50">
      <div className="flex items-center space-x-3">
        {isSpeaking && (
          <button
            onClick={stop}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-medium transition-colors duration-200 flex items-center space-x-1"
          >
            <span>🛑</span>
            <span>Stop</span>
          </button>
        )}
        <div className="flex items-center space-x-1">
          <span className="text-lg">
            {isSpeaking ? '🔊' : '🔈'}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            {isSpeaking ? 'Speaking...' : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Enhanced Loading Component
const LoadingScreen = ({ message, detail }) => (
  <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-md">
      <div className="relative mb-6">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-500 mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl animate-bounce">📚</span>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{message}</h2>
      <p className="text-gray-600 mb-4">Just a moment...</p>
      {detail && <p className="text-sm text-gray-500">{detail}</p>}
      
      <div className="mt-6 flex justify-center space-x-1">
        {[0, 1, 2].map((i) => (
          <div 
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{animationDelay: `${i * 0.1}s`}}
          ></div>
        ))}
      </div>
    </div>
  </div>
);

// Enhanced Error Component
const ErrorScreen = ({ error, lessonId, onGoHome }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-md">
      <div className="text-6xl mb-4">😕</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
      <p className="text-lg text-red-600 mb-4">{error}</p>
      <p className="text-sm text-gray-500 mb-6">Lesson ID: {lessonId}</p>
      <button 
        onClick={onGoHome}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
      >
        <span>🏠</span>
        <span>Go Home</span>
      </button>
    </div>
  </div>
);

// Main Activity Page Component
export default function ActivityPage() {
  const router = useRouter();
  const params = useParams();
  const { id: lessonId, activity: currentActivity } = params;
  
  const [completedActivities, setCompletedActivities] = useState(new Set());
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    console.log('ActivityPage useEffect - lessonId:', lessonId, 'currentActivity:', currentActivity);
    
    try {
      const lessonData = getLessonById(lessonId);
      console.log('Found lesson data:', lessonData);
      
      if (!lessonData) {
        console.log('No lesson found, redirecting to home');
        setError('Lesson not found');
        setTimeout(() => router.push('/'), 2000);
        return;
      }

      // Helper function to get expanded activities
      const getExpandedActivities = (lesson) => {
        if (!lesson?.content?.practice?.activityB) {
          return lesson.activities; // No activityB, return original
        }
        
        // Replace 'practice' with 'matching' and 'fillwords'
        const activities = [...lesson.activities];
        const practiceIndex = activities.indexOf('practice');
        if (practiceIndex !== -1) {
          activities.splice(practiceIndex, 1, 'matching', 'fillwords'); // Replace practice with both
        }
        return activities;
      };

      const expandedActivities = getExpandedActivities(lessonData);
      console.log('Expanded activities:', expandedActivities);

      // Check if the activity is valid (exists in expanded activities)
      const validActivity = expandedActivities.includes(currentActivity);

      if (!validActivity) {
        console.log('Activity not found in expanded activities, redirecting to lesson start');
        setError('Activity not found');
        setTimeout(() => router.push(`/lesson/${lessonId}`), 2000);
        return;
      }

      setLesson(lessonData);
      setLoading(false);

      // Load completed activities from localStorage (in a real app, this would be from a database)
      const savedProgress = localStorage.getItem(`lesson-${lessonId}-progress`);
      if (savedProgress) {
        setCompletedActivities(new Set(JSON.parse(savedProgress)));
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      setError('Failed to load lesson');
      setLoading(false);
    }
  }, [lessonId, currentActivity, router]);

  if (error) {
    return (
      <ErrorScreen 
        error={error}
        lessonId={lessonId}
        onGoHome={() => router.push('/')}
      />
    );
  }

  if (loading) {
    return (
      <LoadingScreen 
        message="Loading Activity..."
        detail={`Lesson: ${lessonId}, Activity: ${currentActivity}`}
      />
    );
  }

  if (!lesson) {
    return (
      <ErrorScreen 
        error="Lesson not found"
        lessonId={lessonId}
        onGoHome={() => router.push('/')}
      />
    );
  }

  // Helper function to get expanded activities without modifying lesson data
  const getExpandedActivities = (lesson) => {
    if (!lesson?.content?.practice?.activityB) {
      return lesson.activities; // No activityB, return original
    }
    
    // Replace 'practice' with 'matching' and 'fillwords'
    const activities = [...lesson.activities];
    const practiceIndex = activities.indexOf('practice');
    if (practiceIndex !== -1) {
      activities.splice(practiceIndex, 1, 'matching', 'fillwords'); // Replace practice with both
    }
    return activities;
  };

  const expandedActivities = lesson ? getExpandedActivities(lesson) : [];
  const currentIndex = expandedActivities.indexOf(currentActivity);
  const hasNext = currentIndex < expandedActivities.length - 1;
  const hasPrevious = currentIndex > 0;

  // Get the correct content for the activity
  const getActivityContent = (lesson, activity) => {
    switch (activity) {
      case 'matching':
        // For matching, use practice content
        return lesson.content.practice;
      case 'fillwords':
        // For fillwords, use practice content
        return lesson.content.practice;
      default:
        // For all other activities, use the activity name as the key
        return lesson.content[activity];
    }
  };

  const activityContent = getActivityContent(lesson, currentActivity);

  if (!activityContent) {
    return (
      <ErrorScreen 
        error="Activity content not found"
        lessonId={lessonId}
        onGoHome={() => router.push(`/lesson/${lessonId}`)}
      />
    );
  }

  const renderActivity = () => {
    try {
      switch (currentActivity) {
        case 'warmup':
          return <WarmUpActivity content={activityContent} autoRead={true} />;
        case 'vocabulary':
          return <VocabularyActivity content={activityContent} />;
        case 'story':
          return <StoryActivity content={activityContent} />;
        case 'matching':
          return <MatchingActivity content={activityContent} />;
        case 'fillwords':
          return <FillWordsActivity content={activityContent} />;
        case 'quiz':
          return <QuizActivity content={activityContent} />;
        case 'wrapup':
          // Since WrapUpActivity is removed, create a simple completion message
          return (
            <div className="h-full flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Lesson Complete!</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Great job finishing this lesson! You're making amazing progress.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200"
                  >
                    🏠 Back to Home
                  </button>
                  <button
                    onClick={() => {
                      const nextLessonId = parseInt(lessonId) + 1;
                      router.push(`/lesson/${nextLessonId}`);
                    }}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all duration-200"
                  >
                    📚 Next Lesson
                  </button>
                </div>
              </div>
            </div>
          );
        default:
          return (
            <div className="text-center p-8 bg-white rounded-lg shadow-lg">
              <div className="text-6xl mb-4">🤔</div>
              <p className="text-xl text-gray-700 mb-2">Activity "{currentActivity}" not found</p>
              <p className="text-sm text-gray-500">Available: {expandedActivities.join(', ')}</p>
            </div>
          );
      }
    } catch (err) {
      console.error('Error rendering activity:', err);
      return (
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-6xl mb-4">💥</div>
          <p className="text-xl text-red-600 mb-2">Error loading activity</p>
          <p className="text-sm text-gray-500">{err.message}</p>
        </div>
      );
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col">
      {/* Speech Control Panel */}
      <SpeechControlPanel />

      {/* Progress Bar */}
      <ProgressBar 
        currentIndex={currentIndex}
        totalActivities={expandedActivities.length}
        lessonTitle={lesson.title}
        lessonId={lessonId}
      />

      {/* Activity Content */}
      <div className="flex-1 overflow-hidden p-2">
        <div className="h-full">
          {renderActivity()}
        </div>
      </div>

      {/* Navigation */}
      <ActivityNavigation
        currentActivity={currentActivity}
        lessonId={lessonId}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        activityName={currentActivity}
        expandedActivities={expandedActivities}
        currentIndex={currentIndex}
      />
    </div>
  );
}