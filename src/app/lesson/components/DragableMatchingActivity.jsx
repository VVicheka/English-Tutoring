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
      
      // Create a success "ding" sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Success sound: High pitched bell-like tone
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // High C
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1); // Even higher
      
      // Envelope for nice fade out
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.type = 'sine'; // Smooth tone
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
    } catch (error) {
      console.log('Web Audio not supported, using speech fallback');
      speak("✓", { rate: 3.0, pitch: 2.0, volume: 0.3 });
    }
  };

  const playWrongSound = () => {
    try {
      const audioContext = createAudioContext();
      
      // Create a "buzz" error sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Error sound: Low pitched buzzer
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime); // Low frequency
      oscillator.frequency.setValueAtTime(100, audioContext.currentTime + 0.1); // Even lower
      
      // Quick fade out - LOUDER VOLUME
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // Increased from 0.2 to 0.5
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.type = 'sawtooth'; // Harsher buzz sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
    } catch (error) {
      console.log('Web Audio not supported, using speech fallback');
      speak("✗", { rate: 2.0, pitch: 0.5, volume: 0.5 });
    }
  };

  // Alternative: Base64 embedded sound files (if you have small sound files)
  const playEmbeddedCorrectSound = () => {
    try {
      // This is a base64 encoded short "ding" sound (you'd replace with actual data)
      const audioData = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBTGH0fPTgjMGJHa+7+OVSA0NVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OWjTgwMUKXh8bllHgg2jdXzzn0vBSF1xe/fljwLElyx5OyrWBUIQ5zd8sFuIAUuhM/z2Ik2CRZiturqpVEMC1Cg4PK8aB4GM4nU8tGAMQYjdb7v45ZIDAxVqufwsF4YBz+W2/HEcyAELIHM89uLOQgXY7zr5KdPDAxOpN/wvGceCD6M0fLNfC0FJXfH8N+QQAoUXrTp66hVFApGnt/zv2YdBTCG0fPTgzMGJHW97+OVSA0NVqzn77BeGAg+ltrzxnkpBSh+zPDaizsIGWW56+OjTgwMUKXh8bllHgg2jdT0z3wvBSJ0xe/gljwLElyx5OyrWRUIRJve8sFuIAUug8/z2Ik3CBZiturqpVEMDFCg4PK8aB4GM4nS89GAMQYjdb7v45ZIDAxVqufwsF4YBz+W2/LDcyAELYDM89uLOQgXY7zr5KdPDAxOpN/wvGceCD6M0fPMfC0FJXfH8N+QQAoUXrTp66hVFApGnt/zv2YdBTCG0fPTgzMGJHW97+OVSA0NVqzn77BeGAg+ltrzxnkpBSh+zPDaizsIGWW56+OjTgwMUKXh8bllHgg2jdT0z3wvBSJ0xe/gljwLElyx5OyrWRUIRJve8sFuIAUug8/z2Ik3CBZiturqpVEMDFCg4PK8aB4GM4nS89GAMQYjdb7v45ZIDAxVqufwsF4YBz+W2/LDcyAELYDM89uLOQgXY7zr5KdPDAxOpN/wvGceCD6M0fPMfC0FJXfH8N+QQAoUXrTp66hVFAlFnt/zv2YdBTCG0fPTgzMGJHW97+OVSA0NVqzn77BeGAg+ltrzxnkpBSh+zPDaizsIGWW56+OjTgwMUKXh8bllHgg2jdT0z3wvBSJ0xe/gljwLElyx5OyrWRUIRJve8sFuIAUug8/z2Ik3CBZiturqpVEMDFCg4PK8aB4GM4nS89GAMQYjdb7v45ZIDAxVqufwsF4YBz+W2/LDcyAELYDM89uLOQgXY7zr5KdPDAxOpN/wvGceCD6M0fPMfC0FJXfH8N+QQAoUXrTp66hVFAlFnt/zv2YdBTCG0fPTgzMGJHW97+OVSA0NVqzn77BeGAg+ltrzxnkpBSh+zPDaizsIGWW56+OjTgwMUKXh8bllHgg2jdT0z3wvBSJ0xe/gljwLE=";
      
      const audio = new Audio(audioData);
      audio.volume = 0.6;
      audio.play().catch(() => {
        // Fallback to generated sound
        playCorrectSound();
      });
    } catch (error) {
      playCorrectSound();
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
      // Simple linear congruential generator for deterministic randomness
      random = (random * 9301 + 49297) % 233280;
      const j = Math.floor((random / 233280) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Create shuffled words that stay consistent for this activity
  const shuffledWords = useMemo(() => {
    if (!content?.activityA?.pairs) return [];
    
    // Create a simple hash from the words to use as seed
    const seed = content.activityA.pairs
      .map(p => p.word)
      .join('')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    console.log('Shuffling words with seed:', seed);
    console.log('Original order:', content.activityA.pairs.map(p => p.word));
    
    const shuffled = shuffleArray(content.activityA.pairs, seed);
    console.log('Shuffled order:', shuffled.map(p => p.word));
    
    return shuffled;
  }, [content]);

  // Initialize state with proper loading from memory
  const [draggedWord, setDraggedWord] = useState(null);
  const [dropZones, setDropZones] = useState({});
  const [correctMatches, setCorrectMatches] = useState(new Set());
  const [wrongMatches, setWrongMatches] = useState(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  // ADDED: Track if completion callback has been called
  const [completionCalled, setCompletionCalled] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && storageKey !== 'default-activity') {
      try {
        const saved = window.matchingActivityProgress?.[storageKey];
        if (saved) {
          console.log('Loading saved progress:', saved);
          setDropZones(saved.dropZones || {});
          
          // Convert array back to Set if needed
          if (Array.isArray(saved.correctMatches)) {
            setCorrectMatches(new Set(saved.correctMatches));
          } else if (saved.correctMatches instanceof Set) {
            setCorrectMatches(saved.correctMatches);
          } else {
            setCorrectMatches(new Set());
          }

          // Load wrong matches
          if (Array.isArray(saved.wrongMatches)) {
            setWrongMatches(new Set(saved.wrongMatches));
          } else if (saved.wrongMatches instanceof Set) {
            setWrongMatches(saved.wrongMatches);
          } else {
            setWrongMatches(new Set());
          }
          
          // Check if completion was already called
          if (saved.completionCalled) {
            setCompletionCalled(true);
          }
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
      setHasLoaded(true);
    } else {
      setHasLoaded(true);
    }
  }, [storageKey]);

  // FIXED: Save progress and handle completion
  useEffect(() => {
    if (!hasLoaded || !content?.activityA?.pairs) return;
    
    try {
      const progressData = { 
        dropZones, 
        correctMatches: Array.from(correctMatches), 
        wrongMatches: Array.from(wrongMatches),
        completionCalled
      };
      
      // Save to window object (in-memory storage)
      if (typeof window !== 'undefined') {
        if (!window.matchingActivityProgress) {
          window.matchingActivityProgress = {};
        }
        window.matchingActivityProgress[storageKey] = progressData;
        console.log('Saved progress:', progressData);
      }

      // FIXED: Check if all words have been attempted (not just correct)
      const totalWords = content.activityA.pairs.length;
      const attemptedWords = new Set([...Object.keys(dropZones)]);
      const allWordsAttempted = attemptedWords.size === totalWords;
      const allCorrect = correctMatches.size === totalWords;
      
      if (allCorrect !== isCompleted) {
        setIsCompleted(allCorrect);
        
        if (allCorrect && !isCompleted) {
          // Play completion sound/message for perfect completion
          setTimeout(() => {
            playCorrectSound();
            setTimeout(() => {
              speak("Excellent! You completed the matching activity perfectly!", { rate: 0.8, pitch: 1.3 });
            }, 400);
          }, 500);
        }
      }

      // FIXED: Call onComplete when all words have been attempted (not just when all correct)
      if (allWordsAttempted && !completionCalled && onComplete) {
        console.log('All words attempted, calling onComplete callback');
        setCompletionCalled(true);
        
        setTimeout(() => {
          console.log('Calling onComplete callback from DragableMatchingActivity');
          onComplete();
        }, allCorrect ? 2000 : 1000); // Longer delay if perfect, shorter if some wrong
      }
      
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [dropZones, correctMatches, wrongMatches, storageKey, content, isCompleted, hasLoaded, speak, onComplete, completionCalled]);

  const handleDragStart = (e, word) => {
    // FIXED: Allow dragging even if activity has wrong answers
    if (isCompleted && correctMatches.size === content.activityA.pairs.length) {
      e.preventDefault();
      return;
    }
    
    console.log('Drag started:', word);
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
    
    if (!draggedWord) {
      console.log('Drop ignored - no dragged word');
      return;
    }

    console.log('Drop attempt:', draggedWord, 'on', targetEmoji);

    // Find the correct match for this emoji
    const correctPair = content.activityA.pairs.find(pair => pair.emoji === targetEmoji);
    const isCorrect = correctPair && correctPair.word === draggedWord;

    console.log('Is correct match?', isCorrect);

    // Update drop zones
    setDropZones(prev => {
      const newDropZones = { ...prev, [targetEmoji]: draggedWord };
      console.log('New drop zones:', newDropZones);
      return newDropZones;
    });

    // Track correct matches
    if (isCorrect) {
      setCorrectMatches(prev => {
        const newSet = new Set([...prev, targetEmoji]);
        console.log('New correct matches:', Array.from(newSet));
        return newSet;
      });
      // Remove from wrong matches if it was there
      setWrongMatches(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetEmoji);
        return newSet;
      });
      
      // Play success sound effect
      playCorrectSound();
      
      // Also speak the word after a short delay
      setTimeout(() => {
        speak(draggedWord, { rate: 0.7, pitch: 1.2 });
      }, 300);
      
    } else {
      // Mark as wrong match
      setWrongMatches(prev => {
        const newSet = new Set([...prev, targetEmoji]);
        console.log('New wrong matches:', Array.from(newSet));
        return newSet;
      });
      
      // Remove from correct matches if it was there
      setCorrectMatches(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetEmoji);
        return newSet;
      });
      
      // Play error sound effect
      playWrongSound();
    }

    setDraggedWord(null);
  };

  const handleWordClick = (word) => {
    console.log('Word clicked:', word);
    // Allow clicking for audio feedback
    speak(word, { rate: 0.7, pitch: 1.2 });
  };

  const handleImageClick = (emoji) => {
    console.log('Image clicked:', emoji);
    const correctPair = content.activityA.pairs.find(pair => pair.emoji === emoji);
    if (correctPair) {
      speak(correctPair.word, { rate: 0.7, pitch: 1.2 });
    }
  };

  // Debug info
  console.log('Component state:', {
    hasLoaded,
    isCompleted,
    completionCalled,
    dropZones,
    correctMatches: Array.from(correctMatches),
    wrongMatches: Array.from(wrongMatches),
    draggedWord,
    shuffledWords: shuffledWords.map(p => p.word)
  });

  // Show loading state until progress is loaded
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

  // Safety check for content
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
        
        {/* Completion status */}
        {isCompleted && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
            <p className="text-green-700 font-semibold flex items-center justify-center">
              ✅ Perfect! All matches correct!
            </p>
          </div>
        )}
        
        {/* ADDED: Show attempt completion status */}
        {completionCalled && !isCompleted && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
            <p className="text-blue-700 font-semibold flex items-center justify-center">
              📝 Good try! You've attempted all matches.
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {/* Images with Drop Zones - Keep original order */}
        <div className="flex-1 bg-blue-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-4 gap-6 h-full">
            {content.activityA.pairs.map((pair, index) => (
              <div key={pair.emoji} className="flex flex-col items-center">
                {/* Image */}
                <div 
                  className="w-24 h-24 bg-white rounded-lg shadow-md flex items-center justify-center mb-4 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleImageClick(pair.emoji)}
                >
                  <span className="text-4xl">{pair.emoji}</span>
                </div>

                {/* Drop Zone */}
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

        {/* Draggable Words - Shuffled order */}
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
                  draggable={!isUsed || isWronglyPlaced} // FIXED: Allow re-dragging wrong answers
                  onDragStart={(e) => handleDragStart(e, pair.word)}
                  onClick={() => handleWordClick(pair.word)}
                  className={`px-6 py-3 rounded-lg font-semibold text-lg cursor-pointer transition-all ${
                    isCorrectlyPlaced
                      ? 'bg-green-200 text-green-800 cursor-default'
                      : isWronglyPlaced
                        ? 'bg-red-200 text-red-800 hover:bg-red-300 shadow-md' // Allow re-dragging
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
            
            {/* Progress bar for attempts */}
            <div className="w-32 bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(Object.keys(dropZones).length / content.activityA.pairs.length) * 100}%` 
                }}
              ></div>
            </div>
            
            {/* Progress bar for correct matches */}
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
          
          {/* Helpful hints */}
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