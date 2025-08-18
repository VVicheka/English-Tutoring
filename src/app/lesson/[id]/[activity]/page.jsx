// /app/lesson/[id]/[activity]/page.jsx - Updated with better responsive layout
"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLessonById, getNextActivity, getPreviousActivity } from '../../../data/lessons';
import { 
  WarmUpActivity, 
  VocabularyActivity, 
  StoryActivity, 
  PracticeActivity, 
  QuizActivity, 
  WrapUpActivity 
} from '../../components/activityComponents';
import { useTextToSpeech } from '../../components/useTextToSpeech';

// Progress Bar Component - More compact
const ProgressBar = ({ currentIndex, totalActivities, lessonTitle }) => {
  const percentage = ((currentIndex + 1) / totalActivities) * 100;
  
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 py-2 px-4 flex-shrink-0">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-sm md:text-lg font-semibold text-gray-800 truncate">{lessonTitle}</h1>
          <span className="text-xs md:text-sm text-gray-600 flex-shrink-0 ml-2">{currentIndex + 1} of {totalActivities}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Navigation Component - More compact
const ActivityNavigation = ({ 
  currentActivity, 
  lessonId, 
  hasNext, 
  hasPrevious
}) => {
  const router = useRouter();
  
  const handleNext = () => {
    if (hasNext) {
      const nextActivity = getNextActivity(lessonId, currentActivity);
      router.push(`/lesson/${lessonId}/${nextActivity}`);
    } else {
      router.push('/');
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      const prevActivity = getPreviousActivity(lessonId, currentActivity);
      router.push(`/lesson/${lessonId}/${prevActivity}`);
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 py-3 px-4 flex-shrink-0">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={!hasPrevious}
          className={`px-4 md:px-6 py-2 rounded-lg font-semibold text-sm md:text-base transition-all duration-200 ${
            hasPrevious 
              ? 'bg-gray-500 hover:bg-gray-600 text-white' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          ← Previous
        </button>

        <button
          onClick={handleNext}
          className="px-4 md:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm md:text-base transition-all duration-200"
        >
          {hasNext ? 'Next →' : 'Finish Lesson'}
        </button>
      </div>
    </div>
  );
};

// Speech Control Panel - More compact
const SpeechControlPanel = () => {
  const { stop, isSpeaking, isSupported } = useTextToSpeech();

  if (!isSupported) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-300 rounded-lg p-2 z-50">
        <p className="text-red-600 text-xs">Speech not supported</p>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-2 shadow-lg z-50">
      <div className="flex items-center space-x-2">
        {isSpeaking && (
          <button
            onClick={stop}
            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors duration-200"
          >
            🛑 Stop
          </button>
        )}
        <div className="text-xs text-gray-500">
          {isSpeaking ? '🔊' : '🔈'}
        </div>
      </div>
    </div>
  );
};

// Main Activity Page Component
export default function ActivityPage() {
  const router = useRouter();
  const params = useParams();
  const { id: lessonId, activity: currentActivity } = params;
  
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
        router.push('/');
        return;
      }

      if (!lessonData.activities.includes(currentActivity)) {
        console.log('Activity not found in lesson, redirecting to lesson start');
        router.push(`/lesson/${lessonId}`);
        return;
      }

      console.log('Setting lesson data and stopping loading');
      setLesson(lessonData);
      setLoading(false);
    } catch (err) {
      console.error('Error in useEffect:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [lessonId, currentActivity, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-red-600">Error: {error}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading activity...</p>
          <p className="text-sm text-gray-500">Lesson: {lessonId}, Activity: {currentActivity}</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-gray-600">Lesson not found</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const currentIndex = lesson.activities.indexOf(currentActivity);
  const hasNext = currentIndex < lesson.activities.length - 1;
  const hasPrevious = currentIndex > 0;
  const activityContent = lesson.content[currentActivity];

  if (!activityContent) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-gray-600">Activity content not found</p>
          <button 
            onClick={() => router.push(`/lesson/${lessonId}`)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Back to Lesson
          </button>
        </div>
      </div>
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
        case 'practice':
          return <PracticeActivity content={activityContent} />;
        case 'quiz':
          return <QuizActivity content={activityContent} />;
        case 'wrapup':
          return <WrapUpActivity content={activityContent} />;
        default:
          return (
            <div className="text-center p-4">
              <p>Activity "{currentActivity}" not found</p>
              <p className="text-sm text-gray-500">Available activities: {lesson.activities.join(', ')}</p>
            </div>
          );
      }
    } catch (err) {
      console.error('Error rendering activity:', err);
      return (
        <div className="text-center p-4">
          <p className="text-red-600">Error loading activity: {err.message}</p>
        </div>
      );
    }
  };

  return (
    <div className="h-screen bg-sky-100 flex flex-col">
      {/* Speech Control Panel */}
      <SpeechControlPanel />

      {/* Progress Bar - Fixed height */}
      <ProgressBar 
        currentIndex={currentIndex}
        totalActivities={lesson.activities.length}
        lessonTitle={lesson.title}
      />

      {/* Activity Content - Takes all remaining space */}
      <div className="flex-1 overflow-hidden">
        {renderActivity()}
      </div>

      {/* Navigation - Fixed height */}
      <ActivityNavigation
        currentActivity={currentActivity}
        lessonId={lessonId}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      />
    </div>
  );
}