// Fixed LetterConnectionActivity - Random Patterns + State Persistence
import { useState, useEffect, useRef, useMemo } from 'react';
import { useTextToSpeech } from './useTextToSpeech';

export const LetterConnectionActivity = ({ 
  content, 
  currentStep = 0,           // Parent controls which word/question we're on
  completedSteps = {},       
  onStepComplete,            // Notify parent when a word is completed
  onComplete
}) => {
  const { speak } = useTextToSpeech();
  const containerRef = useRef(null);
  
  // Sound effects
  const playCorrectSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
      speak("Correct!", { rate: 2.0, pitch: 1.5, volume: 0.5 });
    }
  };

  const playWrongSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.type = 'sawtooth';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      speak("Try again", { rate: 1.5, pitch: 0.8 });
    }
  };

  // Generate letters with diverse placement patterns
  const generateLettersForQuestion = (answer) => {
    const answerLetters = answer.toUpperCase().split('');
    const grid = new Array(9).fill(null);
    
    const placementStrategies = [
      [0, 1, 2, 5, 8, 7, 6, 3, 4], // Spiral
      [0, 3, 6, 7, 8, 5, 2, 1, 4], // Border clockwise
      [4, 1, 0, 3, 6, 7, 8, 5, 2], // Center outward
      [0, 1, 4, 7, 6, 3, 2, 5, 8], // Snake pattern
      [0, 4, 2, 6, 8, 1, 3, 5, 7], // Diagonal mixed
      [2, 1, 0, 5, 8, 7, 4, 3, 6], // Top row mixed
      [6, 3, 0, 1, 4, 7, 8, 5, 2], // Bottom-left start
      [8, 5, 2, 1, 0, 3, 6, 7, 4], // Bottom-right start
      [1, 4, 7, 8, 5, 2, 0, 3, 6], // Vertical mixed
      [8, 7, 6, 3, 0, 1, 2, 5, 4], // Reverse spiral
    ];
    
    const strategy = placementStrategies[Math.floor(Math.random() * placementStrategies.length)];
    
    // Place answer letters using selected strategy
    for (let i = 0; i < answerLetters.length && i < strategy.length; i++) {
      grid[strategy[i]] = answerLetters[i];
    }
    
    // Fill remaining positions with random letters
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const usedLetters = new Set(answerLetters);
    
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] === null) {
        let randomLetter;
        do {
          randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
        } while (usedLetters.has(randomLetter));
        
        grid[i] = randomLetter;
        usedLetters.add(randomLetter);
      }
    }
    
    return grid;
  };

  // State management
  const [connectedLetters, setConnectedLetters] = useState([]);
  const [questionLetters, setQuestionLetters] = useState([]);
  const [letterPositions, setLetterPositions] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  // Drag state
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempLine, setTempLine] = useState(null);
  const [hoveredLetter, setHoveredLetter] = useState(null);
  const [dragStartLetter, setDragStartLetter] = useState(null);
  const [dragPath, setDragPath] = useState([]);

  // Get current question data and stats
  const currentQuestionData = content?.activityB?.questions?.[currentStep];
  const totalQuestions = content?.activityB?.questions?.length || 0;
  const stepData = completedSteps[currentStep];
  const isCompleted = !!stepData;
  const completedCount = Object.keys(completedSteps).length;
  const allCompleted = completedCount === totalQuestions;

  // Memoize current question to prevent unnecessary re-renders
  const currentQuestion = useMemo(() => {
    return content?.activityB?.questions?.[currentStep];
  }, [content, currentStep]);

  // FIXED: Generate letter positions from grid layout
  const generateLetterPositions = (letters) => {
    const positions = {};
    const containerWidth = 272; // Approximate container width (w-80 = 320px - padding)
    const containerHeight = 400; // Approximate grid area height
    const gridStartY = 60; // Account for header
    const letterSize = 56; // w-14 h-14 = 56px
    const gap = 12; // gap-3 = 12px
    
    letters.forEach((letter, index) => {
      if (letter) {
        const row = Math.floor(index / 3);
        const col = index % 3;
        
        // Calculate position based on grid layout
        const x = col * (letterSize + gap) + letterSize / 2 + 16; // 16px padding
        const y = row * (letterSize + gap) + letterSize / 2 + gridStartY;
        
        positions[letter] = { x, y };
      }
    });
    
    return positions;
  };

  // FIXED: State persistence and restoration
  useEffect(() => {
    if (currentQuestion) {
      const newLetters = generateLettersForQuestion(currentQuestion.answer, currentStep);
      setQuestionLetters(newLetters);
      
      // FIXED: Restore state for completed steps, reset for new steps
      if (stepData) {
        // Step is completed - restore saved state
        setConnectedLetters(stepData.connectedLetters || []);
        
        // FIXED: Restore letter positions from saved grid layout
        if (stepData.questionLetters) {
          const positions = generateLetterPositions(stepData.questionLetters);
          setLetterPositions(positions);
        } else {
          // Fallback: generate positions from current letters
          const positions = generateLetterPositions(newLetters);
          setLetterPositions(positions);
        }
        
        setDragPath([]);
        setIsProcessing(false);
        setShowHint(false);
      } else {
        // Step is not completed - reset for new attempt
        setConnectedLetters([]);
        setLetterPositions({});
        setDragPath([]);
        setIsProcessing(false);
        setShowHint(false);
      }
    }
  }, [currentStep, currentQuestion, stepData]);

  // Auto-advance logic with proper dependencies
  useEffect(() => {
    if (stepData && !isProcessing && onComplete && allCompleted) {
      // All questions completed
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [stepData, isProcessing, onComplete, allCompleted]);

  // Check if two letters are adjacent in the grid
  const areAdjacent = (index1, index2) => {
    const row1 = Math.floor(index1 / 3);
    const col1 = index1 % 3;
    const row2 = Math.floor(index2 / 3);
    const col2 = index2 % 3;
    
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    
    return (rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0);
  };

  // Handle drag start
  const handleMouseDown = (letter, event, index) => {
    if (stepData || isProcessing) return; // Can't interact with completed steps
    
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

  // Handle mouse move - track continuous path
  const handleMouseMove = (event) => {
    if (!isDrawing || !dragStartLetter || stepData) return;
    
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    
    const x = event.clientX - containerRect.left;
    const y = event.clientY - containerRect.top;
    
    // Find which letter we're hovering over
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
    
    // Add letter to path if it's new and adjacent
    if (currentHovered && currentHovered !== hoveredLetter) {
      const currentHoveredIndex = questionLetters.indexOf(currentHovered);
      
      if (dragPath.length === 1) {
        // First connection - can connect to any adjacent letter
        if (currentHovered !== dragStartLetter) {
          const startIndex = questionLetters.indexOf(dragStartLetter);
          if (areAdjacent(startIndex, currentHoveredIndex)) {
            addLetterToPath(currentHovered, currentHoveredIndex);
          }
        }
      } else {
        // Subsequent connections - only adjacent to the last letter in path
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
    
    // Draw temp line from the last letter in path to mouse position
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

  // Helper function to add letter to path
  const addLetterToPath = (letter, index) => {
    // Record position for the new letter
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

  // FIXED: Enhanced step completion with full state saving
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
      playCorrectSound();
      setShowHint(false);
      
      setTimeout(() => {
        speak(targetWord, { rate: 0.8, pitch: 1.2 });
        
        setTimeout(() => {
          if (onStepComplete) {
            // FIXED: Save complete state including grid layout
            onStepComplete(currentStep, {
              connectedLetters: dragPath,
              isCorrect: true,
              targetWord: targetWord,
              formedWord: formedWord,
              questionLetters: questionLetters, // FIXED: Save grid layout
              letterPositions: { ...letterPositions } // FIXED: Save positions
            });
          }
          
          // Check if this was the last question
          if (currentStep === totalQuestions - 1) {
            // Last question completed
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
      playWrongSound();
      setShowHint(true);
      
      setTimeout(() => {
        if (onStepComplete) {
          // FIXED: Save state even for incorrect attempts
          onStepComplete(currentStep, {
            connectedLetters: dragPath,
            isCorrect: false,
            targetWord: targetWord,
            formedWord: formedWord,
            questionLetters: questionLetters, // FIXED: Save grid layout
            letterPositions: { ...letterPositions } // FIXED: Save positions
          });
        }
        setIsProcessing(false);
        
        // Reset the connection after a short delay to allow retrying
        setTimeout(() => {
          setConnectedLetters([]);
          setDragPath([]);
        }, 1500);
      }, 1000);
    }
    
    resetDragState();
  };

  // Reset drag state
  const resetDragState = () => {
    setIsDrawing(false);
    setTempLine(null);
    setHoveredLetter(null);
    setDragStartLetter(null);
    setDragPath([]);
  };

  // Navigation functions
  const handleSentenceClick = () => {
    if (currentQuestion) {
      const sentence = currentQuestion.sentence.replace('____', currentQuestion.answer);
      speak(sentence, { rate: 0.8 });
    }
  };

  // Error state
  if (!content?.activityB?.questions || !currentQuestionData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: No questions found for word connection activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 bg-orange-50 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 text-center mb-4">
        <h3 className="text-xl font-bold text-orange-800 mb-1">
          {content.activityB.title || "Connect the Letters"}
        </h3>
        
        {/* Progress */}
        <div className="flex items-center justify-center space-x-3 mb-2">
          <span className="text-sm text-gray-600">
            Word {currentStep + 1}/{totalQuestions}
          </span>
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-orange-600">
            {Math.round(((currentStep + 1) / totalQuestions) * 100)}%
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Side - Image and Sentence */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg shadow-lg p-4 h-full flex flex-col">
            {/* Image placeholder */}
            <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4 flex-shrink-0">
              <div className="text-4xl">🖼️</div>
              <div className="ml-2 text-gray-600">
                <p className="text-xs">Image placeholder</p>
              </div>
            </div>
            
            {/* Sentence */}
            <div className="flex-1 flex items-center justify-center">
              <div 
                className="text-lg leading-relaxed cursor-pointer hover:bg-gray-50 p-3 rounded-lg text-center"
                onClick={handleSentenceClick}
              >
                <p className="mb-2">{currentQuestion.sentence}</p>
                <p className="text-xs text-gray-500">🔈 Click to hear</p>
                
                {/* Show hint when incorrect */}
                {showHint && !isCompleted && (
                  <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                    <p className="text-yellow-800 font-semibold text-sm mb-1">💡 Try Again!</p>
                    <p className="text-yellow-700 text-sm">
                      The word is: <span className="font-bold">{currentQuestion.answer.toUpperCase()}</span>
                    </p>
                  </div>
                )}
                
                {/* Show result when completed */}
                {isCompleted && (
                  <div className={`mt-3 p-2 rounded-lg ${
                    stepData.isCorrect ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
                  }`}>
                    <p className={`font-semibold text-sm ${
                      stepData.isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {stepData.isCorrect ? '✓ Correct!' : '✗ Not quite right'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Answer: {currentQuestion.answer.toUpperCase()}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Instruction */}
            <div className="flex justify-center items-center mt-4 flex-shrink-0">
              <div className="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-sm">
                {isCompleted ? 'Word completed' : isProcessing ? 'Processing...' : 'Drag to connect letters'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Letters and Connection Area */}
        <div className="w-80 flex-shrink-0">
          <div 
            ref={containerRef}
            className="bg-white rounded-lg shadow-lg p-4 h-full relative"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={resetDragState}
            style={{ overflow: 'hidden' }}
          >
            <h4 className="text-lg font-semibold text-center mb-3 text-gray-700">
              {isCompleted ? 'Completed Word' : 'Drag to Connect Letters'}
            </h4>
            
            {/* Letter Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4 relative z-20">
              {questionLetters.slice(0, 9).map((letter, index) => {
                const isConnected = connectedLetters.includes(letter);
                const isInDragPath = dragPath.includes(letter);
                const isHovered = hoveredLetter === letter && isDrawing;
                const isDragStart = dragStartLetter === letter && isDrawing;
                const isHighlighted = isConnected || isInDragPath || isHovered || isDragStart;
                
                return (
                  <div
                    key={`${letter}-${index}`}
                    className={`letter-container w-14 h-14 rounded-lg font-bold text-lg flex items-center justify-center cursor-pointer transition-all select-none relative z-30 ${
                      isCompleted
                        ? stepData.isCorrect
                          ? 'bg-green-200 text-green-800'
                          : 'bg-gray-200 text-gray-600'
                        : isProcessing
                          ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                          : isHighlighted
                            ? 'bg-orange-500 text-white shadow-lg scale-105'
                            : 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900 shadow-md hover:shadow-lg hover:scale-105'
                    }`}
                    data-letter-index={index}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleMouseDown(letter, e, index);
                    }}
                    style={{ 
                      boxShadow: isHighlighted ? '0 0 15px rgba(249, 115, 22, 0.6)' : undefined,
                      transform: isHighlighted ? 'scale(1.05)' : undefined,
                      userSelect: 'none',
                      pointerEvents: (isCompleted || isProcessing) ? 'none' : 'auto'
                    }}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
            
            {/* Word display */}
            <div className="text-center mb-4 relative z-20 bg-white p-2 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Connected:</p>
              <p className="text-lg font-bold text-blue-600">
                {connectedLetters.join('') || dragPath.join('') || 'None yet'}
              </p>
              <p className="text-xs text-gray-500">
                Target: {currentQuestion.answer.toUpperCase()}
              </p>
            </div>
            
            {/* Connection Lines - FIXED: Never show lines after completion */}
            <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
              {/* Final drawn path - only show during active drawing, not after completion */}
              {!isCompleted && isDrawing && dragPath.length > 1 && (
                <polyline
                  points={dragPath
                    .map(letter => {
                      const pos = letterPositions[letter];
                      return pos ? `${pos.x},${pos.y}` : null;
                    })
                    .filter(Boolean)
                    .join(" ")}
                  stroke="orange"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Temp line preview while dragging - only during active drawing */}
              {!isCompleted && isDrawing && tempLine && (
                <line
                  x1={tempLine.x1}
                  y1={tempLine.y1}
                  x2={tempLine.x2}
                  y2={tempLine.y2}
                  stroke="rgba(249, 115, 22, 0.5)"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};