// /app/lesson/[id]/page.jsx
"use client";
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLessonById } from '../../data/lessons';

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id;

  useEffect(() => {
    // Get lesson data
    const lesson = getLessonById(lessonId);
    
    if (!lesson) {
      // Lesson not found, redirect to home
      router.push('/');
      return;
    }

    // Auto-redirect to first activity
    const firstActivity = lesson.activities[0];
    router.push(`/lesson/${lessonId}/${firstActivity}`);
  }, [lessonId, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading lesson...</p>
      </div>
    </div>
  );
}