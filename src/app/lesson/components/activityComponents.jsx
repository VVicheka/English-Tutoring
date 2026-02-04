// activityComponents.jsx - Cohesive, Child-Friendly Design System
"use client";
import { useState, useEffect } from 'react';
import { useTextToSpeech } from './useTextToSpeech';
import { DragableMatchingActivity } from './DragableMatchingActivity';
import { LetterConnectionActivity } from './LetterConnectionActivity';
import { CreativeQuizActivity } from './CreativeQuizActivity';

// ==================== SHARED DESIGN SYSTEM ====================
// Cohesive styles used across all activities
const DESIGN_SYSTEM = {
  // Color palette - bright, playful, consistent
  colors: {
    warmup: 'from-amber-100 via-orange-100 to-yellow-100',
    vocabulary: 'from-blue-100 via-cyan-100 to-teal-100',
    story: 'from-purple-100 via-pink-100 to-rose-100',
    matching: 'from-violet-100 via-fuchsia-100 to-pink-100',
    fillwords: 'from-orange-100 via-amber-100 to-yellow-100',
    quiz: 'from-emerald-100 via-green-100 to-lime-100',
  },
  // Consistent spacing
  spacing: {
    container: 'p-4 md:p-6',
    card: 'p-6 md:p-8',
    compact: 'p-3 md:p-4',
  },
  // Unified shadows
  shadows: {
    card: 'shadow-lg hover:shadow-xl',
    button: 'shadow-md hover:shadow-lg',
    soft: 'shadow-sm',
  },
  // Border styles
  borders: {
    thick: 'border-4',
    medium: 'border-2',
    thin: 'border',
  },
  // Animation speeds
  transitions: {
    fast: 'transition-all duration-200',
    normal: 'transition-all duration-300',
    slow: 'transition-all duration-500',
  }
};

// Shared Components
const ActivityHeader = ({ title, emoji, gradient, children }) => (
  <div className="flex-shrink-0 mb-6">
    <div className={`bg-gradient-to-r ${gradient} rounded-2xl ${DESIGN_SYSTEM.spacing.card} ${DESIGN_SYSTEM.shadows.card} border-4 border-white`}>
      <div className="flex items-center justify-center space-x-3 mb-2">
        <span className="text-4xl animate-bounce">{emoji}</span>
        <h2 className="text-2xl md:text-3xl font-black text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  </div>
);

