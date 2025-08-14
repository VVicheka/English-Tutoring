// /app/lesson/[id]/[activity]/page.jsx
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

// Progress Bar Component
const ProgressBar = ({ currentIndex, totalActivities, lessonTitle }) => {
  const percentage = ((currentIndex + 1) / totalActivities) * 100;
  
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-semibold text-gray-800">{lessonTitle}</h1>
          <span className="text-sm text-gray-600">{currentIndex + 1} of {totalActivities}</span>
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

// Speech Control Panel (Optional - for debugging/control)
const SpeechControlPanel = () => {
  const { stop, isSpeaking, isSupported } = useTextToSpeech();

  if (!isSupported) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-300 rounded-lg p-3 z-50">
        <p className="text-red-600 text-sm">Speech not supported in this browser</p>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-3 shadow-lg z-50">
      <div className="flex items-center space-x-2">
        {isSpeaking && (
          <button
            onClick={stop}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors duration-200"
          >
            🛑 Stop Speech
          </button>
        )}
        <div className="text-xs text-gray-500">
          {isSpeaking ? '🔊 Speaking...' : '🔈 Ready'}
        </div>
      </div>
    </div>
  );
};

// Navigation Component
const ActivityNavigation = ({ 
  currentActivity, 
  lessonId, 
  hasNext, 
  hasPrevious, 
  onComplete, 
  isCompleted 
}) => {
  const router = useRouter();
  
  const handleNext = () => {
    if (hasNext) {
      const nextActivity = getNextActivity(lessonId, currentActivity);
      router.push(`/lesson/${lessonId}/${nextActivity}`);
    } else {
      // Lesson completed, go back to roadmap
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
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={!hasPrevious}
          className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
            hasPrevious 
              ? 'bg-gray-500 hover:bg-gray-600 text-white' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          ← Previous
        </button>

        <div className="flex items-center space-x-4">
          {!isCompleted && (
            <button
              onClick={onComplete}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all duration-200"
            >
              Mark Complete ✓
            </button>
          )}
          
          {isCompleted && (
            <span className="text-green-600 font-semibold">✓ Completed</span>
          )}
        </div>

        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200"
        >
          {hasNext ? 'Next →' : 'Finish Lesson'}
        </button>
      </div>
    </div>
  );
};

// Main Activity Page Component
export default function ActivityPage() {
  const router = useRouter();
  const params = useParams();
  const { id: lessonId, activity: currentActivity } = params;
  
  const [completedActivities, setCompletedActivities] = useState(new Set());
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get lesson data
    const lessonData = getLessonById(lessonId);
    
    if (!lessonData) {
      router.push('/');
      return;
    }

    // Check if activity exists
    if (!lessonData.activities.includes(currentActivity)) {
      router.push(`/lesson/${lessonId}`);
      return;
    }

    setLesson(lessonData);
    setLoading(false);

    // Load completed activities from localStorage (in a real app, this would be from a database)
    const savedProgress = localStorage.getItem(`lesson-${lessonId}-progress`);
    if (savedProgress) {
      setCompletedActivities(new Set(JSON.parse(savedProgress)));
    }
  }, [lessonId, currentActivity, router]);

  const handleMarkComplete = () => {
    const newCompleted = new Set(completedActivities);
    newCompleted.add(currentActivity);
    setCompletedActivities(newCompleted);
    
    // Save to localStorage
    localStorage.setItem(`lesson-${lessonId}-progress`, JSON.stringify([...newCompleted]));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  const currentIndex = lesson.activities.indexOf(currentActivity);
  const hasNext = currentIndex < lesson.activities.length - 1;
  const hasPrevious = currentIndex > 0;
  const isCompleted = completedActivities.has(currentActivity);
  const activityContent = lesson.content[currentActivity];

  // Render appropriate activity component
  const renderActivity = () => {
    switch (currentActivity) {
      case 'warmup':
        return <WarmUpActivity content={activityContent} />;
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
        return <div>Activity not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-sky-100">
      {/* Speech Control Panel */}
      <SpeechControlPanel />

      {/* Progress Bar */}
      <ProgressBar 
        currentIndex={currentIndex}
        totalActivities={lesson.activities.length}
        lessonTitle={lesson.title}
      />

      {/* Activity Content */}
      <div className="py-8 px-4">
        {renderActivity()}
      </div>

      {/* Navigation */}
      <ActivityNavigation
        currentActivity={currentActivity}
        lessonId={lessonId}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        onComplete={handleMarkComplete}
        isCompleted={isCompleted}
      />
    </div>
  );
}