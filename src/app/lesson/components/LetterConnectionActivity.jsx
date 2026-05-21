// LetterConnectionActivity - Cohesive Design System
"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import { useTextToSpeech } from './useTextToSpeech';
import { useAudioFeedback } from './useAudioFeedback';

// Design system constants matching main activities
const DESIGN = {
  colors: {
    bg: 'from-orange-100 via-amber-100 to-yellow-100',
    header: 'from-orange-400 to-amber-400',
    card: 'bg-white',
    letter: {
      idle: 'from-yellow-400 to-yellow-500',
      active: 'from-orange-500 to-red-500',
      correct: 'from-green-400 to-green-500',
      wrong: 'from-gray-300 to-gray-400',
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
    letter: 'shadow-md',
  },
  transitions: 'transition-all duration-300',
};

export const LetterConnectionActivity = ({ 
  content, 
  currentStep = 0,
  completedSteps = {},       
  onStepComplete,
  onComplete
}) => {
  const { speak } = useTextToSpeech();
  const { playCorrectSound, playWrongSound } = useAudioFeedback();
  const containerRef = useRef(null);

  // Generate deterministic seed from answer
  const generateSeedFromAnswer = (answer, step) => {
    let seed = 0;
    const combined = `${answer}-${step}`;
    for (let i = 0; i < combined.length; i++) {
      seed = ((seed << 5) - seed + combined.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(seed);
  };

  // Deterministic random number generator
  const createSeededRandom = (seed) => {
    let state = seed % 2147483647;
    if (state <= 0) state += 2147483646;
    
    return function() {
      state = (state * 16807) % 2147483647;
      return (state - 1) / 2147483646;
    };
  };

  // Generate letters with deterministic placement patterns
  const generateLettersForQuestion = (answer, step) => {
    const answerLetters = answer.toUpperCase().split('');
    const grid = new Array(9).fill(null);
    
    const seed = generateSeedFromAnswer(answer, step);
    const seededRandom = createSeededRandom(seed);
    
    const placementStrategies = [
      [0, 1, 2, 5, 8, 7, 6, 3, 4],
      [0, 3, 6, 7, 8, 5, 2, 1, 4],
      [4, 1, 0, 3, 6, 7, 8, 5, 2],
      [0, 1, 4, 7, 6, 3, 2, 5, 8],
      [2, 5, 8, 7, 4, 1, 0, 3, 6],
      [6, 7, 8, 5, 2, 1, 0, 3, 4],
      [8, 7, 6, 3, 0, 1, 2, 5, 4],
      [1, 4, 7, 6, 3, 0, 2, 5, 8],
      [0, 2, 8, 6, 4, 1, 3, 5, 7],
      [4, 0, 8, 2, 6, 1, 3, 5, 7],
    ];
    
    const strategyIndex = (answerLetters.length + step) % placementStrategies.length;
    const strategy = placementStrategies[strategyIndex];
    
    for (let i = 0; i < answerLetters.length && i < strategy.length; i++) {
      grid[strategy[i]] = answerLetters[i];
    }
    
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const usedLetters = new Set(answerLetters);
    
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] === null) {
        let randomLetter;
        let attempts = 0;
        do {
          const randomIndex = Math.floor(seededRandom() * allLetters.length);
          randomLetter = allLetters[randomIndex];
          attempts++;
        } while (usedLetters.has(randomLetter) && attempts < 50);
        
        if (usedLetters.has(randomLetter)) {
          for (let j = 0; j < allLetters.length; j++) {
            if (!usedLetters.has(allLetters[j])) {
              randomLetter = allLetters[j];
              break;
            }
          }
        }
        
        grid[i] = randomLetter;
        usedLetters.add(randomLetter);
      }
    }
    
    return grid;
  };

  // Create unique storage key
  const storageKey = useMemo(() => {
    if (!content?.activityB?.questions) return 'default-fillwords';
    const questionsHash = content.activityB.questions
      .map(q => q.answer)
      .join('-')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `fillwords-activity-${questionsHash}`;
  }, [content]);

  // State management
  const [connectedLetters, setConnectedLetters] = useState([]);
  const [questionLetters, setQuestionLetters] = useState([]);
  const [letterPositions, setLetterPositions] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // Drag state
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempLine, setTempLine] = useState(null);
  const [hoveredLetter, setHoveredLetter] = useState(null);
  const [dragStartLetter, setDragStartLetter] = useState(null);
  const [dragPath, setDragPath] = useState([]);

  // Get current question data
  const currentQuestionData = content?.activityB?.questions?.[currentStep];
  const totalQuestions = content?.activityB?.questions?.length || 0;
  const stepData = completedSteps[currentStep];
  const isCompleted = !!stepData;
  const completedCount = Object.keys(completedSteps).length;
  const allCompleted = completedCount === totalQuestions;

  const currentQuestion = useMemo(() => {
    return content?.activityB?.questions?.[currentStep];
  }, [content, currentStep]);

  // Generate letter positions
  const generateLetterPositions = (letters) => {
    const positions = {};
    const letterSize = 56;
    const gap = 8;
    const gridStartY = 60;
    
    letters.forEach((letter, index) => {
      if (letter) {
        const row = Math.floor(index / 3);
        const col = index % 3;
        
        const x = col * (letterSize + gap) + letterSize / 2 + 12;
        const y = row * (letterSize + gap) + letterSize / 2 + gridStartY;
        
        positions[letter] = { x, y };
      }
    });
    
    return positions;
  };

  // Load persistent state
  useEffect(() => {
    if (typeof window !== 'undefined' && storageKey !== 'default-fillwords') {
      try {
        const saved = window.fillwordsActivityProgress?.[storageKey];
        if (saved && saved[currentStep]) {
          const stepSaved = saved[currentStep];
          
          if (stepSaved.questionLetters) {
            setQuestionLetters(stepSaved.questionLetters);
            const positions = generateLetterPositions(stepSaved.questionLetters);
            setLetterPositions(positions);
          }
          
          if (stepSaved.connectedLetters) {
            setConnectedLetters(stepSaved.connectedLetters);
          }
        }
      } catch (error) {
        console.error('Error loading fillwords progress:', error);
      }
    }
    setHasLoaded(true);
  }, [storageKey, currentStep]);

  // State persistence and restoration
  useEffect(() => {
    if (!hasLoaded || !currentQuestion) return;
    
    const saved = typeof window !== 'undefined' ? 
      window.fillwordsActivityProgress?.[storageKey]?.[currentStep] : null;
    
    if (saved && saved.questionLetters) {
      setQuestionLetters(saved.questionLetters);
      setConnectedLetters(saved.connectedLetters || []);
      const positions = generateLetterPositions(saved.questionLetters);
      setLetterPositions(positions);
    } else {
      const newLetters = generateLettersForQuestion(currentQuestion.answer, currentStep);
      setQuestionLetters(newLetters);
      setConnectedLetters([]);
      const positions = generateLetterPositions(newLetters);
      setLetterPositions(positions);
      
      if (typeof window !== 'undefined') {
        if (!window.fillwordsActivityProgress) {
          window.fillwordsActivityProgress = {};
        }
        if (!window.fillwordsActivityProgress[storageKey]) {
          window.fillwordsActivityProgress[storageKey] = {};
        }
        window.fillwordsActivityProgress[storageKey][currentStep] = {
          questionLetters: newLetters,
          connectedLetters: [],
        };
      }
    }
    
    setDragPath([]);
    setIsProcessing(false);
    setShowHint(stepData ? !stepData.isCorrect : false);
  }, [currentStep, currentQuestion, hasLoaded, storageKey, stepData]);

  // Save state
  useEffect(() => {
    if (!hasLoaded || !currentQuestion) return;
    
    if (typeof window !== 'undefined') {
      if (!window.fillwordsActivityProgress) {
        window.fillwordsActivityProgress = {};
      }
      if (!window.fillwordsActivityProgress[storageKey]) {
        window.fillwordsActivityProgress[storageKey] = {};
      }
      
      window.fillwordsActivityProgress[storageKey][currentStep] = {
        questionLetters: questionLetters,
        connectedLetters: connectedLetters,
      };
    }
  }, [questionLetters, connectedLetters, currentStep, storageKey, hasLoaded, currentQuestion]);

  // Auto-advance logic
  useEffect(() => {
    if (stepData && !isProcessing && onComplete && allCompleted) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [stepData, isProcessing, onComplete, allCompleted]);

  // Check adjacency
  const areAdjacent = (index1, index2) => {
    const row1 = Math.floor(index1 / 3);
    const col1 = index1 % 3;
    const row2 = Math.floor(index2 / 3);
    const col2 = index2 % 3;
    
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    
    return (rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0);
  };

  // Drag handlers
  const handleMouseDown = (letter, event, index) => {
    if (stepData || isProcessing) return;
    
    setIsDrawing(true);
    setDragStartLetter(letter);
    setDragPath([letter]);
    
    const rect = event.target.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (containerRect) {
      const x = rect.left + rect.width / 2 - containerRect.left;
      const y = rect.top + rect.height / 2 - containerRect.top;
      
      setLetterPositions(prev => ({
        ...prev,
        [letter]: { x, y }
      }));
    }
  };

  const handleMouseMove = (event) => {
    if (!isDrawing || !dragStartLetter || stepData) return;
    
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    
    const x = event.clientX - containerRect.left;
    const y = event.clientY - containerRect.top;
    
    const letterElements = containerRef.current?.querySelectorAll('.letter-container');
    let currentHovered = null;
    
    letterElements?.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const relativeX = event.clientX - containerRect.left;
      const relativeY = event.clientY - containerRect.top;
      const elementX = rect.left - containerRect.left;
      const elementY = rect.top - containerRect.top;
      
      if (relativeX >= elementX && relativeX <= elementX + rect.width &&
          relativeY >= elementY && relativeY <= elementY + rect.height) {
        const letter = questionLetters[index];
        currentHovered = letter;
      }
    });
    
    if (currentHovered && currentHovered !== hoveredLetter) {
      const currentHoveredIndex = questionLetters.indexOf(currentHovered);
      
      if (dragPath.length === 1) {
        if (currentHovered !== dragStartLetter) {
          const startIndex = questionLetters.indexOf(dragStartLetter);
          if (areAdjacent(startIndex, currentHoveredIndex)) {
            addLetterToPath(currentHovered, currentHoveredIndex);
          }
        }
      } else {
        const lastLetterInPath = dragPath[dragPath.length - 1];
        const lastLetterIndex = questionLetters.indexOf(lastLetterInPath);
        
        if (currentHovered !== lastLetterInPath && 
            !dragPath.includes(currentHovered) && 
            areAdjacent(lastLetterIndex, currentHoveredIndex)) {
          addLetterToPath(currentHovered, currentHoveredIndex);
        }
      }
    }
    
    setHoveredLetter(currentHovered);
    
    const lastLetter = dragPath[dragPath.length - 1];
    const startPos = letterPositions[lastLetter];
    if (startPos) {
      setTempLine({
        x1: startPos.x,
        y1: startPos.y,
        x2: x,
        y2: y
      });
    }
  };

  const addLetterToPath = (letter, index) => {
    const letterElement = containerRef.current?.querySelector(`[data-letter-index="${index}"]`);
    if (letterElement) {
      const rect = letterElement.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      const letterX = rect.left + rect.width / 2 - containerRect.left;
      const letterY = rect.top + rect.height / 2 - containerRect.top;
      
      setLetterPositions(prev => ({
        ...prev,
        [letter]: { x: letterX, y: letterY }
      }));
    }
    
    setDragPath(prev => [...prev, letter]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !dragStartLetter || stepData) {
      resetDragState();
      return;
    }
    
    if (dragPath.length < 2) {
      resetDragState();
      return;
    }
    
    setIsProcessing(true);
    setConnectedLetters(dragPath);
    
    const targetWord = currentQuestion.answer.toUpperCase();
    const formedWord = dragPath.join('');
    const isCorrect = formedWord === targetWord;
    
    if (isCorrect) {
      playCorrectSound(() => speak("Correct!", { rate: 2.0, pitch: 1.5, volume: 0.5 }));
      setShowHint(false);
      
      setTimeout(() => {
        speak(targetWord, { rate: 0.8, pitch: 1.2 });
        
        setTimeout(() => {
          if (onStepComplete) {
            onStepComplete(currentStep, {
              connectedLetters: dragPath,
              isCorrect: true,
              targetWord: targetWord,
              formedWord: formedWord,
              questionLetters: questionLetters,
              letterPositions: { ...letterPositions }
            });
          }
          
          if (currentStep === totalQuestions - 1) {
            setTimeout(() => {
              if (onComplete) {
                onComplete();
              }
            }, 1000);
          }
          
          setIsProcessing(false);
        }, 1500);
      }, 500);
    } else {
      playWrongSound(() => speak("Try again", { rate: 1.5, pitch: 0.8 }));
      setShowHint(true);
      
      setTimeout(() => {
        if (onStepComplete) {
          onStepComplete(currentStep, {
            connectedLetters: dragPath,
            isCorrect: false,
            targetWord: targetWord,
            formedWord: formedWord,
            questionLetters: questionLetters,
            letterPositions: { ...letterPositions }
          });
        }
        setIsProcessing(false);
        
        setTimeout(() => {
          setConnectedLetters([]);
          setDragPath([]);
        }, 1500);
      }, 1000);
    }
    
    resetDragState();
  };

  const resetDragState = () => {
    setIsDrawing(false);
    setTempLine(null);
    setHoveredLetter(null);
    setDragStartLetter(null);
    setDragPath([]);
  };

  const handleSentenceClick = () => {
    if (currentQuestion) {
      const sentence = currentQuestion.sentence.replace('____', currentQuestion.answer);
      speak(sentence, { rate: 0.8 });
    }
  };

  // Loading state
  if (!hasLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-orange-200 animate-ping"></div>
            <div className="relative rounded-full w-16 h-16 border-4 border-orange-500 border-t-transparent animate-spin flex items-center justify-center">
              <span className="text-2xl">✏️</span>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-700">Loading word activity...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!content?.activityB?.questions || !currentQuestionData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-lg font-bold text-red-600">No questions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col bg-gradient-to-br ${DESIGN.colors.bg} overflow-hidden rounded-2xl`}>
      {/* Header */}
      <div className={`flex-shrink-0 bg-gradient-to-r ${DESIGN.colors.header} ${DESIGN.spacing.compact} flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">✏️</span>
          <h3 className="text-xl font-black text-white">
            {content.activityB.title || "Connect the Letters"}
          </h3>
        </div>
        
        {isCompleted && (
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            stepData.isCorrect 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-500 text-white'
          }`}>
            {stepData.isCorrect ? '✓ Correct!' : '○ Attempted'}
          </div>
        )}
      </div>

      {/* Main Content - 40/60 Split, No Scrolling */}
      <div className={`flex-1 flex flex-col lg:flex-row gap-3 ${DESIGN.spacing.compact} min-h-0 overflow-hidden`}>
        {/* Left Side - Sentence (40%) */}
        <div className="flex-1 lg:w-[40%] min-w-0 min-h-0 overflow-hidden">
          <div className={`${DESIGN.colors.card} rounded-2xl ${DESIGN.spacing.compact} h-full flex flex-col ${DESIGN.shadows.card}`}>
            {/* Image Placeholder - Compact */}
            <div className="w-full h-20 flex-shrink-0 bg-gradient-to-br from-orange-100 via-yellow-100 to-amber-100 rounded-xl flex items-center justify-center mb-3 border-2 border-white">
              <div className="text-center">
                <div className="text-2xl mb-1">🖼️</div>
                <p className="text-xs font-medium text-gray-600">Word: {currentQuestion.answer}</p>
              </div>
            </div>
            
            {/* Sentence - Takes remaining space */}
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div 
                onClick={handleSentenceClick}
                className={`text-center cursor-pointer hover:bg-orange-50 p-3 rounded-xl ${DESIGN.transitions} w-full`}
              >
                <p className="text-sm lg:text-base leading-relaxed mb-3 text-gray-800 font-medium">
                  {currentQuestion.sentence}
                </p>
                
                <button className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm mx-auto ${DESIGN.transitions} ${DESIGN.shadows.button} bg-white text-gray-700 hover:bg-gray-50 hover:scale-105`}>
                  <span>🔈</span>
                  <span>Click to hear</span>
                </button>
                
                {/* Hint - Compact */}
                {showHint && !isCompleted && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <p className="text-yellow-800 font-bold text-xs mb-1">💡 Try Again!</p>
                    <p className="text-yellow-700 text-sm font-semibold">
                      {currentQuestion.answer.toUpperCase()}
                    </p>
                  </div>
                )}
                
                {/* Result - Compact */}
                {isCompleted && (
                  <div className={`mt-3 p-2 rounded-lg border ${
                    stepData.isCorrect 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-red-50 border-red-300'
                  }`}>
                    <p className={`font-bold text-xs mb-1 ${
                      stepData.isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {stepData.isCorrect ? '✓ Perfect!' : '✗ Try again'}
                    </p>
                    <p className="text-xs text-gray-700">
                      Answer: <span className="font-bold">{currentQuestion.answer.toUpperCase()}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Letter Grid (60%) */}
        <div className="flex-1 lg:w-[60%] flex-shrink-0 min-h-0 overflow-hidden">
          <div 
            ref={containerRef}
            className={`${DESIGN.colors.card} rounded-2xl ${DESIGN.spacing.compact} h-full relative overflow-hidden ${DESIGN.shadows.card} flex flex-col`}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={resetDragState}
          >
            <h4 className="text-xs font-bold text-center mb-2 text-gray-700 flex-shrink-0">
              {isCompleted ? '✓ Completed' : '👆 Drag to Connect'}
            </h4>
            
            {/* Letter Grid - Compact, Fixed size */}
            <div className="grid grid-cols-3 gap-2 mb-3 relative z-20 justify-items-center flex-shrink-0">
              {questionLetters.slice(0, 9).map((letter, index) => {
                const isConnected = connectedLetters.includes(letter);
                const isInDragPath = dragPath.includes(letter);
                const isHovered = hoveredLetter === letter && isDrawing;
                const isDragStart = dragStartLetter === letter && isDrawing;
                const isHighlighted = isConnected || isInDragPath || isHovered || isDragStart;
                
                return (
                  <div
                    key={`${letter}-${index}`}
                    className={`letter-container w-14 h-14 rounded-lg font-black text-lg flex items-center justify-center cursor-pointer ${DESIGN.transitions} select-none relative z-30 ${
                      isCompleted
                        ? stepData.isCorrect
                          ? `bg-gradient-to-br ${DESIGN.colors.letter.correct} text-white shadow-md`
                          : `bg-gradient-to-br ${DESIGN.colors.letter.wrong} text-gray-600 shadow-md`
                        : isProcessing
                          ? `bg-gradient-to-br ${DESIGN.colors.letter.wrong} text-gray-600 cursor-not-allowed`
                          : isHighlighted
                            ? `bg-gradient-to-br ${DESIGN.colors.letter.active} text-white ${DESIGN.shadows.card} scale-110 ring-2 ring-orange-300`
                            : `bg-gradient-to-br ${DESIGN.colors.letter.idle} text-yellow-900 shadow-md hover:scale-105`
                    }`}
                    data-letter-index={index}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleMouseDown(letter, e, index);
                    }}
                    style={{ 
                      userSelect: 'none',
                      pointerEvents: (isCompleted || isProcessing) ? 'none' : 'auto'
                    }}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
            
            {/* Word Display - Compact */}
            <div className="text-center mb-2 relative z-20 flex-shrink-0">
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-2 border border-orange-200">
                <p className="text-xs text-gray-600 mb-1 uppercase tracking-wider font-bold">Your Word</p>
                <p className="text-2xl font-black text-orange-600 mb-1 min-h-[28px] flex items-center justify-center">
                  {connectedLetters.join('') || dragPath.join('') || '---'}
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                  connectedLetters.length > 0 || dragPath.length > 0
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {connectedLetters.length > 0 ? connectedLetters.length : dragPath.length || 0}/{currentQuestion.answer.length}
                </span>
              </div>
            </div>
            
            {/* Instructions - Compact */}
            <div className="text-center text-xs text-gray-600 flex-shrink-0">
              {isCompleted ? (
                <div className="flex items-center justify-center space-x-1 font-bold">
                  <span>{stepData.isCorrect ? '🎉' : '💪'}</span>
                  <span className="text-xs">{stepData.isCorrect ? 'Great!' : 'Try again!'}</span>
                </div>
              ) : isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-orange-500 border-t-transparent"></div>
                  <span className="font-semibold text-xs">Checking...</span>
                </div>
              ) : (
                <p className="font-medium text-xs">Drag letter to letter. Must touch!</p>
              )}
            </div>
            
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
              {!isCompleted && isDrawing && dragPath.length > 1 && (
                <polyline
                  points={dragPath
                    .map(letter => {
                      const pos = letterPositions[letter];
                      return pos ? `${pos.x},${pos.y}` : null;
                    })
                    .filter(Boolean)
                    .join(" ")}
                  stroke="url(#lineGradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
              )}

              {!isCompleted && isDrawing && tempLine && (
                <line
                  x1={tempLine.x1}
                  y1={tempLine.y1}
                  x2={tempLine.x2}
                  y2={tempLine.y2}
                  stroke="rgba(249, 115, 22, 0.5)"
                  strokeWidth="3"
                  strokeDasharray="6 3"
                  strokeLinecap="round"
                />
              )}
              
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};