const SpeakerButton = ({ isSpeaking, onClick, label = "Click to hear" }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm ${DESIGN_SYSTEM.transitions.normal} ${DESIGN_SYSTEM.shadows.button} ${
      isSpeaking 
        ? 'bg-green-500 text-white scale-105' 
        : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-105'
    }`}
  >
    <span className={`text-xl ${isSpeaking ? 'animate-pulse' : ''}`}>
      {isSpeaking ? '🔊' : '🔈'}
    </span>
    <span>{isSpeaking ? 'Playing...' : label}</span>
  </button>
);

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping"></div>
        <div className="relative rounded-full w-20 h-20 border-4 border-blue-500 border-t-transparent animate-spin flex items-center justify-center">
          <span className="text-3xl">📚</span>
        </div>
      </div>
      <p className="text-lg font-semibold text-gray-700">{message}</p>
    </div>
  </div>
);

// ==================== WARM UP ACTIVITY ====================
export const WarmUpActivity = ({ content, autoRead = false }) => {
  const { speak, isSpeaking, isSupported } = useTextToSpeech();
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);

  useEffect(() => {
    if (autoRead && isSupported && !hasAutoPlayed && content?.chant) {
      const timer = setTimeout(() => {
        try {
          speak(content.chant, { rate: 0.8, pitch: 1.2, volume: 1.0 });
          setHasAutoPlayed(true);
        } catch (err) {
          console.warn('Auto-read failed:', err);
          setHasAutoPlayed(true);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [autoRead, isSupported, hasAutoPlayed, content?.chant, speak]);

  const handleChantClick = () => {
    if (content?.chant) {
      speak(content.chant, { rate: 0.8, pitch: 1.2 });
    }
  };

  if (!content) return <LoadingSpinner message="Loading warm-up..." />;

  return (
    <div className={`h-full flex items-center justify-center bg-gradient-to-br ${DESIGN_SYSTEM.colors.warmup} ${DESIGN_SYSTEM.spacing.container}`}>
      <div className="w-full max-w-4xl">
        <ActivityHeader 
          title={content.title} 
          emoji="🌅" 
          gradient="from-orange-400 to-amber-400"
        >
          <p className="text-center text-gray-700 font-medium">{content.direction}</p>
        </ActivityHeader>
        
        {/* Main Chant Card */}
        <div 
          onClick={handleChantClick}
          className={`relative bg-white rounded-3xl ${DESIGN_SYSTEM.spacing.card} cursor-pointer ${DESIGN_SYSTEM.transitions.normal} transform hover:scale-102 ${
            isSpeaking ? DESIGN_SYSTEM.shadows.card + ' scale-102 ring-4 ring-green-400' : DESIGN_SYSTEM.shadows.card
          }`}
        >
          {/* Decorative corners */}
          <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full"></div>
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full"></div>
          <div className="absolute -bottom-3 -left-3 w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-full"></div>
          <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br from-red-400 to-pink-400 rounded-full"></div>
          
          <div className="relative z-10">
            <p className="text-2xl md:text-4xl font-bold text-center text-gray-800 leading-relaxed mb-6">
              {content.chant}
            </p>
            
            <div className="flex justify-center">
              <SpeakerButton isSpeaking={isSpeaking} onClick={handleChantClick} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== VOCABULARY ACTIVITY ====================
const VocabularyCard = ({ word, emoji, index }) => {
  const { speak, isSpeaking } = useTextToSpeech();

  const handleClick = () => {
    speak(word, { rate: 0.7, pitch: 1.2 });
  };

  return (
    <div 
      onClick={handleClick}
      className={`cursor-pointer ${DESIGN_SYSTEM.transitions.normal} transform hover:scale-110 hover:rotate-2`}
      style={{
        animation: 'fadeInUp 0.5s ease-out forwards',
        animationDelay: `${index * 0.1}s`,
        opacity: 0,
      }}
    >
      <div className={`relative bg-white rounded-2xl ${DESIGN_SYSTEM.spacing.card} h-full ${
        isSpeaking ? DESIGN_SYSTEM.shadows.card + ' ring-4 ring-green-400 scale-105' : DESIGN_SYSTEM.shadows.card
      }`}>
        {/* Emoji with glow effect */}
        <div className={`text-6xl md:text-7xl text-center mb-4 ${isSpeaking ? 'animate-bounce' : ''}`}>
          {emoji}
        </div>
        
        {/* Word */}
        <h3 className="text-2xl md:text-3xl font-black text-center mb-4 text-gray-800">
          {word}
        </h3>
        
        {/* Audio indicator */}
        <div className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-full ${
          isSpeaking ? 'bg-green-100' : 'bg-blue-50'
        }`}>
          <span className="text-lg">{isSpeaking ? '🔊' : '🔈'}</span>
          <span className="text-xs font-bold text-gray-700">
            {isSpeaking ? 'Speaking...' : 'Tap to hear'}
          </span>
        </div>

        {/* Corner accent */}
        <div className="absolute top-2 right-2 w-4 h-4 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full"></div>
      </div>
    </div>
  );
};

