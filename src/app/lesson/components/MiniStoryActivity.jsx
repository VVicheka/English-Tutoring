// MiniStoryActivity - Cohesive Design Matching Main Story Activity
import { useState, useEffect } from 'react';
import { useTextToSpeech } from './useTextToSpeech';

// Design system constants
const DESIGN = {
  colors: {
    bg: 'from-purple-100 via-pink-100 to-rose-100',
    header: 'from-purple-400 to-pink-400',
    card: 'bg-white',
  },
  spacing: {
    container: 'p-4',
    card: 'p-6',
    compact: 'p-3',
  },
  shadows: {
    card: 'shadow-lg',
    button: 'shadow-md hover:shadow-lg',
  },
  transitions: 'transition-all duration-300',
};

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
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-lg text-gray-600">No story content available</p>
        </div>
      </div>
    );
  }

  if (!content.sentences[storyPage]) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-lg text-gray-600">Story page not found</p>
          <p className="text-sm text-gray-500 mt-2">
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
    <div className={`h-full bg-gradient-to-br ${DESIGN.colors.bg} rounded-2xl ${DESIGN.shadows.card} overflow-hidden flex flex-col`}>
      {/* Compact Header */}
      <div className={`flex-shrink-0 bg-gradient-to-r ${DESIGN.colors.header} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📚</span>
          <h2 className="text-lg font-black text-white">{content.title}</h2>
        </div>
        <div className="bg-white bg-opacity-90 rounded-full px-3 py-1">
          <span className="text-xs font-bold text-purple-600">{storyPage + 1} / {totalPages}</span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 min-h-0">
        
        {/* Image Space - Much larger image */}
        <div className="flex-1 mb-4 min-h-0">
          <div className={`relative h-full ${DESIGN.colors.card} rounded-2xl ${DESIGN.shadows.card} overflow-hidden border-4 border-white`}>
            {!imageError[storyPage] ? (
              <img 
                src={getImagePath(storyPage)}
                alt={`Story illustration for page ${storyPage + 1}`}
                className="w-full h-full object-contain p-4"
                onError={() => handleImageError(storyPage)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="text-center p-4">
                  <div className="text-5xl mb-3 animate-bounce">📖</div>
                  <div className="bg-white rounded-lg px-4 py-2 shadow-md">
                    <p className="text-gray-600 font-medium text-sm">Story Image {storyPage + 1}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-4 h-4 bg-yellow-400 rounded-full"></div>
            <div className="absolute top-2 right-2 w-4 h-4 bg-pink-400 rounded-full"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 bg-purple-400 rounded-full"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-blue-400 rounded-full"></div>
          </div>
        </div>
        
        {/* Sentence Text with Click to Hear - Compact */}
        <div className="flex-shrink-0">
          <div 
            onClick={handleSentenceClick}
            className={`${DESIGN.colors.card} rounded-xl ${DESIGN.spacing.card} cursor-pointer ${DESIGN.transitions} transform hover:scale-102 ${
              isSpeaking ? DESIGN.shadows.card + ' ring-4 ring-green-400' : DESIGN.shadows.card
            }`}
          >
            <p className={`text-lg text-center font-medium text-gray-800 mb-3 leading-relaxed ${
              isSpeaking ? 'text-green-600' : ''
            }`}>
              {typeof currentSentence === 'string' ? currentSentence : (currentSentence.text || currentSentence)}
            </p>
            
            <div className="flex justify-center">
              <button 
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm ${DESIGN.transitions} ${DESIGN.shadows.button} ${
                  isSpeaking ? 'bg-green-500 text-white' : 'bg-blue-50 text-gray-700 hover:bg-blue-100'
                }`}
              >
                <span className={isSpeaking ? 'animate-pulse' : ''}>{isSpeaking ? '🔊' : '🔈'}</span>
                <span>{isSpeaking ? 'Playing...' : 'Click to hear'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer with Progress Dots */}
      <div className="flex-shrink-0 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-3 flex justify-center items-center space-x-2">
        {content.sentences.map((_, index) => (
          <div
            key={index}
            onClick={() => onStoryPageChange && onStoryPageChange(index)}
            className={`rounded-full cursor-pointer ${DESIGN.transitions} ${
              index === storyPage 
                ? 'w-8 h-3 bg-purple-500' 
                : index < storyPage 
                  ? 'w-3 h-3 bg-green-400 hover:scale-125' 
                  : 'w-3 h-3 bg-gray-300 hover:scale-125'
            }`}
          />
        ))}
      </div>
    </div>
  );
};