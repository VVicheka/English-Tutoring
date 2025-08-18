// Updated ActivityComponents.jsx - No WrapUp, Practice is only Matching
import { useState, useEffect } from 'react';
import { useTextToSpeech } from './useTextToSpeech';
import { 
  SpeakableWord, 
  SpeakableSentence, 
  SpeakableChant, 
  SpeakableStory 
} from './SpeakableComponents';
import { DragableMatchingActivity } from './DragableMatchingActivity';
import { LetterConnectionActivity } from './LetterConnectionActivity';
import { CreativeQuizActivity } from './CreativeQuizActivity';

// Fixed WarmUp Activity
export const WarmUpActivity = ({ content, autoRead = false }) => {
  const { speak, isSpeaking, isSupported } = useTextToSpeech();
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  // Auto-read FULL CHANT when component mounts - ONLY ONCE
  useEffect(() => {
    if (autoRead && isSupported && !hasAutoPlayed && content?.chant) {
      const timer = setTimeout(() => {
        try {
          // Read the FULL chant sentence
          speak(content.chant, {
            rate: 0.8,     // Slightly slower for clarity
            pitch: 1.2,    // Higher pitch for children
            volume: 1.0
          });
          setHasAutoPlayed(true); // Mark as played, won't play again
        } catch (err) {
          console.warn('Auto-read failed:', err);
          setHasAutoPlayed(true); // Still mark as attempted
        }
      }, 1500); // 1.5 second delay

      return () => clearTimeout(timer);
    }
  }, [autoRead, isSupported, hasAutoPlayed, content?.chant, speak]);

  const handleChantClick = () => {
    if (content?.chant) {
      speak(content.chant, {
        rate: 0.8,
        pitch: 1.2
      });
    }
  };

  const handleDirectionClick = () => {
    if (content?.direction) {
      speak(content.direction, {
        rate: 0.8,
        pitch: 1.0
      });
    }
  };

  // Safety check for content
  if (!content) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading warm-up content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{content.title}</h2>
          
          {/* Main Chant */}
          <div 
            className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 md:p-8 cursor-pointer hover:bg-yellow-100 transition-all duration-200 mb-6"
            onClick={handleChantClick}
          >
            <p className={`text-xl md:text-2xl font-semibold mb-4 ${isSpeaking ? 'text-green-600 animate-pulse' : 'text-gray-700'}`}>
              "{content.chant}"
            </p>
            
            <div className="flex items-center justify-center space-x-2">
              <span className={`text-2xl ${isSpeaking ? 'animate-bounce' : ''}`}>
                {isSpeaking ? '🔊' : '🔈'}
              </span>
              <span className="text-base md:text-lg text-yellow-600">
                {isSpeaking ? 'Reading chant...' : 'Click to hear again'}
              </span>
            </div>
          </div>
          
          {/* Direction */}
          <div 
            className="cursor-pointer hover:text-blue-600 transition-colors duration-200"
            onClick={handleDirectionClick}
          >
            <p className="text-lg md:text-xl text-gray-600 italic">
              {content.direction}
              <span className="ml-3 text-lg">🔈</span>
            </p>
          </div>
          
          {/* Status Messages */}
          <div className="mt-6">
            {autoRead && hasAutoPlayed && (
              <div className="text-sm text-green-600">
                ✨ Welcome! The chant was read automatically
              </div>
            )}
            {autoRead && !isSupported && (
              <div className="text-sm text-orange-600">
                ⚠️ Speech not supported - click the chant to try reading it
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Vocabulary Activity - Fixed layout
export const VocabularyActivity = ({ content }) => (
  <div className="h-full flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-6xl max-h-full overflow-y-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">{content.title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {content.words.map((wordItem, index) => (
          <SpeakableWord
            key={index}
            word={wordItem.word}
            emoji={wordItem.emoji}
            instruction={wordItem.instruction}
            className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 md:p-6 text-center"
          />
        ))}
      </div>
    </div>
  </div>
);

// Story Activity - Fixed layout
export const StoryActivity = ({ content }) => (
  <div className="h-full flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-5xl max-h-full overflow-y-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">{content.title}</h2>
      <SpeakableStory 
        sentences={content.sentences}
        encouragement={content.encouragement}
      />
    </div>
  </div>
);

// Practice Activity - ONLY MATCHING (no tabs needed)
export const PracticeActivity = ({ content }) => {
  return (
    <div className="h-full">
      <DragableMatchingActivity content={content} />
    </div>
  );
};

// Fill-in Words Activity - NEW separate activity
export const FillWordsActivity = ({ content }) => {
  return (
    <div className="h-full">
      <LetterConnectionActivity content={content} />
    </div>
  );
};

// Quiz Activity - Fixed layout
export const QuizActivity = ({ content }) => {
  const { speak } = useTextToSpeech();

  if (content.type === 'multiple-choice') {
    // Checkpoint Quiz - Better layout
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-5xl max-h-full overflow-y-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">{content.title}</h2>
          
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <SpeakableSentence 
              sentence={content.instruction}
              className="text-red-600 mb-6 italic text-center text-lg"
            />
            
            <div className="space-y-4 md:space-y-6">
              {content.questions.map((question, index) => (
                <div key={index} className="bg-white border border-red-300 rounded-lg p-4">
                  <SpeakableSentence 
                    sentence={`${index + 1}. ${question.question}`}
                    className="text-base md:text-lg font-semibold mb-3"
                  />
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name={`question-${index}`} value={option} className="text-red-500" />
                        <span 
                          className={`cursor-pointer hover:text-blue-600 text-sm md:text-base ${optionIndex === question.correctIndex ? 'font-semibold text-green-600' : ''}`}
                          onClick={() => speak(option, { rate: 0.8 })}
                        >
                          {option} 🔈
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // Character Matching Quiz - Use creative format
    return <CreativeQuizActivity content={content} />;
  }
};