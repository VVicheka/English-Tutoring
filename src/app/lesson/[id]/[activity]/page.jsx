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
  QuizActivity,
} from '../../components/activityComponents';
import { useTextToSpeech } from '../../components/useTextToSpeech';

// Updated Progress Bar Component with story support
const ProgressBar = ({ currentIndex, totalActivities, lessonTitle, lessonId, customProgress, activityDisplayName, onHome }) => {
  const percentage = customProgress !== undefined 
    ? customProgress 
    : ((currentIndex + 1) / totalActivities) * 100;

  return (
    <div className="bg-white shadow-lg border-b border-gray-200 py-3 px-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <button
          onClick={onHome}
          className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all duration-200"
        >
          <span>🏠</span>
          <span className="hidden sm:inline">Home</span>
        </button>
        
        <div className="flex-1 ml-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {lessonId}
              </div>
              <h1 className="text-sm md:text-lg font-bold text-gray-800 truncate">{lessonTitle}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs md:text-sm text-gray-600 flex-shrink-0">
                {activityDisplayName || `${currentIndex + 1} of ${totalActivities}`}
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
    </div>
  );
};

// Updated Navigation Component with story support
const ActivityNavigation = ({ 
  currentActivity, 
  lessonId, 
  navigationState,
  activityDisplayName,
  onNext,
  onPrevious,
  onHome
}) => {
  const { canGoNext, canGoPrevious, nextLabel, prevLabel } = navigationState;

  return (
    <div className="bg-white border-t border-gray-200 py-4 px-4 flex-shrink-0 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3"> 
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={`px-4 md:px-6 py-2 rounded-lg font-semibold text-sm md:text-base transition-all duration-200 flex items-center space-x-1 ${
              canGoPrevious 
                ? 'bg-gray-500 hover:bg-gray-600 text-white transform hover:scale-105' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>←</span>
            <span className="hidden sm:inline">{prevLabel || 'Previous'}</span>
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 capitalize">{activityDisplayName}</p>
        </div>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`px-4 md:px-6 py-2 rounded-lg font-semibold text-sm md:text-base transition-all duration-200 transform hover:scale-105 flex items-center space-x-1 ${
            canGoNext
              ? 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span className="hidden sm:inline">{nextLabel || 'Next'}</span>
          <span>{nextLabel === 'Finish' ? '🎉' : '→'}</span>
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

  return null;
};

// Loading Screen Component
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

// Error Screen Component
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
  
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Activity state management
  const [storyPage, setStoryPage] = useState(0);
  const [creativeQuizStep, setCreativeQuizStep] = useState(0);
  const [creativeQuizCompletedSteps, setCreativeQuizCompletedSteps] = useState({});
  const [wordConnectionStep, setWordConnectionStep] = useState(0);  
  const [wordConnectionCompletedSteps, setWordConnectionCompletedSteps] = useState({});
  
  // Matching activity completion state
  const [matchingCompleted, setMatchingCompleted] = useState(false);

  // Helper function to reset activity states
  const resetActivityStates = () => {
    setStoryPage(0);
    setCreativeQuizStep(0);
    setWordConnectionStep(0);
    setWordConnectionCompletedSteps({});
    setCreativeQuizCompletedSteps({});
    setMatchingCompleted(false);
  };

  // Helper function to get expanded activities
  const getExpandedActivities = (lesson) => {
    if (!lesson?.content?.practice?.activityB) {
      return lesson.activities;
    }
    
    const activities = [...lesson.activities];
    const practiceIndex = activities.indexOf('practice');
    if (practiceIndex !== -1) {
      activities.splice(practiceIndex, 1, 'matching', 'fillwords');
    }
    return activities;
  };

  // Load lesson data
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

      const expandedActivities = getExpandedActivities(lessonData);
      console.log('Expanded activities:', expandedActivities);

      const validActivity = expandedActivities.includes(currentActivity);

      if (!validActivity) {
        console.log('Activity not found in expanded activities, redirecting to lesson start');
        setError('Activity not found');
        setTimeout(() => router.push(`/lesson/${lessonId}`), 2000);
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

  // Reset states when activity changes
  useEffect(() => {
    setStoryPage(0);
    setWordConnectionStep(0);
    setCreativeQuizStep(0);
    setCreativeQuizCompletedSteps({});
    setWordConnectionCompletedSteps({});
    setMatchingCompleted(false);
  }, [currentActivity]);

  // Handle Next Navigation - FIXED to allow progression after any attempt
  const handleNext = () => {
    const expandedActivities = getExpandedActivities(lesson);
    const currentIndex = expandedActivities.indexOf(currentActivity);
    
    // Story activity logic
    if (currentActivity === 'story' && lesson?.content?.story?.sentences) {
      const totalStoryPages = lesson.content.story.sentences.length;
      if (storyPage < totalStoryPages - 1) {
        setStoryPage(prev => prev + 1);
        return;
      }
    }
    
    // FIXED: Creative Quiz activity logic - allow progression after any attempt
    if (currentActivity === 'quiz' && lesson?.content?.quiz?.type === 'character-matching') {
      const totalSteps = lesson.content.quiz.actions.length;
      const allStepsCompleted = Object.keys(creativeQuizCompletedSteps).length === totalSteps;
      
      if (creativeQuizStep < totalSteps - 1) {
        const currentStepAttempted = creativeQuizCompletedSteps[creativeQuizStep]; // Any attempt
        if (currentStepAttempted) {
          setCreativeQuizStep(prev => prev + 1);
        }
        return;
      }
      
      // Only allow progression if all steps have been attempted
      if (!allStepsCompleted) {
        return;
      }
    }
    
    // FIXED: Word Connection activity logic - allow progression after any attempt
    if (currentActivity === 'fillwords') {
      const totalSteps = lesson?.content?.practice?.activityB?.questions?.length || 0;
      const allStepsCompleted = Object.keys(wordConnectionCompletedSteps).length === totalSteps;
      
      if (wordConnectionStep < totalSteps - 1) {
        const currentStepAttempted = wordConnectionCompletedSteps[wordConnectionStep]; // Any attempt
        if (currentStepAttempted) {
          setWordConnectionStep(prev => prev + 1);
        }
        return;
      }
      
      if (!allStepsCompleted) {
        return;
      }
    }

    // Matching activity logic - require completion before proceeding
    if (currentActivity === 'matching') {
      if (!matchingCompleted) {
        return;
      }
    }

    // Normal activity navigation
    const hasNext = currentIndex < expandedActivities.length - 1;
    
    if (hasNext) {
      const nextActivity = expandedActivities[currentIndex + 1];
      resetActivityStates();
      router.push(`/lesson/${lessonId}/${nextActivity}`);
    } else {
      console.log('Navigating to complete page');
      router.push(`/lesson/${lessonId}/complete`);
    }
  };

  // Handle Previous Navigation
  const handlePrevious = () => {
    // Story activity special handling
    if (currentActivity === 'story' && storyPage > 0) {
      setStoryPage(prev => prev - 1);
      return;
    }

    // Fill words activity special handling
    if (currentActivity === 'fillwords' && wordConnectionStep > 0) {
      setWordConnectionStep(prev => prev - 1);
      return;
    }

    // Creative quiz activity special handling
    if (currentActivity === 'quiz' && lesson?.content?.quiz?.type === 'character-matching' && creativeQuizStep > 0) {
      setCreativeQuizStep(prev => prev - 1);
      return;
    }

    // Normal activity navigation
    const expandedActivities = getExpandedActivities(lesson);
    const currentIndex = expandedActivities.indexOf(currentActivity);
    const hasPrevious = currentIndex > 0;
    
    if (hasPrevious) {
      const prevActivity = expandedActivities[currentIndex - 1];
      
      resetActivityStates();
      
      // If going back TO a story activity, set to last page
      if (prevActivity === 'story' && lesson?.content?.story?.sentences) {
        const totalStoryPages = lesson.content.story.sentences.length;
        setStoryPage(totalStoryPages - 1);
      }
      
      router.push(`/lesson/${lessonId}/${prevActivity}`);
    }
  };

  const handleHome = () => {
    router.push('/');
  };

  // Auto-navigation function with complete page redirect
  const navigateToNext = () => {
    const expandedActivities = getExpandedActivities(lesson);
    const currentIndex = expandedActivities.indexOf(currentActivity);
    const hasNext = currentIndex < expandedActivities.length - 1;
    
    if (hasNext) {
      const nextActivity = expandedActivities[currentIndex + 1];
      resetActivityStates();
      router.push(`/lesson/${lessonId}/${nextActivity}`);
    } else {
      console.log('Auto-navigating to complete page');
      router.push(`/lesson/${lessonId}/complete`);
    }
  };

  // FIXED: Navigation state - allow progression after any attempt
  const getNavigationState = () => {
    if (!lesson) return { canGoNext: false, canGoPrevious: false, nextLabel: 'Next', prevLabel: 'Previous' };

    const expandedActivities = getExpandedActivities(lesson);
    const currentIndex = expandedActivities.indexOf(currentActivity);
    const hasNext = currentIndex < expandedActivities.length - 1;
    const hasPrevious = currentIndex > 0;

    // Story activity
    if (currentActivity === 'story') {
      const totalStoryPages = lesson?.content?.story?.sentences?.length || 0;
      const canGoNext = (storyPage < totalStoryPages - 1) || hasNext;
      const canGoPrevious = (storyPage > 0) || hasPrevious;
      const nextLabel = storyPage < totalStoryPages - 1 ? 'Next Page' : hasNext ? 'Next' : 'Finish';
      const prevLabel = storyPage > 0 ? 'Previous Page' : 'Previous';
      
      return { canGoNext, canGoPrevious, nextLabel, prevLabel };
    }

    // Matching activity
    if (currentActivity === 'matching') {
      const canGoNext = matchingCompleted;
      const canGoPrevious = hasPrevious;
      const nextLabel = matchingCompleted ? (hasNext ? 'Next' : 'Finish') : 'Complete Matching';
      const prevLabel = 'Previous';
      
      return { canGoNext, canGoPrevious, nextLabel, prevLabel };
    }

    // FIXED: Fill words activity - allow progression after any attempt
    if (currentActivity === 'fillwords') {
      const totalSteps = lesson?.content?.practice?.activityB?.questions?.length || 0;
      const currentStepAttempted = wordConnectionCompletedSteps[wordConnectionStep]; // Any attempt
      const allStepsCompleted = Object.keys(wordConnectionCompletedSteps).length === totalSteps;
      
      const canGoNext = (wordConnectionStep < totalSteps - 1 && currentStepAttempted) || 
                       (wordConnectionStep === totalSteps - 1 && allStepsCompleted);
      
      const canGoPrevious = (wordConnectionStep > 0) || hasPrevious;
      
      let nextLabel = 'Next Word';
      if (wordConnectionStep === totalSteps - 1) {
        if (allStepsCompleted) {
          nextLabel = hasNext ? 'Next' : 'Finish';
        } else {
          nextLabel = 'Complete Word';
        }
      } else if (!currentStepAttempted) {
        nextLabel = 'Complete Word';
      }
      
      const prevLabel = wordConnectionStep > 0 ? 'Previous Word' : 'Previous';
      
      return { canGoNext, canGoPrevious, nextLabel, prevLabel };
    }

    // FIXED: Creative quiz activity - allow progression after any attempt
    if (currentActivity === 'quiz' && lesson?.content?.quiz?.type === 'character-matching') {
      const totalSteps = lesson.content.quiz.actions.length;
      const currentStepAttempted = creativeQuizCompletedSteps[creativeQuizStep]; // Any attempt
      const allStepsCompleted = Object.keys(creativeQuizCompletedSteps).length === totalSteps;
      
      const canGoNext = (creativeQuizStep < totalSteps - 1 && currentStepAttempted) || 
                       (creativeQuizStep === totalSteps - 1 && allStepsCompleted);
      
      const canGoPrevious = (creativeQuizStep > 0) || hasPrevious;
      
      let nextLabel = 'Next Question';
      if (creativeQuizStep === totalSteps - 1) {
        if (allStepsCompleted) {
          nextLabel = hasNext ? 'Next' : 'Finish';
        } else {
          nextLabel = 'Complete Question';
        }
      } else if (!currentStepAttempted) {
        nextLabel = 'Complete Question';
      }
      
      const prevLabel = creativeQuizStep > 0 ? 'Previous Question' : 'Previous';
      
      return { canGoNext, canGoPrevious, nextLabel, prevLabel };
    }

    // Default for other activities
    return {
      canGoNext: hasNext,
      canGoPrevious: hasPrevious,
      nextLabel: hasNext ? 'Next' : 'Finish',
      prevLabel: 'Previous'
    };
  };

  // Activity display name with step info
  const getActivityDisplayName = () => {
    if (currentActivity === 'story' && lesson?.content?.story?.sentences) {
      const totalPages = lesson.content.story.sentences.length;
      return `Story (${storyPage + 1}/${totalPages})`;
    }
    
    if (currentActivity === 'fillwords' && lesson?.content?.practice?.activityB?.questions) {
      const totalSteps = lesson.content.practice.activityB.questions.length;
      return `Fill Words (${wordConnectionStep + 1}/${totalSteps})`;
    }
    
    if (currentActivity === 'quiz' && lesson?.content?.quiz?.type === 'character-matching') {
      const totalSteps = lesson.content.quiz.actions.length;
      return `Quiz (${creativeQuizStep + 1}/${totalSteps})`;
    }
    
    return currentActivity.charAt(0).toUpperCase() + currentActivity.slice(1);
  };

  // Progress calculation including matching activity
  const getActivityProgress = () => {
    if (!lesson) return undefined;

    const expandedActivities = getExpandedActivities(lesson);
    const currentIndex = expandedActivities.indexOf(currentActivity);
    const activityWeight = 1 / expandedActivities.length;
    const baseProgress = currentIndex / expandedActivities.length;

    if (currentActivity === 'story' && lesson?.content?.story?.sentences) {
      const totalStoryPages = lesson.content.story.sentences.length;
      const storyProgress = (storyPage + 1) / totalStoryPages;
      const currentActivityProgress = storyProgress * activityWeight;
      return ((baseProgress + currentActivityProgress) * 100);
    }
    
    if (currentActivity === 'quiz' && lesson?.content?.quiz?.type === 'character-matching') {
      const totalSteps = lesson.content.quiz.actions.length;
      const stepProgress = (creativeQuizStep + 1) / totalSteps;
      const currentActivityProgress = stepProgress * activityWeight;
      return ((baseProgress + currentActivityProgress) * 100);
    }
    
    if (currentActivity === 'fillwords') {
      const totalSteps = lesson?.content?.practice?.activityB?.questions?.length || 1;
      const stepProgress = (wordConnectionStep + 1) / totalSteps;
      const currentActivityProgress = stepProgress * activityWeight;
      return ((baseProgress + currentActivityProgress) * 100);
    }
    
    if (currentActivity === 'matching') {
      const matchingProgress = matchingCompleted ? 1 : 0;
      const currentActivityProgress = matchingProgress * activityWeight;
      return ((baseProgress + currentActivityProgress) * 100);
    }
    
    return undefined; // Use default calculation
  };

  // Get activity content
  const getActivityContent = (lesson, activity) => {
    switch (activity) {
      case 'matching':
        return lesson.content.practice;
      case 'fillwords':
        return lesson.content.practice;
      default:
        return lesson.content[activity];
    }
  };

  // Error handling
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

  const expandedActivities = getExpandedActivities(lesson);
  const currentIndex = expandedActivities.indexOf(currentActivity);
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

  // Render activity with proper completion handling
  const renderActivity = () => {
    try {
      switch (currentActivity) {
        case 'warmup':
          return <WarmUpActivity content={activityContent} autoRead={true} />;
          
        case 'vocabulary':
          return <VocabularyActivity content={activityContent} />;
          
        case 'story':
          return (
            <StoryActivity 
              content={activityContent} 
              storyPage={storyPage}
              onStoryPageChange={setStoryPage}
            />
          );
          
        case 'matching':
          return (
            <MatchingActivity 
              content={activityContent} 
              onComplete={() => {
                console.log('Matching activity completed');
                setMatchingCompleted(true);
              }}
            />
          );
          
        case 'fillwords':
          return (
            <FillWordsActivity 
              content={activityContent}
              currentStep={wordConnectionStep}
              completedSteps={wordConnectionCompletedSteps}
              onStepComplete={(stepIndex, stepData) => {
                console.log('FillWords step completed:', stepIndex, stepData);
                setWordConnectionCompletedSteps(prev => ({
                  ...prev,
                  [stepIndex]: stepData
                }));
                
                // FIXED: Auto-advance after any attempt, not just correct ones
                const totalSteps = lesson?.content?.practice?.activityB?.questions?.length || 0;
                if (stepIndex < totalSteps - 1) {
                  setTimeout(() => {
                    console.log('Auto-advancing to next step');
                    setWordConnectionStep(stepIndex + 1);
                  }, 2000);
                }
              }}
              onComplete={() => {
                console.log('All fillwords completed, navigating to next activity');
                navigateToNext();
              }}
            />
          );
          
        case 'quiz':
          return (
            <QuizActivity 
              content={activityContent}
              currentStep={creativeQuizStep}
              completedSteps={creativeQuizCompletedSteps}
              onStepComplete={(stepIndex, stepData) => {
                console.log('Quiz step completed:', stepIndex, stepData);
                setCreativeQuizCompletedSteps(prev => ({
                  ...prev,
                  [stepIndex]: stepData
                }));
                
                // FIXED: Auto-advance after any attempt, not just correct ones
                const totalSteps = lesson?.content?.quiz?.actions?.length || 0;
                if (stepIndex < totalSteps - 1) {
                  setTimeout(() => {
                    setCreativeQuizStep(stepIndex + 1);
                  }, 2000);
                }
              }}
              onComplete={() => {
                navigateToNext();
              }}
            />
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

  const navigationState = getNavigationState();
  const activityDisplayName = getActivityDisplayName();
  const customProgress = getActivityProgress();

  return (
    <div className="h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col">
      <SpeechControlPanel />

      <ProgressBar 
        currentIndex={currentIndex}
        totalActivities={expandedActivities.length}
        lessonTitle={lesson.title}
        lessonId={lessonId}
        customProgress={customProgress}
        activityDisplayName={activityDisplayName}
        onHome={handleHome}
      />

      <div className="flex-1 overflow-hidden p-2">
        <div className="h-full">
          {renderActivity()}
        </div>
      </div>

      <ActivityNavigation
        currentActivity={currentActivity}
        lessonId={lessonId}
        navigationState={navigationState}
        activityDisplayName={activityDisplayName}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onHome={handleHome}
      />
    </div>
  );
}