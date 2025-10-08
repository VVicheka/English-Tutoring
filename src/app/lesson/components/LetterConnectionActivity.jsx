// Fixed LetterConnectionActivity - Responsive Layout + State Persistence
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

  // FIXED: Generate deterministic seed from answer
  const generateSeedFromAnswer = (answer, step) => {
    let seed = 0;
    const combined = `${answer}-${step}`;
    for (let i = 0; i < combined.length; i++) {
      seed = ((seed << 5) - seed + combined.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(seed);
  };

  // FIXED: Deterministic random number generator
  const createSeededRandom = (seed) => {
    let state = seed % 2147483647;
    if (state <= 0) state += 2147483646;
    
    return function() {
      state = (state * 16807) % 2147483647;
      return (state - 1) / 2147483646;
    };
  };

  // FIXED: Generate letters with deterministic placement patterns
  const generateLettersForQuestion = (answer, step) => {
    const answerLetters = answer.toUpperCase().split('');
    const grid = new Array(9).fill(null);
    
    // Create deterministic random generator
    const seed = generateSeedFromAnswer(answer, step);
    const seededRandom = createSeededRandom(seed);
    
    const placementStrategies = [
      [0, 1, 2, 5, 8, 7, 6, 3, 4], // Spiral clockwise
      [0, 3, 6, 7, 8, 5, 2, 1, 4], // Border clockwise
      [4, 1, 0, 3, 6, 7, 8, 5, 2], // Center outward spiral
      [0, 1, 4, 7, 6, 3, 2, 5, 8], // Snake pattern
      [2, 5, 8, 7, 4, 1, 0, 3, 6], // Diagonal sweep
      [6, 7, 8, 5, 2, 1, 0, 3, 4], // Bottom to top
      [8, 7, 6, 3, 0, 1, 2, 5, 4], // Reverse spiral
      [1, 4, 7, 6, 3, 0, 2, 5, 8], // Vertical wave
      [0, 2, 8, 6, 4, 1, 3, 5, 7], // Cross pattern
      [4, 0, 8, 2, 6, 1, 3, 5, 7], // Star pattern
    ];
    
    // Select strategy deterministically based on answer length and step
    const strategyIndex = (answerLetters.length + step) % placementStrategies.length;
    const strategy = placementStrategies[strategyIndex];
    
    // Place answer letters using selected strategy
    for (let i = 0; i < answerLetters.length && i < strategy.length; i++) {
      grid[strategy[i]] = answerLetters[i];
    }
    
    // Fill remaining positions with deterministic random letters
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
        
        // Fallback if we can't find a unique letter
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

  // FIXED: Create unique storage key for persistent state
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

  // FIXED: Generate letter positions from grid layout - responsive
  const generateLetterPositions = (letters) => {
    const positions = {};
    const letterSize = 56; // Base size for calculations
    const gap = 8; // Reduced gap for better fit
    const gridStartY = 60; // Reduced header space
    
    letters.forEach((letter, index) => {
      if (letter) {
        const row = Math.floor(index / 3);
        const col = index % 3;
        
        // Calculate position based on grid layout
        const x = col * (letterSize + gap) + letterSize / 2 + 12; // Reduced padding
        const y = row * (letterSize + gap) + letterSize / 2 + gridStartY;
        
        positions[letter] = { x, y };
      }
    });
    
    return positions;
  };

  // FIXED: Load and save persistent state
  useEffect(() => {
    if (typeof window !== 'undefined' && storageKey !== 'default-fillwords') {
      try {
        const saved = window.fillwordsActivityProgress?.[storageKey];
        if (saved && saved[currentStep]) {
          const stepSaved = saved[currentStep];
          console.log('Loading saved fillwords state for step:', currentStep, stepSaved);
          
          // Restore the exact same letter layout
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

  // FIXED: State persistence and restoration
  useEffect(() => {
    if (!hasLoaded || !currentQuestion) return;
    
    // Check if we have saved state for this step
    const saved = typeof window !== 'undefined' ? 
      window.fillwordsActivityProgress?.[storageKey]?.[currentStep] : null;
    
    if (saved && saved.questionLetters) {
      // Restore saved state
      console.log('Restoring saved state for step:', currentStep);
      setQuestionLetters(saved.questionLetters);
      setConnectedLetters(saved.connectedLetters || []);
      const positions = generateLetterPositions(saved.questionLetters);
      setLetterPositions(positions);
    } else {
      // Generate new state
      console.log('Generating new state for step:', currentStep);
      const newLetters = generateLettersForQuestion(currentQuestion.answer, currentStep);
      setQuestionLetters(newLetters);
      setConnectedLetters([]);
      const positions = generateLetterPositions(newLetters);
      setLetterPositions(positions);
      
      // Save initial state
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
    
    // Reset interaction state
    setDragPath([]);
    setIsProcessing(false);
    setShowHint(stepData ? !stepData.isCorrect : false);
  }, [currentStep, currentQuestion, hasLoaded, storageKey, stepData]);

  // FIXED: Save state whenever it changes
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
            // Save complete state including grid layout
            onStepComplete(currentStep, {
              connectedLetters: dragPath,
              isCorrect: true,
              targetWord: targetWord,
              formedWord: formedWord,
              questionLetters: questionLetters,
              letterPositions: { ...letterPositions }
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
          // Save state even for incorrect attempts
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

  // Show loading state
  if (!hasLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading word activity...</p>
        </div>
      </div>
    );
  }

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
    <div className="h-full flex flex-col bg-gradient-to-br from-orange-50 to-yellow-50 overflow-hidden">
      {/* FIXED: Compact header design */}
      <div className="flex-shrink-0 text-center py-3 px-4">
        <div className="bg-white rounded-lg shadow-sm p-3">
          <h3 className="text-lg font-bold text-orange-800 mb-2">
            {content.activityB.title || "Connect the Letters"}
          </h3>
          
          {/* Compact Progress */}
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-gray-700">Word</span>
              <div className="px-2 py-1 bg-orange-100 rounded-full">
                <span className="text-xs font-bold text-orange-800">
                  {currentStep + 1}/{totalQuestions}
                </span>
              </div>
            </div>
            
            <div className="flex-1 max-w-32">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
            
            <span className="text-xs font-semibold text-orange-600">
              {Math.round(((currentStep + 1) / totalQuestions) * 100)}%
            </span>
          </div>
          
          {/* Completion status */}
          {isCompleted && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              stepData.isCorrect 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {stepData.isCorrect ? 'Completed correctly' : 'Attempted'}
            </div>
          )}
        </div>
      </div>

      {/* FIXED: Main Content with better responsive layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 px-3 pb-3 min-h-0">
        {/* Left Side - Image and Sentence */}
        <div className="flex-1 min-w-0 lg:min-h-0">
          <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
            {/* FIXED: Smaller image placeholder */}
            <div className="w-full h-24 lg:h-32 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-3 flex-shrink-0 border border-gray-200">
              <div className="text-center">
                <div className="text-3xl mb-1">🖼️</div>
                <p className="text-xs text-gray-500">Image for: {currentQuestion.answer}</p>
              </div>
            </div>
            
            {/* Sentence */}
            <div className="flex-1 flex items-center justify-center">
              <div 
                className="text-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-all duration-200"
                onClick={handleSentenceClick}
              >
                <p className="text-base lg:text-lg leading-relaxed mb-2 text-gray-800">{currentQuestion.sentence}</p>
                <div className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700">
                  <span className="text-sm">🔈</span>
                  <span className="text-xs font-medium">Click to hear</span>
                </div>
                
                {/* Show hint when incorrect */}
                {showHint && !isCompleted && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 font-semibold text-sm mb-1">💡 Try Again!</p>
                    <p className="text-yellow-700 text-sm">
                      The word is: <span className="font-bold">{currentQuestion.answer.toUpperCase()}</span>
                    </p>
                  </div>
                )}
                
                {/* Show result when completed */}
                {isCompleted && (
                  <div className={`mt-3 p-3 rounded-lg border ${
                    stepData.isCorrect 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <p className={`font-semibold text-sm mb-1 ${
                      stepData.isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {stepData.isCorrect ? '✓ Correct!' : '✗ Not quite right'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Answer: <span className="font-bold">{currentQuestion.answer.toUpperCase()}</span>
                    </p>
                    {stepData.formedWord && stepData.formedWord !== stepData.targetWord && (
                      <p className="text-xs text-gray-500 mt-1">
                        You formed: <span className="font-medium">{stepData.formedWord}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* FIXED: Compact status indicator */}
            <div className="flex justify-center items-center mt-2 flex-shrink-0">
              <div className={`px-3 py-1 rounded-md text-xs font-medium ${
                isCompleted 
                  ? stepData.isCorrect
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                  : isProcessing 
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {isCompleted 
                  ? stepData.isCorrect 
                    ? 'Word completed correctly'
                    : 'Word attempted'
                  : isProcessing 
                    ? 'Processing your answer...'
                    : 'Drag to connect letters'
                }
              </div>
            </div>
          </div>
        </div>

        {/* FIXED: Right Side - Letters and Connection Area - responsive width */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
          <div 
            ref={containerRef}
            className="bg-white rounded-lg shadow-md p-4 h-full relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={resetDragState}
          >
            <h4 className="text-sm font-semibold text-center mb-3 text-gray-700">
              {isCompleted ? 'Completed Word' : 'Drag to Connect Letters'}
            </h4>
            
            {/* FIXED: Letter Grid - responsive sizing */}
            <div className="grid grid-cols-3 gap-2 mb-4 relative z-20 justify-items-center">
              {questionLetters.slice(0, 9).map((letter, index) => {
                const isConnected = connectedLetters.includes(letter);
                const isInDragPath = dragPath.includes(letter);
                const isHovered = hoveredLetter === letter && isDrawing;
                const isDragStart = dragStartLetter === letter && isDrawing;
                const isHighlighted = isConnected || isInDragPath || isHovered || isDragStart;
                
                return (
                  <div
                    key={`${letter}-${index}`}
                    className={`letter-container w-12 h-12 lg:w-14 lg:h-14 rounded-lg font-bold text-lg flex items-center justify-center cursor-pointer transition-all select-none relative z-30 ${
                      isCompleted
                        ? stepData.isCorrect
                          ? 'bg-green-200 text-green-800 shadow-sm'
                          : 'bg-gray-200 text-gray-600 shadow-sm'
                        : isProcessing
                          ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                          : isHighlighted
                            ? 'bg-orange-500 text-white shadow-lg scale-105 border border-orange-300'
                            : 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900 shadow-md hover:shadow-lg hover:scale-105 border border-yellow-600'
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
            
            {/* FIXED: Compact Word display */}
            <div className="text-center mb-4 relative z-20">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Connected Word</p>
                <p className="text-xl font-bold text-blue-600 mb-2 min-h-[28px] flex items-center justify-center">
                  {connectedLetters.join('') || dragPath.join('') || '---'}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    Target: <span className="font-bold text-gray-700">{currentQuestion.answer.toUpperCase()}</span>
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    connectedLetters.length > 0 || dragPath.length > 0
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {connectedLetters.length > 0 ? connectedLetters.length : dragPath.length || 0} / {currentQuestion.answer.length}
                  </span>
                </div>
              </div>
            </div>
            
            {/* FIXED: Compact Instructions */}
            <div className="text-center text-xs text-gray-600">
              {isCompleted ? (
                <div className="flex items-center justify-center space-x-2">
                  <span>{stepData.isCorrect ? '✅' : '❌'}</span>
                  <span>{stepData.isCorrect ? 'Perfect!' : 'Keep practicing!'}</span>
                </div>
              ) : isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                  <span>Checking your answer...</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <p>Drag from letter to letter to spell the word</p>
                  <p className="text-xs text-gray-400">Letters must be connected (adjacent)</p>
                </div>
              )}
            </div>
            
            {/* Connection Lines - Only show during active drawing */}
            <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
              {/* Active drawing path */}
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

              {/* Temp line preview */}
              {!isCompleted && isDrawing && tempLine && (
                <line
                  x1={tempLine.x1}
                  y1={tempLine.y1}
                  x2={tempLine.x2}
                  y2={tempLine.y2}
                  stroke="rgba(249, 115, 22, 0.6)"
                  strokeWidth="3"
                  strokeDasharray="6 3"
                  strokeLinecap="round"
                />
              )}
              
              {/* Line gradient definition */}
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