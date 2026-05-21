// Utility functions for lesson unlock logic, progress tracking, and shared UI helpers

export function getPerformanceInfo(score) {
  if (score >= 90) return { level: 'Excellent!', label: 'Excellent', emoji: '🌟', color: 'text-yellow-500', bgColor: 'bg-yellow-50', badgeClass: 'text-yellow-600 bg-yellow-50' };
  if (score >= 70) return { level: 'Great Job!',  label: 'Great',     emoji: '🎉', color: 'text-green-500',  bgColor: 'bg-green-50',  badgeClass: 'text-green-600 bg-green-50' };
  if (score >= 50) return { level: 'Good Work!',  label: 'Good',      emoji: '👍', color: 'text-blue-500',   bgColor: 'bg-blue-50',   badgeClass: 'text-blue-600 bg-blue-50' };
  return             { level: 'Keep Practicing!', label: 'Practice More', emoji: '💪', color: 'text-orange-500', bgColor: 'bg-orange-50', badgeClass: 'text-orange-600 bg-orange-50' };
}

export function getExpandedActivities(lesson) {
  if (!lesson?.content?.practice?.activityB) return lesson.activities;
  const activities = [...lesson.activities];
  const practiceIndex = activities.indexOf('practice');
  if (practiceIndex !== -1) activities.splice(practiceIndex, 1, 'matching', 'fillwords');
  return activities;
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Check if a lesson is unlocked based on previous lesson completion
 * @param {number} lessonId - The lesson ID to check
 * @param {Array} userProgress - Array of user_lesson records from database
 * @returns {boolean} - Whether the lesson is unlocked
 */
export function isLessonUnlocked(lessonId, userProgress) {
  // Lesson 1 is always unlocked
  if (lessonId === 1) return true;
  
  // Check if previous lesson is completed with score >= 50
  const previousLessonId = lessonId - 1;
  const previousProgress = userProgress?.find(p => p.lesson_id === previousLessonId);
  
  // Previous lesson must be completed AND score must be >= 50
  return previousProgress?.is_completed && (previousProgress?.best_score || 0) >= 50;
}

/**
 * Get the highest unlocked lesson for a user
 * @param {Array} userProgress - Array of user_lesson records from database
 * @returns {number} - The highest unlocked lesson ID (1-12)
 */
export function getHighestUnlockedLesson(userProgress) {
  if (!userProgress || userProgress.length === 0) {
    return 1; // Only lesson 1 is unlocked
  }
  
  let highestUnlocked = 1;
  
  // Check each lesson sequentially
  for (let lessonId = 1; lessonId <= 12; lessonId++) {
    const progress = userProgress.find(p => p.lesson_id === lessonId);
    
    // If this lesson is completed with score >= 50, next lesson is unlocked
    if (progress?.is_completed && (progress?.best_score || 0) >= 50) {
      highestUnlocked = lessonId + 1;
    } else {
      // If this lesson doesn't meet requirements, stop checking
      break;
    }
  }
  
  return Math.min(highestUnlocked, 12); // Cap at lesson 12
}

/**
 * Check if a quiz is unlocked based on unit completion
 * @param {number} lastLessonInUnit - The last lesson ID in the unit (4, 8, or 12)
 * @param {Array} userProgress - Array of user_lesson records from database
 * @returns {boolean} - Whether the quiz is unlocked
 */
export function isQuizUnlocked(lastLessonInUnit, userProgress) {
  if (!userProgress || userProgress.length === 0) {
    return false;
  }
  
  // Check if the last lesson in the unit is completed with score >= 50
  const lastLessonProgress = userProgress.find(p => p.lesson_id === lastLessonInUnit);
  
  return lastLessonProgress?.is_completed && (lastLessonProgress?.best_score || 0) >= 50;
}

/**
 * Get lock message based on why a lesson/quiz is locked
 * @param {string} type - 'lesson' or 'quiz'
 * @param {number} id - The lesson/quiz ID
 * @param {Array} userProgress - Array of user_lesson records
 * @returns {string} - Helpful message explaining why it's locked
 */
export function getLockMessage(type, id, userProgress) {
  if (type === 'lesson') {
    const previousLessonId = id - 1;
    const previousProgress = userProgress?.find(p => p.lesson_id === previousLessonId);
    
    if (!previousProgress?.is_completed) {
      return `Complete Lesson ${previousLessonId} to unlock this lesson!`;
    }
    
    if ((previousProgress?.best_score || 0) < 50) {
      return `Score at least 50 points in Lesson ${previousLessonId} to unlock this lesson!`;
    }
    
    return 'This lesson is locked.';
  }
  
  if (type === 'quiz') {
    // Determine which unit this quiz belongs to
    let lastLessonInUnit;
    if (id === 'quiz1') lastLessonInUnit = 4;
    else if (id === 'quiz2') lastLessonInUnit = 8;
    else if (id === 'quiz3') lastLessonInUnit = 12;
    else return 'This quiz is locked.';
    
    const lastLessonProgress = userProgress?.find(p => p.lesson_id === lastLessonInUnit);
    
    if (!lastLessonProgress?.is_completed) {
      return `Complete Lesson ${lastLessonInUnit} to unlock this quiz!`;
    }
    
    if ((lastLessonProgress?.best_score || 0) < 50) {
      return `Score at least 50 points in Lesson ${lastLessonInUnit} to unlock this quiz!`;
    }
    
    return 'This quiz is locked.';
  }
  
  return 'This content is locked.';
}

/**
 * Calculate completion percentage for overall progress
 * @param {Array} userProgress - Array of user_lesson records
 * @param {number} totalLessons - Total number of lessons (default 12)
 * @returns {number} - Completion percentage (0-100)
 */
export function calculateOverallProgress(userProgress, totalLessons = 12) {
  if (!userProgress || userProgress.length === 0) {
    return 0;
  }
  
  const completedLessons = userProgress.filter(p => p.is_completed).length;
  return Math.round((completedLessons / totalLessons) * 100);
}

/**
 * Get the next recommended lesson for a user
 * @param {Array} userProgress - Array of user_lesson records
 * @returns {number|null} - Next lesson ID or null if all completed
 */
export function getNextRecommendedLesson(userProgress) {
  const highestUnlocked = getHighestUnlockedLesson(userProgress);
  
  // Find the first incomplete lesson that's unlocked
  for (let lessonId = 1; lessonId <= highestUnlocked && lessonId <= 12; lessonId++) {
    const progress = userProgress?.find(p => p.lesson_id === lessonId);
    if (!progress?.is_completed) {
      return lessonId;
    }
  }
  
  // All unlocked lessons are completed
  if (highestUnlocked <= 12) {
    return highestUnlocked; // Return the next locked lesson
  }
  
  return null; // All lessons completed
}