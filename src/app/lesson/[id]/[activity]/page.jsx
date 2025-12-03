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

// Progress Bar Component
const ProgressBar = ({ currentIndex, totalActivities, lessonTitle, lessonId, customProgress, currentPage, totalPages, onHome }) => {
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
              <span className="text-xs md:text-sm text-gray-600 flex-shrink-0 font-medium">
                {currentPage}/{totalPages}
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

// Navigation Component
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

// Speech Control Panel
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
  
  // Score tracking state
  const [activityScores, setActivityScores] = useState({
    matching: 0,
    fillwords: 0,
    quiz: 0
  });

  // FIXED: Helper function to save scores immediately
  const saveScoresToLocalStorage = (scores, completed) => {
    if (!lessonId) return;
    
    const scoreData = {
      lessonId: lessonId,
      scores: scores,
      totalScore: scores.matching + scores.fillwords + scores.quiz,
      completedSteps: {
        matching: completed.matching,
        fillwords: completed.fillwords,
        quiz: completed.quiz
      },
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(`lesson_${lessonId}_scores`, JSON.stringify(scoreData));
      console.log('✅ Scores saved to localStorage:', scoreData);
      return true;
    } catch (e) {
      console.error('❌ Error saving to localStorage:', e);
      return false;
    }
  };

  // FIXED: Auto-save scores whenever they change
  useEffect(() => {
    if (!lesson || !lessonId) return;
    
    // Debounce to avoid too many saves
    const timeoutId = setTimeout(() => {
      saveScoresToLocalStorage(activityScores, {
        matching: matchingCompleted,
        fillwords: wordConnectionCompletedSteps,
        quiz: creativeQuizCompletedSteps
      });
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [activityScores, matchingCompleted, wordConnectionCompletedSteps, creativeQuizCompletedSteps, lessonId, lesson]);

  // FIXED: Load existing scores on mount
  useEffect(() => {
    if (!lessonId || typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem(`lesson_${lessonId}_scores`);
      if (saved) {
        const scoreData = JSON.parse(saved);
        console.log('📊 Loading existing scores:', scoreData);
        
        if (scoreData.scores) {
          setActivityScores(scoreData.scores);
        }
        
        if (scoreData.completedSteps) {
          if (scoreData.completedSteps.matching) {
            setMatchingCompleted(scoreData.completedSteps.matching);
          }
          if (scoreData.completedSteps.fillwords) {
            setWordConnectionCompletedSteps(scoreData.completedSteps.fillwords);
          }
          if (scoreData.completedSteps.quiz) {
            setCreativeQuizCompletedSteps(scoreData.completedSteps.quiz);
          }
        }
      }
    } catch (e) {
      console.error('Error loading scores:', e);
    }
  }, [lessonId]);

  // Calculate total score out of 100
  const calculateTotalScore = () => {
    return activityScores.matching + activityScores.fillwords + activityScores.quiz;
  };

  // Calculate score for matching activity (20 points)
  const calculateMatchingScore = (correctMatches, totalPairs) => {
    if (totalPairs === 0) return 0;
    return Math.round((correctMatches / totalPairs) * 20);
  };

  // Calculate score for fill words activity (40 points)
  const calculateFillWordsScore = (completedSteps, totalQuestions) => {
    if (totalQuestions === 0) return 0;
    const correctCount = Object.values(completedSteps).filter(step => step.isCorrect).length;
    return Math.round((correctCount / totalQuestions) * 40);
  };

  // Calculate score for quiz activity (40 points)
  const calculateQuizScore = (completedSteps, totalActions) => {
    if (totalActions === 0) return 0;
    const correctCount = Object.values(completedSteps).filter(step => step.isCorrect).length;
    return Math.round((correctCount / totalActions) * 40);
  };

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

  // Calculate total pages across all activities
  const getTotalPages = (lesson) => {
    if (!lesson) return 0;
    
    let totalPages = 0;
    const expandedActivities = getExpandedActivities(lesson);
    
    expandedActivities.forEach(activity => {
      if (activity === 'story' && lesson?.content?.story?.sentences) {
        totalPages += lesson.content.story.sentences.length;
      } else if (activity === 'fillwords' && lesson?.content?.practice?.activityB?.questions) {
        totalPages += lesson.content.practice.activityB.questions.length;
      } else if (activity === 'quiz' && lesson?.content?.quiz?.type === 'character-matching') {
        totalPages += lesson.content.quiz.actions.length;
      } else {
        totalPages += 1;
      }
    });
    
    return totalPages;
  };

  // Calculate current page number
  const getCurrentPage = (lesson) => {
    if (!lesson) return 1;
    
    const expandedActivities = getExpandedActivities(lesson);
    const currentIndex = expandedActivities.indexOf(currentActivity);
    let currentPage = 0;
    
    for (let i = 0; i < currentIndex; i++) {
      const activity = expandedActivities[i];
      if (activity === 'story' && lesson?.content?.story?.sentences) {
        currentPage += lesson.content.story.sentences.length;
      } else if (activity === 'fillwords' && lesson?.content?.practice?.activityB?.questions) {
        currentPage += lesson.content.practice.activityB.questions.length;
      } else if (activity === 'quiz' && lesson?.content?.quiz?.type === 'character-matching') {
        currentPage += lesson.content.quiz.actions.length;
      } else {
        currentPage += 1;
      }
    }
    
    if (currentActivity === 'story') {
      currentPage += storyPage + 1;
    } else if (currentActivity === 'fillwords') {
      currentPage += wordConnectionStep + 1;
    } else if (currentActivity === 'quiz' && lesson?.content?.quiz?.type === 'character-matching') {
      currentPage += creativeQuizStep + 1;
    } else {
      currentPage += 1;
    }
    
    return currentPage;
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

      // If this is the first activity (warmup), clear any old progress
      if (currentActivity === expandedActivities[0]) {
        console.log('🆕 Starting lesson from beginning - checking if we should clear old progress');
        
        // Check if user explicitly wants to retry
        if (typeof window !== 'undefined') {
          try {
            const hasScores = localStorage.getItem(`lesson_${lessonId}_scores`);
            const hasMatching = localStorage.getItem(`lesson_${lessonId}_matching`);
            const hasFillwords = localStorage.getItem(`lesson_${lessonId}_fillwords`);
            const hasQuiz = localStorage.getItem(`lesson_${lessonId}_quiz`);
            
            // If no scores but has activity progress, this is a retry - clear everything
            if (!hasScores && (hasMatching || hasFillwords || hasQuiz)) {
              console.log('🔄 Detected retry attempt - clearing all activity progress');
              localStorage.removeItem(`lesson_${lessonId}_matching`);
              localStorage.removeItem(`lesson_${lessonId}_fillwords`);
              localStorage.removeItem(`lesson_${lessonId}_quiz`);
              localStorage.removeItem(`lesson_${lessonId}_story`);
            }
          } catch (e) {
            console.error('Error checking localStorage:', e);
          }
        }
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const hasStoredProgress = 
          (currentActivity === 'matching' && localStorage.getItem(`lesson_${lessonId}_matching`)) ||
          (currentActivity === 'fillwords' && localStorage.getItem(`lesson_${lessonId}_fillwords`)) ||
          (currentActivity === 'story' && localStorage.getItem(`lesson_${lessonId}_story`)) ||
          (currentActivity === 'quiz' && localStorage.getItem(`lesson_${lessonId}_quiz`));

        console.log('Activity changed to:', currentActivity, 'Has stored progress:', hasStoredProgress);

        if (!hasStoredProgress) {
          if (currentActivity === 'story') {
            setStoryPage(0);
          } else if (currentActivity === 'fillwords') {
            setWordConnectionStep(0);
            setWordConnectionCompletedSteps({});
          } else if (currentActivity === 'quiz') {
            setCreativeQuizStep(0);
            setCreativeQuizCompletedSteps({});
          } else if (currentActivity === 'matching') {
            setMatchingCompleted(false);
          }
        }
      } catch (e) {
        console.error('Error checking localStorage:', e);
      }
    }
  }, [currentActivity, lessonId]);

  const getNavigationState = () => {
    if (!lesson) return { canGoNext: false, canGoPrevious: false, nextLabel: 'Next', prevLabel: 'Previous' };

    const expandedActivities = getExpandedActivities(lesson);
    const currentIndex = expandedActivities.indexOf(currentActivity);
    
    const isMatchingCompleted = currentActivity === 'matching' && matchingCompleted;
    const totalFillWordsSteps = lesson?.content?.practice?.activityB?.questions?.length || 0;
    const isFillWordsCompleted = currentActivity === 'fillwords' && 
      Object.keys(wordConnectionCompletedSteps).length === totalFillWordsSteps && totalFillWordsSteps > 0;
    const totalQuizSteps = lesson?.content?.quiz?.actions?.length || 0;
    const isQuizCompleted = currentActivity === 'quiz' && 
      lesson?.content?.quiz?.type === 'character-matching' &&
      Object.keys(creativeQuizCompletedSteps).length === totalQuizSteps && totalQuizSteps > 0;
    
    let canGoPrevious = false;
    
    if (currentActivity === 'fillwords' || (currentActivity === 'quiz' && lesson?.content?.quiz?.type === 'character-matching')) {
      canGoPrevious = false;
    } else if (isMatchingCompleted) {
      canGoPrevious = false;
    } else {
      canGoPrevious = currentIndex > 0 || 
        (currentActivity === 'story' && storyPage > 0);
    }

    let canGoNext = false;
    let nextLabel = 'Next';

    if (currentActivity === 'story') {
      const totalStoryPages = lesson?.content?.story?.sentences?.length || 0;
      const hasNextPage = storyPage < totalStoryPages - 1;
      const hasNextActivity = currentIndex < expandedActivities.length - 1;
      
      canGoNext = hasNextPage || hasNextActivity;
      
      if (hasNextPage) {
        nextLabel = 'Next Page';
      } else if (hasNextActivity) {
        nextLabel = 'Next Activity';
      } else {
        nextLabel = 'Finish';
      }
    } else if (currentActivity === 'fillwords') {
      const totalSteps = lesson?.content?.practice?.activityB?.questions?.length || 0;
      const hasNextStep = wordConnectionStep < totalSteps - 1;
      const hasNextActivity = currentIndex < expandedActivities.length - 1;
      const currentStepAttempted = wordConnectionCompletedSteps[wordConnectionStep];
      
      if (hasNextStep) {
        canGoNext = !!currentStepAttempted;
        nextLabel = 'Next Word';
      } else {
        canGoNext = !!currentStepAttempted;
        nextLabel = hasNextActivity ? 'Next Activity' : 'Finish';
      }
    } else if (currentActivity === 'quiz' && lesson?.content?.quiz?.type === 'character-matching') {
      const totalSteps = lesson.content.quiz.actions.length;
      const hasNextStep = creativeQuizStep < totalSteps - 1;
      const hasNextActivity = currentIndex < expandedActivities.length - 1;
      const currentStepAttempted = creativeQuizCompletedSteps[creativeQuizStep];
      
      if (hasNextStep) {
        canGoNext = !!currentStepAttempted;
        nextLabel = 'Next Question';
      } else {
        canGoNext = !!currentStepAttempted;
        nextLabel = hasNextActivity ? 'Next Activity' : 'Finish';
      }
    } else if (currentActivity === 'matching') {
      const hasNextActivity = currentIndex < expandedActivities.length - 1;
      canGoNext = matchingCompleted;
      nextLabel = hasNextActivity ? 'Next Activity' : 'Finish';
    } else {
      const hasNextActivity = currentIndex < expandedActivities.length - 1;
      canGoNext = true;
      nextLabel = hasNextActivity ? 'Next Activity' : 'Finish';
    }

    return { 
      canGoNext, 
      canGoPrevious, 
      nextLabel, 
      prevLabel: 'Previous' 
    };
  };

  const handleNext = () => {
    const expandedActivities = getExpandedActivities(lesson);
    const currentIndex = expandedActivities.indexOf(currentActivity);

    if (currentActivity === 'story') {
      const totalStoryPages = lesson?.content?.story?.sentences?.length || 0;
      if (storyPage < totalStoryPages - 1) {
        setStoryPage(prev => prev + 1);
        return;
      }
    } else if (currentActivity === 'fillwords') {
      const totalSteps = lesson?.content?.practice?.activityB?.questions?.length || 0;
      const currentStepAttempted = wordConnectionCompletedSteps[wordConnectionStep];
      
      if (!currentStepAttempted) {
        console.log('Cannot proceed - current step not attempted');
        return;
      }
      
      if (wordConnectionStep < totalSteps - 1) {
        setWordConnectionStep(prev => prev + 1);
        return;
      }
    } else if (currentActivity === 'quiz' && lesson?.content?.quiz?.type === 'character-matching') {
      const totalSteps = lesson.content.quiz.actions.length;
      const currentStepAttempted = creativeQuizCompletedSteps[creativeQuizStep];
      
      if (!currentStepAttempted) {
        console.log('Cannot proceed - current quiz step not attempted');
        return;
      }
      
      if (creativeQuizStep < totalSteps - 1) {
        setCreativeQuizStep(prev => prev + 1);
        return;
      }
    } else if (currentActivity === 'matching') {
      if (!matchingCompleted) {
        console.log('Cannot proceed - matching not completed');
        return;
      }
    }

    const hasNext = currentIndex < expandedActivities.length - 1;
    
    if (hasNext) {
      const nextActivity = expandedActivities[currentIndex + 1];
      
      // FIXED: Force save before navigation
      saveScoresToLocalStorage(activityScores, {
        matching: matchingCompleted,
        fillwords: wordConnectionCompletedSteps,
        quiz: creativeQuizCompletedSteps
      });
      
      router.push(`/lesson/${lessonId}/${nextActivity}`);
    } else {
      console.log('Navigating to complete page');
      
      // FIXED: Save scores immediately before navigation
      const saved = saveScoresToLocalStorage(activityScores, {
        matching: matchingCompleted,
        fillwords: wordConnectionCompletedSteps,
        quiz: creativeQuizCompletedSteps
      });
      
      if (saved) {
        // Small delay to ensure storage completes
        setTimeout(() => {
          router.push(`/lesson/${lessonId}/complete`);
        }, 100);
      } else {
        // Navigate anyway even if save failed
        router.push(`/lesson/${lessonId}/complete`);
      }
    }
  };

  const handlePrevious = () => {
    const expandedActivities = getExpandedActivities(lesson);
    const currentIndex = expandedActivities.indexOf(currentActivity);

    if (currentActivity === 'story' && storyPage > 0) {
      setStoryPage(prev => prev - 1);
      return;
    } else if (currentActivity === 'fillwords' && wordConnectionStep > 0) {
      setWordConnectionStep(prev => prev - 1);
      return;
    } else if (currentActivity === 'quiz' && lesson?.content?.quiz?.type === 'character-matching' && creativeQuizStep > 0) {
      setCreativeQuizStep(prev => prev - 1);
      return;
    }

    if (currentIndex > 0) {
      const prevActivity = expandedActivities[currentIndex - 1];
      
      if (prevActivity === 'story' && lesson?.content?.story?.sentences) {
        const totalStoryPages = lesson.content.story.sentences.length;
        setStoryPage(totalStoryPages - 1);
      } else if (prevActivity === 'fillwords' && lesson?.content?.practice?.activityB?.questions) {
        const totalSteps = lesson.content.practice.activityB.questions.length;
        setWordConnectionStep(totalSteps - 1);
      } else if (prevActivity === 'quiz' && lesson?.content?.quiz?.type === 'character-matching') {
        const totalSteps = lesson.content.quiz.actions.length;
        setCreativeQuizStep(totalSteps - 1);
      }
      
      router.push(`/lesson/${lessonId}/${prevActivity}`);
    }
  };

  const handleHome = () => {
    // FIXED: Save scores before leaving
    saveScoresToLocalStorage(activityScores, {
      matching: matchingCompleted,
      fillwords: wordConnectionCompletedSteps,
      quiz: creativeQuizCompletedSteps
    });
    
    router.push('/');
  };

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
    
    return undefined;
  };

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
              onComplete={(correctCount, totalCount) => {
                console.log('Matching activity completed');
                setMatchingCompleted(true);
                
                const score = calculateMatchingScore(correctCount, totalCount);
                
                // FIXED: Update state and save immediately
                setActivityScores(prev => {
                  const newScores = {
                    ...prev,
                    matching: score
                  };
                  
                  // Save immediately
                  saveScoresToLocalStorage(newScores, {
                    matching: true,
                    fillwords: wordConnectionCompletedSteps,
                    quiz: creativeQuizCompletedSteps
                  });
                  
                  console.log('Matching score saved:', score, '/', 20);
                  return newScores;
                });
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
                
                setWordConnectionCompletedSteps(prev => {
                  const updatedSteps = {
                    ...prev,
                    [stepIndex]: stepData
                  };
                  
                  const totalQuestions = lesson?.content?.practice?.activityB?.questions?.length || 0;
                  const score = calculateFillWordsScore(updatedSteps, totalQuestions);
                  
                  // FIXED: Update and save immediately
                  setActivityScores(prevScores => {
                    const newScores = {
                      ...prevScores,
                      fillwords: score
                    };
                    
                    // Save immediately
                    saveScoresToLocalStorage(newScores, {
                      matching: matchingCompleted,
                      fillwords: updatedSteps,
                      quiz: creativeQuizCompletedSteps
                    });
                    
                    console.log('FillWords score saved:', score, '/', 40);
                    return newScores;
                  });
                  
                  return updatedSteps;
                });
              }}
              onComplete={() => {
                console.log('All fillwords completed');
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
                
                setCreativeQuizCompletedSteps(prev => {
                  const updatedSteps = {
                    ...prev,
                    [stepIndex]: stepData
                  };
                  
                  const totalActions = lesson?.content?.quiz?.actions?.length || 0;
                  const score = calculateQuizScore(updatedSteps, totalActions);
                  
                  // FIXED: Update and save immediately
                  setActivityScores(prevScores => {
                    const newScores = {
                      ...prevScores,
                      quiz: score
                    };
                    
                    // Save immediately
                    saveScoresToLocalStorage(newScores, {
                      matching: matchingCompleted,
                      fillwords: wordConnectionCompletedSteps,
                      quiz: updatedSteps
                    });
                    
                    console.log('Quiz score saved:', score, '/', 40);
                    return newScores;
                  });
                  
                  return updatedSteps;
                });
              }}
              onComplete={() => {
                console.log('All quiz completed');
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
  const totalPages = getTotalPages(lesson);
  const currentPage = getCurrentPage(lesson);

  return (
    <div className="h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col">
      <SpeechControlPanel />

      <ProgressBar 
        currentIndex={currentIndex}
        totalActivities={expandedActivities.length}
        lessonTitle={lesson.title}
        lessonId={lessonId}
        customProgress={customProgress}
        currentPage={currentPage}
        totalPages={totalPages}
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