"use client";
import { useRouter, useParams } from 'next/navigation';

export default function LessonCompletePage() {
  const router = useRouter();
  const { id: lessonId } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-2xl">
        <div className="text-8xl mb-6 animate-bounce">🎉</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Lesson Complete!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Congratulations! You've successfully completed Lesson {lessonId}. 
          You're making amazing progress in your English learning journey!
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <span>🏠</span>
            <span>Back to Home</span>
          </button>
          
          <button
            onClick={() => {
              const nextLessonId = parseInt(lessonId) + 1;
              router.push(`/lesson/${nextLessonId}`);
            }}
            className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <span>📚</span>
            <span>Next Lesson</span>
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full">
            <span>⭐</span>
            <span className="text-yellow-700 font-medium">Lesson {lessonId} Completed</span>
            <span>⭐</span>
          </div>
        </div>
      </div>
    </div>
  );
}