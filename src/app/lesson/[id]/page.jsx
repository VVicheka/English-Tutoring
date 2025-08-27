// /app/lesson/[id]/page.jsx
"use client";
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLessonById } from '../../data/lessons';

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id;
  const [error, setError] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    console.log('LessonPage - lessonId:', lessonId);
    
    // Don't run if we're already redirecting
    if (isRedirecting) return;
    
    try {
      // Get lesson data
      const lesson = getLessonById(lessonId);
      console.log('Found lesson:', lesson);
      
      if (!lesson) {
        console.log('No lesson found, redirecting to home');
        setError('Lesson not found');
        setTimeout(() => router.push('/'), 2000);
        return;
      }

      // Get expanded activities (same logic as in ActivityPage)
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

      const expandedActivities = getExpandedActivities(lesson);
      
      // Auto-redirect to first activity
      const firstActivity = expandedActivities[0];
      console.log('Redirecting to first activity:', firstActivity);
      console.log('Expanded activities:', expandedActivities);
      
      setIsRedirecting(true);
      router.push(`/lesson/${lessonId}/${firstActivity}`);
      
    } catch (err) {
      console.error('Error in LessonPage:', err);
      setError(err.message);
    }
  }, [lessonId, router, isRedirecting]);

  // Show error if there's an issue
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">Lesson ID: {lessonId}</p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
          >
            🏠 Go Home
          </button>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Lesson...</h2>
        <p className="text-gray-600 mb-4">Getting everything ready for you!</p>
        <p className="text-sm text-gray-500">Lesson ID: {lessonId}</p>
        
        <div className="mt-6 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
}