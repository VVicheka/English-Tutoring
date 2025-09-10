// Modified StoryActivity in ActivityComponents.jsx
import { useState, useEffect } from 'react';
import { useTextToSpeech } from './useTextToSpeech';

export const MiniStoryActivity = ({ content, storyPage = 0, onStoryPageChange }) => {
  const { speak, isSpeaking } = useTextToSpeech();
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  // Auto-read current sentence when page changes
  useEffect(() => {
    if (!hasAutoPlayed && content.sentences && content.sentences[storyPage]) {
      const timer = setTimeout(() => {
        try {
          speak(content.sentences[storyPage].text, {
            rate: 0.8,
            pitch: 1.1,
            volume: 1.0
          });
          setHasAutoPlayed(true);
        } catch (err) {
          console.warn('Auto-read failed:', err);
          setHasAutoPlayed(true);
        }
      }, 1000); // 1 second delay for better UX

      return () => clearTimeout(timer);
    }
  }, [storyPage, hasAutoPlayed, content.sentences, speak]);

  // Reset auto-played when story page changes
  useEffect(() => {
    setHasAutoPlayed(false);
  }, [storyPage]);

  if (!content.sentences || content.sentences.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">No story content available</p>
        </div>
      </div>
    );
  }

  if (!content.sentences[storyPage]) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Story page not found</p>
          <p className="text-sm text-gray-500">
            Page {storyPage + 1} of {content.sentences.length}
          </p>
        </div>
      </div>
    );
  }

  const currentSentence = content.sentences[storyPage];
  const totalPages = content.sentences.length;

  const handleSentenceClick = () => {
    speak(currentSentence.text, {
      rate: 0.8,
      pitch: 1.1
    });
  };

  return (
    <div className="h-full flex items-center justify-center">
      <div>
        
        {/* Story Title with Page Number */}
        <h2 className="text-center text-2xl font-bold text-purple-800 mb-2">
          {content.title}
          <span className="text-lg font-normal text-gray-500 block mt-1">
            Page {storyPage + 1} of {totalPages}
          </span>
        </h2>
        
        {/* Main Content Area */}
        <div className="flex flex-col items-center">
          
          {/* Image Space - Blank for now */}
          <div className="w-full max-w-md h-48 md:h-64 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">🖼️</div>
              <p className="text-sm">Image space for page {storyPage + 1}</p>
            </div>
          </div>
          
          {/* Sentence Text */}
          <div 
            className="text-center cursor-pointer hover:bg-blue-50 rounded-lg p-6 transition-all duration-200 w-full"
            onClick={handleSentenceClick}
          >
            <p className={`text-xl md:text-2xl text-gray-800 leading-relaxed font-medium ${
              isSpeaking ? 'text-blue-600 animate-pulse' : ''
            }`}>
              {typeof currentSentence === 'string' ? currentSentence : (currentSentence.text || currentSentence)}
            </p>
            
            <div className="flex items-center justify-center space-x-2 mt-4">
              <span className={`text-2xl ${isSpeaking ? 'animate-bounce' : ''}`}>
                {isSpeaking ? '🔊' : '🔈'}
              </span>
              <span className="text-sm text-gray-500">
                {isSpeaking ? 'Reading...' : 'Click to hear again'}
              </span>
            </div>
          </div>
          
        </div>
        
        {/* Page Progress Dots */}
        <div className="mt-8 flex justify-center items-center space-x-2">
          {content.sentences.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === storyPage 
                  ? 'bg-blue-500 scale-110' 
                  : index < storyPage 
                    ? 'bg-green-400' 
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
      </div>
    </div>
  );
};