export const VocabularyActivity = ({ content }) => {
  if (!content || !content.words) return <LoadingSpinner message="Loading vocabulary..." />;

  return (
    <div className={`h-full flex flex-col bg-gradient-to-br ${DESIGN_SYSTEM.colors.vocabulary} ${DESIGN_SYSTEM.spacing.container}`}>
      <ActivityHeader 
        title={content.title} 
        emoji="📖" 
        gradient="from-blue-400 to-cyan-400"
      >
        <p className="text-center text-gray-700 font-medium">Click on any word to hear it!</p>
      </ActivityHeader>

      {/* Words Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {content.words.map((wordItem, index) => (
            <VocabularyCard
              key={index}
              word={wordItem.word}
              emoji={wordItem.emoji}
              index={index}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// ==================== STORY ACTIVITY ====================
export const StoryActivity = ({ content, storyPage = 0, onStoryPageChange }) => {
  const { speak, isSpeaking } = useTextToSpeech();
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [imageError, setImageError] = useState({});

  useEffect(() => {
    if (!hasAutoPlayed && content.sentences && content.sentences[storyPage]) {
      const timer = setTimeout(() => {
        try {
          speak(content.sentences[storyPage].text || content.sentences[storyPage], {
            rate: 0.8, pitch: 1.1, volume: 1.0
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

  useEffect(() => {
    setHasAutoPlayed(false);
    setImageError(prev => ({ ...prev, [storyPage]: false }));
  }, [storyPage]);

  if (!content.sentences || content.sentences.length === 0) {
    return <LoadingSpinner message="No story content available" />;
  }

  if (!content.sentences[storyPage]) {
    return <LoadingSpinner message="Story page not found" />;
  }

  const currentSentence = content.sentences[storyPage];
  const totalPages = content.sentences.length;

  const getImagePath = (pageIndex) => {
    return `/mini${content.id || 1}-${pageIndex}.svg`;
  };

  const handleSentenceClick = () => {
    const text = typeof currentSentence === 'string' ? currentSentence : (currentSentence.text || currentSentence);
    speak(text, { rate: 0.8, pitch: 1.1 });
  };

  const handleImageError = (pageIndex) => {
    setImageError(prev => ({ ...prev, [pageIndex]: true }));
  };

  return (
    <div className={`h-full flex flex-col bg-gradient-to-br ${DESIGN_SYSTEM.colors.story} rounded-2xl overflow-hidden`}>
      {/* Compact Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-purple-400 to-pink-400 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📚</span>
          <h2 className="text-xl font-black text-white">{content.title}</h2>
        </div>
        <div className="bg-white bg-opacity-90 rounded-full px-4 py-1">
          <span className="text-sm font-bold text-purple-600">{storyPage + 1} / {totalPages}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 md:p-6 min-h-0">
        {/* Image Container */}
        <div className="flex-1 mb-4 min-h-0">
          <div className={`relative h-full bg-white rounded-2xl ${DESIGN_SYSTEM.shadows.card} overflow-hidden border-4 border-white`}>
            {!imageError[storyPage] ? (
              <img 
                src={getImagePath(storyPage)}
                alt={`Story illustration for page ${storyPage + 1}`}
                className="w-full h-full object-contain p-4"
                onError={() => handleImageError(storyPage)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                <div className="text-center p-6">
                  <div className="text-6xl mb-3 animate-bounce">📖</div>
                  <div className="bg-white rounded-lg px-4 py-2 shadow-md">
                    <p className="text-gray-600 font-medium text-sm">Story Image {storyPage + 1}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-6 h-6 bg-yellow-400 rounded-full"></div>
            <div className="absolute top-2 right-2 w-6 h-6 bg-pink-400 rounded-full"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 bg-purple-400 rounded-full"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-blue-400 rounded-full"></div>
          </div>
        </div>

        {/* Sentence Card */}
        <div className="flex-shrink-0">
          <div 
            onClick={handleSentenceClick}
            className={`relative bg-white rounded-2xl ${DESIGN_SYSTEM.spacing.card} cursor-pointer ${DESIGN_SYSTEM.transitions.normal} transform hover:scale-102 ${
              isSpeaking ? DESIGN_SYSTEM.shadows.card + ' ring-4 ring-green-400' : DESIGN_SYSTEM.shadows.card
            }`}
          >
            <p className="text-lg md:text-xl text-center font-medium text-gray-800 mb-4 leading-relaxed">
              {typeof currentSentence === 'string' ? currentSentence : (currentSentence.text || currentSentence)}
            </p>
            
            <div className="flex justify-center">
              <SpeakerButton isSpeaking={isSpeaking} onClick={handleSentenceClick} />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex-shrink-0 bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 flex justify-center items-center space-x-2">
        {content.sentences.map((_, index) => (
          <button
            key={index}
            onClick={() => onStoryPageChange && onStoryPageChange(index)}
            className={`transition-all duration-300 rounded-full ${
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

// ==================== MATCHING ACTIVITY ====================
export const MatchingActivity = ({ content, onComplete }) => {
  if (!content) return <LoadingSpinner message="Loading matching activity..." />;

  return (
    <div className="h-full">
      <DragableMatchingActivity 
        content={content} 
        onComplete={(correctCount, totalCount) => {
          if (onComplete) {
            onComplete(correctCount, totalCount);
          }
        }}
      />
    </div>
  );
};

// ==================== FILL WORDS ACTIVITY ====================
export const FillWordsActivity = ({ 
  content, 
  currentStep = 0,
  completedSteps = {},
  onStepComplete,
  onComplete 
}) => {
  if (!content || !content.activityB) {
    return <LoadingSpinner message="Loading fill words activity..." />;
  }

  return (
    <div className="h-full">
      <LetterConnectionActivity 
        content={content}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepComplete={onStepComplete}
        onComplete={onComplete}
      />
    </div>
  );
};

// ==================== QUIZ ACTIVITY ====================
export const QuizActivity = ({ 
  content,
  currentStep = 0,
  completedSteps = {},
  onStepComplete,
  onComplete 
}) => {
  const { speak } = useTextToSpeech();

  if (!content) return <LoadingSpinner message="Loading quiz..." />;

  if (content.type === 'multiple-choice') {
    const SpeakableSentence = ({ sentence, className = "" }) => {
      const { speak: speakText, isSpeaking } = useTextToSpeech();

      const handleClick = () => {
        speakText(sentence, { rate: 0.8, pitch: 1.0 });
      };

      return (
        <p 
          onClick={handleClick}
          className={`cursor-pointer hover:bg-blue-50 rounded-lg p-3 ${DESIGN_SYSTEM.transitions.normal} ${
            isSpeaking ? 'bg-blue-100 text-blue-800' : 'text-gray-700'
          } ${className}`}
        >
          {sentence}
          {isSpeaking && <span className="ml-2 text-blue-600 animate-pulse">🔊</span>}
        </p>
      );
    };

    return (
      <div className={`h-full flex items-center justify-center bg-gradient-to-br ${DESIGN_SYSTEM.colors.quiz} ${DESIGN_SYSTEM.spacing.container}`}>
        <div className="w-full max-w-5xl max-h-full overflow-y-auto">
          <ActivityHeader 
            title={content.title} 
            emoji="📝" 
            gradient="from-green-400 to-emerald-400"
          >
            <SpeakableSentence 
              sentence={content.instruction}
              className="text-center font-medium text-gray-800"
            />
          </ActivityHeader>
          
          <div className="space-y-4">
            {content.questions?.map((question, index) => (
              <div key={index} className={`bg-white rounded-2xl ${DESIGN_SYSTEM.spacing.card} ${DESIGN_SYSTEM.shadows.card} border-2 border-green-200`}>
                <SpeakableSentence 
                  sentence={`${index + 1}. ${question.question}`}
                  className="font-bold mb-4 text-lg text-gray-800"
                />
                <div className="space-y-2">
                  {question.options?.map((option, optionIndex) => (
                    <label key={optionIndex} className={`flex items-center space-x-3 cursor-pointer group ${DESIGN_SYSTEM.spacing.compact} rounded-xl hover:bg-blue-50 ${DESIGN_SYSTEM.transitions.fast}`}>
                      <input 
                        type="radio" 
                        name={`question-${index}`} 
                        value={option} 
                        className="w-5 h-5 text-green-500 focus:ring-green-500" 
                      />
                      <span 
                        onClick={() => speak(option, { rate: 0.8 })}
                        className="flex-1 cursor-pointer text-gray-700 group-hover:text-blue-600 font-medium"
                      >
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } else if (content.type === 'character-matching') {
    return (
      <CreativeQuizActivity 
        content={content}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepComplete={onStepComplete}
        onComplete={onComplete}
      />
    );
  } else {
    return <LoadingSpinner message="Unknown quiz type" />;
  }
};

// Re-export for backward compatibility
export { CreativeQuizActivity };