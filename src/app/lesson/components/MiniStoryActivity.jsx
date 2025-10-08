// Container-fitted MiniStoryActivity with image integration
import { useState, useEffect } from 'react';
import { useTextToSpeech } from './useTextToSpeech';

export const MiniStoryActivity = ({ content, storyPage = 0, onStoryPageChange }) => {
  const { speak, isSpeaking } = useTextToSpeech();
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [imageError, setImageError] = useState({});

  // Auto-read current sentence when page changes
  useEffect(() => {
    if (!hasAutoPlayed && content.sentences && content.sentences[storyPage]) {
      const timer = setTimeout(() => {
        try {
          speak(content.sentences[storyPage].text || content.sentences[storyPage], {
            rate: 0.8,
            pitch: 1.1,
            volume: 1.0
          });
          setHasAutoPlayed(true);
        } catch (err) {
          console.warn('Auto-read failed:', err);
          setHasAutoPlayed(true);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [storyPage, hasAutoPlayed, content.sentences, speak]);

  // Reset auto-played when story page changes
  useEffect(() => {
    setHasAutoPlayed(false);
    setImageError(prev => ({ ...prev, [storyPage]: false }));
  }, [storyPage]);

  if (!content.sentences || content.sentences.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-md">
        <div className="text-center">
          <p className="text-lg text-gray-600">No story content available</p>
        </div>
      </div>
    );
  }

  if (!content.sentences[storyPage]) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-lg shadow-md">
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

  // Generate image path for current page
  const getImagePath = (pageIndex) => {
    return `/mini${content.id || 1}-${pageIndex}.svg`;
  };

  const handleSentenceClick = () => {
    const text = typeof currentSentence === 'string' ? currentSentence : (currentSentence.text || currentSentence);
    speak(text, {
      rate: 0.8,
      pitch: 1.1
    });
  };

  const handleImageError = (pageIndex) => {
    setImageError(prev => ({ ...prev, [pageIndex]: true }));
  };

  return (
    <div className="h-full bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      {/* Compact Header - Fixed height */}
      <div className="bg-purple-50 border-b px-3 py-2 flex-shrink-0">
        <h2 className="text-center text-lg font-bold text-purple-800">
          {content.title}
        </h2>
        <div className="text-center text-sm text-gray-500 mt-1">
          Page {storyPage + 1} of {totalPages}
        </div>
      </div>
      
      {/* Main Content - Uses available space */}
      <div className="flex-1 flex flex-col p-3 min-h-0">
        
        {/* Image Space - Larger image size */}
        <div className="w-full max-w-md mx-auto h-40 md:h-48 lg:h-56 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center overflow-hidden mb-4 flex-shrink-0">
          {!imageError[storyPage] ? (
            <img 
              src={getImagePath(storyPage)}
              alt={`Story illustration for page ${storyPage + 1}`}
              className="w-full h-full object-contain rounded-lg"
              onError={() => handleImageError(storyPage)}
              onLoad={() => console.log(`Image loaded: ${getImagePath(storyPage)}`)}
            />
          ) : (
            <div className="text-center text-gray-400">
              <div className="text-3xl mb-1">📖</div>
              <p className="text-xs">Story image {storyPage + 1}</p>
            </div>
          )}
        </div>
        
        {/* Sentence Text - Takes remaining space */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div 
            className="text-center cursor-pointer hover:bg-blue-50 rounded-lg p-3 transition-all duration-200 w-full"
            onClick={handleSentenceClick}
          >
            <p className={`text-base md:text-lg text-gray-800 leading-relaxed font-medium ${
              isSpeaking ? 'text-blue-600 animate-pulse' : ''
            }`}>
              {typeof currentSentence === 'string' ? currentSentence : (currentSentence.text || currentSentence)}
            </p>
            
            <div className="flex items-center justify-center space-x-2 mt-3">
              <span className={`text-xl ${isSpeaking ? 'animate-bounce' : ''}`}>
                {isSpeaking ? '🔊' : '🔈'}
              </span>
              <span className="text-sm text-gray-500">
                {isSpeaking ? 'Reading...' : 'Click to hear'}
              </span>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Footer with Progress Dots - Fixed height */}
      <div className="bg-gray-50 px-3 py-2 border-t flex-shrink-0">
        <div className="flex justify-center items-center space-x-2">
          {content.sentences.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                index === storyPage 
                  ? 'bg-blue-500 scale-125' 
                  : index < storyPage 
                    ? 'bg-green-400' 
                    : 'bg-gray-300'
              }`}
              onClick={() => onStoryPageChange && onStoryPageChange(index)}
            />
          ))}
        </div>
        
        {/* Debug info - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-center text-xs text-gray-400 mt-1">
            <p>Image: {getImagePath(storyPage)} | ID: {content.id || 'undefined'}</p>
          </div>
        )}
      </div>
    </div>
  );
};