// DragableMatchingActivity - Cohesive Design System
"use client";
import { useState, useEffect, useMemo } from 'react';
import { useTextToSpeech } from './useTextToSpeech';
import { useAudioFeedback } from './useAudioFeedback';

// Design system constants
const DESIGN = {
  colors: {
    bg: 'from-violet-100 via-fuchsia-100 to-pink-100',
    header: 'from-violet-400 to-fuchsia-400',
    card: 'bg-white',
    dropzone: {
      correct: 'bg-green-100 border-green-400',
      wrong: 'bg-red-100 border-red-400',
      filled: 'bg-yellow-100 border-yellow-400',
      empty: 'bg-gray-50 border-gray-300',
    },
    word: {
      correct: 'bg-green-400 hover:bg-green-500',
      wrong: 'bg-red-400 hover:bg-red-500',
      used: 'bg-gray-300',
      available: 'bg-purple-400 hover:bg-purple-500',
    }
  },
  spacing: {
    container: 'p-4 md:p-6',
    card: 'p-6 md:p-8',
    compact: 'p-3 md:p-4',
  },
  shadows: {
    card: 'shadow-lg hover:shadow-xl',
    button: 'shadow-md hover:shadow-lg',
  },
  transitions: 'transition-all duration-300',
};

export const DragableMatchingActivity = ({ content, onComplete }) => {
  const { speak } = useTextToSpeech();
  const { playCorrectSound, playWrongSound } = useAudioFeedback();
  
  // Create unique storage key
  const storageKey = useMemo(() => {
    if (!content?.activityA?.pairs) return 'default-activity';
    const wordsString = content.activityA.pairs.map(p => p.word).sort().join('-');
    return `matching-activity-${wordsString}`;
  }, [content]);

  // Shuffle algorithm
  const shuffleArray = (array, seed = 42) => {
    const shuffled = [...array];
    let random = seed;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      random = (random * 9301 + 49297) % 233280;
      const j = Math.floor((random / 233280) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Create shuffled words
  const shuffledWords = useMemo(() => {
    if (!content?.activityA?.pairs) return [];
    
    const seed = content.activityA.pairs
      .map(p => p.word)
      .join('')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    return shuffleArray(content.activityA.pairs, seed);
  }, [content]);

  // State
  const [draggedWord, setDraggedWord] = useState(null);
  const [dropZones, setDropZones] = useState({});
  const [correctMatches, setCorrectMatches] = useState(new Set());
  const [wrongMatches, setWrongMatches] = useState(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [completionCalled, setCompletionCalled] = useState(false);

  // Load saved progress
  useEffect(() => {
    if (typeof window !== 'undefined' && storageKey !== 'default-activity') {
      try {
        const saved = window.matchingActivityProgress?.[storageKey];
        if (saved && typeof saved === 'object') {
          setDropZones(saved.dropZones || {});
          
          if (Array.isArray(saved.correctMatches)) {
            setCorrectMatches(new Set(saved.correctMatches));
          } else {
            setCorrectMatches(new Set());
          }

          if (Array.isArray(saved.wrongMatches)) {
            setWrongMatches(new Set(saved.wrongMatches));
          } else {
            setWrongMatches(new Set());
          }
          
          if (saved.completionCalled) {
            setCompletionCalled(true);
          }
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
    setHasLoaded(true);
  }, [storageKey]);

  // Save progress
  useEffect(() => {
    if (!hasLoaded || !content?.activityA?.pairs) return;
    
    try {
      const progressData = { 
        dropZones, 
        correctMatches: Array.from(correctMatches), 
        wrongMatches: Array.from(wrongMatches),
        completionCalled
      };
      
      if (typeof window !== 'undefined') {
        if (!window.matchingActivityProgress) {
          window.matchingActivityProgress = {};
        }
        window.matchingActivityProgress[storageKey] = progressData;
      }

      const totalWords = content.activityA.pairs.length;
      const attemptedWords = new Set([...Object.keys(dropZones)]);
      const allWordsAttempted = attemptedWords.size === totalWords;
      const allCorrect = correctMatches.size === totalWords;
      
      if (allCorrect !== isCompleted) {
        setIsCompleted(allCorrect);
        
        if (allCorrect && !isCompleted) {
          setTimeout(() => {
            playCorrectSound();
            setTimeout(() => {
              speak("Excellent! You completed the matching activity perfectly!", { rate: 0.8, pitch: 1.3 });
            }, 400);
          }, 500);
        }
      }

      if (allWordsAttempted && !completionCalled && onComplete) {
        setCompletionCalled(true);
        
        setTimeout(() => {
          onComplete(correctMatches.size, totalWords);
        }, allCorrect ? 2000 : 1000);
      }
      
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [dropZones, correctMatches, wrongMatches, storageKey, content, isCompleted, hasLoaded, speak, onComplete, completionCalled]);

  // Drag handlers
  const handleDragStart = (e, word) => {
    if (isCompleted && correctMatches.size === content.activityA.pairs.length) {
      e.preventDefault();
      return;
    }
    
    setDraggedWord(word);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', word);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetEmoji) => {
    e.preventDefault();
    
    if (!draggedWord) return;

    const correctPair = content.activityA.pairs.find(pair => pair.emoji === targetEmoji);
    const isCorrect = correctPair && correctPair.word === draggedWord;

    setDropZones(prev => ({
      ...prev,
      [targetEmoji]: draggedWord
    }));

    if (isCorrect) {
      setCorrectMatches(prev => new Set([...prev, targetEmoji]));
      setWrongMatches(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetEmoji);
        return newSet;
      });
      
      playCorrectSound();
      setTimeout(() => {
        speak(draggedWord, { rate: 0.7, pitch: 1.2 });
      }, 300);
      
    } else {
      setWrongMatches(prev => new Set([...prev, targetEmoji]));
      setCorrectMatches(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetEmoji);
        return newSet;
      });
      
      playWrongSound();
    }

    setDraggedWord(null);
  };

  const handleWordClick = (word) => {
    speak(word, { rate: 0.7, pitch: 1.2 });
  };

  const handleImageClick = (emoji) => {
    const correctPair = content.activityA.pairs.find(pair => pair.emoji === emoji);
    if (correctPair) {
      speak(correctPair.word, { rate: 0.7, pitch: 1.2 });
    }
  };

  // Loading state
  if (!hasLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-ping"></div>
            <div className="relative rounded-full w-16 h-16 border-4 border-purple-500 border-t-transparent animate-spin flex items-center justify-center">
              <span className="text-2xl">🔗</span>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-700">Loading matching activity...</p>
        </div>
      </div>
    );
  }

  if (!content?.activityA?.pairs) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-lg font-bold text-red-600">No activity content found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col bg-gradient-to-br ${DESIGN.colors.bg} ${DESIGN.spacing.container} rounded-2xl overflow-hidden`}>
      {/* Header - Ultra Compact */}
      <div className={`flex-shrink-0 bg-gradient-to-r ${DESIGN.colors.header} rounded-xl px-3 py-1.5 mb-2 ${DESIGN.shadows.card} border border-white`}>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-xl">🔗</span>
          <h3 className="text-base md:text-lg font-black text-white">{content.activityA.title}</h3>
        </div>
      </div>

      {/* Main Content - More space for content */}
      <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden">
        {/* Images with Drop Zones - Takes 55% of available space */}
        <div className={`flex-[0.55] ${DESIGN.colors.card} rounded-2xl p-3 ${DESIGN.shadows.card} overflow-hidden`}>
          <div className="h-full overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {content.activityA.pairs.map((pair) => (
                <div key={pair.emoji} className="flex flex-col items-center">
                  {/* Emoji Card - Responsive size */}
                  <div 
                    onClick={() => handleImageClick(pair.emoji)}
                    className={`w-full aspect-square max-h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl ${DESIGN.shadows.button} flex items-center justify-center mb-2 cursor-pointer ${DESIGN.transitions} transform hover:scale-105 border-2 border-white`}
                  >
                    <span className="text-3xl md:text-4xl">{pair.emoji}</span>
                  </div>

                  {/* Drop Zone - Compact */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, pair.emoji)}
                    className={`w-full h-9 border-2 border-dashed rounded-lg flex items-center justify-center text-xs font-bold ${DESIGN.transitions} ${
                      correctMatches.has(pair.emoji) 
                        ? `${DESIGN.colors.dropzone.correct} text-green-700 ${DESIGN.shadows.button}` 
                        : wrongMatches.has(pair.emoji)
                          ? `${DESIGN.colors.dropzone.wrong} text-red-700 ${DESIGN.shadows.button}`
                          : dropZones[pair.emoji]
                            ? `${DESIGN.colors.dropzone.filled} text-yellow-700`
                            : `${DESIGN.colors.dropzone.empty} text-gray-400`
                    }`}
                  >
                    <span className="text-center px-1 truncate text-xs">
                      {dropZones[pair.emoji] || 'Drop'}
                    </span>
                    {correctMatches.has(pair.emoji) && <span className="ml-1">✓</span>}
                    {wrongMatches.has(pair.emoji) && <span className="ml-1">✗</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Draggable Words - Takes 35% */}
        <div className={`flex-[0.35] ${DESIGN.colors.card} rounded-2xl p-3 ${DESIGN.shadows.card} overflow-hidden flex flex-col`}>
          <h4 className="text-sm font-black text-center mb-2 text-gray-800 flex-shrink-0">
            {isCompleted ? "🎉 Perfect!" : completionCalled ? "💪 Done!" : "👆 Drag to match"}
          </h4>
          <div className="flex-1 overflow-y-auto">
            <div className="flex justify-center flex-wrap gap-2">
              {shuffledWords.map((pair, index) => {
                const isUsed = Object.values(dropZones).includes(pair.word);
                const isCorrectlyPlaced = correctMatches.has(pair.emoji) && dropZones[pair.emoji] === pair.word;
                const isWronglyPlaced = wrongMatches.has(pair.emoji) && dropZones[pair.emoji] === pair.word;
                
                return (
                  <div
                    key={`shuffled-${pair.word}-${index}`}
                    draggable={!isUsed || isWronglyPlaced}
                    onDragStart={(e) => handleDragStart(e, pair.word)}
                    onClick={() => handleWordClick(pair.word)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-sm cursor-pointer ${DESIGN.transitions} transform ${
                      isCorrectlyPlaced
                        ? `${DESIGN.colors.word.correct} text-white cursor-default ${DESIGN.shadows.button}`
                        : isWronglyPlaced
                          ? `${DESIGN.colors.word.wrong} text-white hover:scale-105 ${DESIGN.shadows.button}`
                          : isUsed 
                            ? `${DESIGN.colors.word.used} text-gray-500 cursor-not-allowed opacity-50` 
                            : `${DESIGN.colors.word.available} text-white hover:scale-105 ${DESIGN.shadows.button}`
                    }`}
                  >
                    <span>{pair.word}</span>
                    <span className="ml-1 text-xs">🔈</span>
                    {isCorrectlyPlaced && <span className="ml-1">✅</span>}
                    {isWronglyPlaced && <span className="ml-1">🔄</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress Indicator - Takes 10% */}
        <div className="flex-[0.1] flex items-center justify-center flex-shrink-0">
          <div className="flex items-center space-x-3">
            {/* Correct Score */}
            <div className="flex items-center space-x-1">
              <span className="text-base">✓</span>
              <span className="text-sm font-black text-green-600">
                {correctMatches.size}/{content.activityA.pairs.length}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden border border-gray-300">
              <div
                className={`bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full ${DESIGN.transitions}`}
                style={{
                  width: `${(correctMatches.size / content.activityA.pairs.length) * 100}%` 
                }}
              ></div>
            </div>
            
            {/* Attempted Score */}
            <div className="flex items-center space-x-1">
              <span className="text-base">📝</span>
              <span className="text-sm font-black text-blue-600">
                {Object.keys(dropZones).length}/{content.activityA.pairs.length}
              </span>
            </div>
            
            {correctMatches.size === content.activityA.pairs.length && (
              <span className="text-lg animate-bounce">🎉</span>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};