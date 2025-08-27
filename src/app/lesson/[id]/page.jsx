// /app/lesson/[id]/page.jsx - FIXED VERSION
"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLessonById } from '../../data/lessons';  // Fixed: Added one more ../

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id;
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('LessonPage - lessonId:', lessonId);
    
    try {
      // Get lesson data
      const lesson = getLessonById(lessonId);
      console.log('Found lesson:', lesson);
      
      if (!lesson) {
        console.log('No lesson found, redirecting to home');
        // Lesson not found, redirect to home
        router.push('/');
        return;
      }

      // Auto-redirect to first activity
      const firstActivity = lesson.activities[0];
      console.log('Redirecting to first activity:', firstActivity);
      router.push(`/lesson/${lessonId}/${firstActivity}`);
    } catch (err) {
      console.error('Error in LessonPage:', err);
      setError(err.message);
    }
  }, [lessonId, router]);

  // Show error if there's an issue
  if (error) {
    return (
      <div className="min-h-screen bg-sky-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">Error: {error}</p>
          <p className="text-sm text-gray-500">Lesson ID: {lessonId}</p>
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

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading lesson...</p>
        <p className="text-sm text-gray-500">Lesson ID: {lessonId}</p>
      </div>
    </div>
  );
}