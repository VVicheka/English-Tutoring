import { useState, useEffect, useMemo } from 'react';
import { useTextToSpeech } from './useTextToSpeech';

export const DragableMatchingActivity = ({ content, onComplete }) => {
  const { speak } = useTextToSpeech();
  
  // Embedded sound generation using Web Audio API
  const createAudioContext = () => {
    return new (window.AudioContext || window.webkitAudioContext)();
  };

  const playCorrectSound = () => {
    try {
      const audioContext = createAudioContext();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
    } catch (error) {
      console.log('Web Audio not supported');
    }
  };

  const playWrongSound = () => {
    try {
      const audioContext = createAudioContext();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(100, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.type = 'sawtooth';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
    } catch (error) {
      console.log('Web Audio not supported');
    }
  };
  
  // Create a unique storage key for this specific activity
  const storageKey = useMemo(() => {
    if (!content?.activityA?.pairs) return 'default-activity';
    const wordsString = content.activityA.pairs.map(p => p.word).sort().join('-');
    return `matching-activity-${wordsString}`;
  }, [content]);

  // Fisher-Yates shuffle algorithm for consistent shuffling
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

  // Create shuffled words that stay consistent for this activity
  const shuffledWords = useMemo(() => {
    if (!content?.activityA?.pairs) return [];
    
    const seed = content.activityA.pairs
      .map(p => p.word)
      .join('')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    return shuffleArray(content.activityA.pairs, seed);
  }, [content]);

  // Initialize state
  const [draggedWord, setDraggedWord] = useState(null);
  const [dropZones, setDropZones] = useState({});
  const [correctMatches, setCorrectMatches] = useState(new Set());
  const [wrongMatches, setWrongMatches] = useState(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [completionCalled, setCompletionCalled] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && storageKey !== 'default-activity') {
      try {
        const saved = window.matchingActivityProgress?.[storageKey];
        if (saved && typeof saved === 'object') {
          console.log('Loading saved progress:', saved);
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

  // Save progress and handle completion
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

      // FIXED: Call onComplete with correct count and total count
      if (allWordsAttempted && !completionCalled && onComplete) {
        console.log('All words attempted, calling onComplete with counts');
        console.log('Correct matches:', correctMatches.size, 'Total pairs:', totalWords);
        setCompletionCalled(true);
        
        setTimeout(() => {
          console.log('Calling onComplete(correctMatches, totalWords)');
          // Pass the counts to parent for score calculation
          onComplete(correctMatches.size, totalWords);
        }, allCorrect ? 2000 : 1000);
      }
      
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [dropZones, correctMatches, wrongMatches, storageKey, content, isCompleted, hasLoaded, speak, onComplete, completionCalled]);

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

  if (!hasLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (!content?.activityA?.pairs) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: No activity content found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-purple-800 mb-2">{content.activityA.title}</h3>
        <p className="text-purple-600 text-lg italic">{content.activityA.instruction}</p>
        
        {isCompleted && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
            <p className="text-green-700 font-semibold flex items-center justify-center">
              ✅ Perfect! All matches correct!
            </p>
          </div>
        )}
        
        {completionCalled && !isCompleted && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
            <p className="text-blue-700 font-semibold flex items-center justify-center">
              📝 Good try! You've attempted all matches.
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {/* Images with Drop Zones */}
        <div className="flex-1 bg-blue-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-4 gap-6 h-full">
            {content.activityA.pairs.map((pair) => (
              <div key={pair.emoji} className="flex flex-col items-center">
                <div 
                  className="w-24 h-24 bg-white rounded-lg shadow-md flex items-center justify-center mb-4 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleImageClick(pair.emoji)}
                >
                  <span className="text-4xl">{pair.emoji}</span>
                </div>

                <div
                  className={`w-32 h-12 border-2 border-dashed rounded-lg flex items-center justify-center text-lg font-semibold transition-all ${
                    correctMatches.has(pair.emoji) 
                      ? 'bg-green-100 border-green-400 text-green-700' 
                      : wrongMatches.has(pair.emoji)
                        ? 'bg-red-100 border-red-400 text-red-700'
                        : dropZones[pair.emoji]
                          ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                          : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, pair.emoji)}
                >
                  <span className="text-sm text-center">
                    {dropZones[pair.emoji] || 'Drop here'}
                  </span>
                  {correctMatches.has(pair.emoji) && <span className="ml-2">✓</span>}
                  {wrongMatches.has(pair.emoji) && <span className="ml-2">❌</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Draggable Words */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-semibold text-center mb-4 text-gray-700">
            {isCompleted ? "Words matched perfectly:" : completionCalled ? "All words attempted:" : "Drag the words to match:"}
          </h4>
          <div className="flex justify-center space-x-4 flex-wrap gap-2">
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
                  className={`px-6 py-3 rounded-lg font-semibold text-lg cursor-pointer transition-all ${
                    isCorrectlyPlaced
                      ? 'bg-green-200 text-green-800 cursor-default'
                      : isWronglyPlaced
                        ? 'bg-red-200 text-red-800 hover:bg-red-300 shadow-md'
                        : isUsed 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' 
                          : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 hover:scale-105 shadow-md'
                  }`}
                >
                  {pair.word}
                  <span className="ml-2 text-sm">🔈</span>
                  {isCorrectlyPlaced && <span className="ml-2">✅</span>}
                  {isWronglyPlaced && <span className="ml-2">🔄</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="text-center mt-4">
          <div className="flex items-center justify-center space-x-4">
            <p className="text-lg text-gray-600">
              Correct: {correctMatches.size} / {content.activityA.pairs.length}
            </p>
            <p className="text-lg text-gray-600">
              Attempted: {Object.keys(dropZones).length} / {content.activityA.pairs.length}
            </p>
            
            <div className="w-32 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(Object.keys(dropZones).length / content.activityA.pairs.length) * 100}%` 
                }}
              ></div>
            </div>
            
            <div className="w-32 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(correctMatches.size / content.activityA.pairs.length) * 100}%` 
                }}
              ></div>
            </div>
            
            {correctMatches.size === content.activityA.pairs.length && (
              <span className="text-green-600 font-bold">🎉 Perfect!</span>
            )}
          </div>
          
          {!completionCalled && Object.keys(dropZones).length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Keep going! You're doing great! 🌟
            </p>
          )}
          
          {completionCalled && !isCompleted && (
            <p className="text-sm text-blue-600 mt-2">
              Good effort! You can continue to the next activity or try to improve your matches! 🔄
            </p>
          )}
        </div>
      </div>
    </div>
  );
};