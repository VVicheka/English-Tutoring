// /app/lesson/components/LetterConnectionActivity.jsx - Fixed Drag-to-Connect
import { useState, useEffect, useRef, useMemo } from 'react';
import { useTextToSpeech } from './useTextToSpeech';

export const LetterConnectionActivity = ({ content }) => {
  const { speak } = useTextToSpeech();
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  // Create a unique storage key
  const storageKey = useMemo(() => {
    if (!content?.activityB?.questions) return 'default-word-connection';
    const wordsString = content.activityB.questions.map(q => q.answer).sort().join('-');
    return `word-connection-${wordsString}`;
  }, [content]);

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

  // Generate letters ensuring the word can be formed through adjacent connections
  const generateLettersForQuestion = (answer) => {
    const answerLetters = answer.toUpperCase().split('');
    const grid = new Array(9).fill(null);
    
    // Place answer letters in a path that allows adjacent connections
    const placementStrategies = [
      [0, 1, 2, 5, 8, 7, 6, 3, 4], // Top row then spiral
      [0, 3, 6, 7, 8, 5, 2, 1, 4], // Left column then around
      [4, 1, 0, 3, 6, 7, 8, 5, 2], // Center out
      [0, 1, 4, 7, 6, 3, 2, 5, 8], // Snake pattern
    ];
    
    const strategy = placementStrategies[Math.floor(Math.random() * placementStrategies.length)];
    
    // Place answer letters first
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [connectedLetters, setConnectedLetters] = useState([]);
  const [connections, setConnections] = useState([]);
  const [completedWords, setCompletedWords] = useState(new Set());
  const [questionLetters, setQuestionLetters] = useState([]);
  const [letterPositions, setLetterPositions] = useState({});
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // Drag state
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempLine, setTempLine] = useState(null);
  const [hoveredLetter, setHoveredLetter] = useState(null);
  const [dragStartLetter, setDragStartLetter] = useState(null);

  // Load progress
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.wordConnectionProgress?.[storageKey];
        if (saved) {
          setCompletedWords(new Set(saved.completedWords || []));
          setCurrentQuestionIndex(saved.currentQuestionIndex || 0);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
    setHasLoaded(true);
  }, [storageKey]);

  // Save progress
  useEffect(() => {
    if (!hasLoaded || !content?.activityB?.questions) return;
    
    try {
      const progressData = {
        completedWords: Array.from(completedWords),
        currentQuestionIndex
      };
      
      if (typeof window !== 'undefined') {
        if (!window.wordConnectionProgress) {
          window.wordConnectionProgress = {};
        }
        window.wordConnectionProgress[storageKey] = progressData;
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [completedWords, currentQuestionIndex, storageKey, hasLoaded, content]);

  // Generate letters for current question
  useEffect(() => {
    if (content?.activityB?.questions?.[currentQuestionIndex]) {
      const question = content.activityB.questions[currentQuestionIndex];
      setQuestionLetters(generateLettersForQuestion(question.answer));
      setConnections([]);
      setConnectedLetters([]);
      setLetterPositions({});
    }
  }, [currentQuestionIndex, content]);

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
    if (completedWords.has(currentQuestionIndex)) return;
    
    // If no connections yet, can start from any letter
    if (connectedLetters.length === 0) {
      console.log('Starting first connection from:', letter);
    } else {
      // Can only continue from the last connected letter
      if (letter !== connectedLetters[connectedLetters.length - 1]) {
        console.log('Can only drag from last connected letter:', connectedLetters[connectedLetters.length - 1]);
        return;
      }
      console.log('Continuing from last connected letter:', letter);
    }
    
    console.log('Starting drag from:', letter);
    setIsDrawing(true);
    setDragStartLetter(letter);
    
    const rect = event.target.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (containerRect) {
      const x = rect.left + rect.width / 2 - containerRect.left;
      const y = rect.top + rect.height / 2 - containerRect.top;
      
      setLetterPositions(prev => ({
        ...prev,
        [letter]: { x, y }
      }));
      
      console.log('Set starting position for', letter, 'at', x, y);
    }
  };

  // Handle mouse move
  const handleMouseMove = (event) => {
    if (!isDrawing || !dragStartLetter) return;
    
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
        
        // Check if this is a valid target
        if (!connectedLetters.includes(letter) && letter !== dragStartLetter) {
          if (connectedLetters.length === 0) {
            // First connection - any letter is valid (except the starting letter)
            currentHovered = letter;
          } else {
            // For subsequent connections, must be adjacent to the drag start letter (which should be the last connected)
            const dragStartIndex = questionLetters.indexOf(dragStartLetter);
            if (areAdjacent(dragStartIndex, index)) {
              currentHovered = letter;
            }
          }
        }
      }
    });
    
    setHoveredLetter(currentHovered);
    
    // Draw temp line from starting position
    const startPos = letterPositions[dragStartLetter];
    if (startPos) {
      setTempLine({
        x1: startPos.x,
        y1: startPos.y,
        x2: x,
        y2: y
      });
    }
  };

  // Handle drag end
  const handleMouseUp = (letter, event, index) => {
    if (!isDrawing || !dragStartLetter) {
      setIsDrawing(false);
      setTempLine(null);
      setHoveredLetter(null);
      setDragStartLetter(null);
      return;
    }
    
    console.log('Mouse up on:', letter, 'dragging from:', dragStartLetter);
    
    if (connectedLetters.includes(letter) || letter === dragStartLetter) {
      console.log('Invalid target - already connected or same as start');
      setIsDrawing(false);
      setTempLine(null);
      setHoveredLetter(null);
      setDragStartLetter(null);
      return;
    }
    
    // Record letter position
    const rect = event.target.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (containerRect) {
      const x = rect.left + rect.width / 2 - containerRect.left;
      const y = rect.top + rect.height / 2 - containerRect.top;
      
      setLetterPositions(prev => ({
        ...prev,
        [letter]: { x, y }
      }));
      
      let isValidConnection = false;
      
      if (connectedLetters.length === 0) {
        // First letter - always valid if we're starting from it
        if (dragStartLetter === letter) {
          // This shouldn't happen, but just in case
          setIsDrawing(false);
          setTempLine(null);
          setHoveredLetter(null);
          setDragStartLetter(null);
          return;
        }
        isValidConnection = true;
        setConnectedLetters([dragStartLetter, letter]);
        
        // Create connection
        const startPos = letterPositions[dragStartLetter];
        if (startPos) {
          const newConnection = {
            from: dragStartLetter,
            to: letter,
            x1: startPos.x,
            y1: startPos.y,
            x2: x,
            y2: y,
            id: `${dragStartLetter}-${letter}-${Date.now()}`
          };
          
          setConnections(prev => [...prev, newConnection]);
          console.log('Created first connection:', newConnection);
        }
        
      } else {
        // For subsequent connections, check if adjacent to the drag start letter
        const dragStartIndex = questionLetters.indexOf(dragStartLetter);
        console.log('Checking adjacency between dragStart index', dragStartIndex, 'and target index', index);
        
        if (areAdjacent(dragStartIndex, index)) {
          isValidConnection = true;
          
          // Create connection from drag start letter to this letter
          const fromPos = letterPositions[dragStartLetter];
          
          if (fromPos) {
            const newConnection = {
              from: dragStartLetter,
              to: letter,
              x1: fromPos.x,
              y1: fromPos.y,
              x2: x,
              y2: y,
              id: `${dragStartLetter}-${letter}-${Date.now()}`
            };
            
            setConnections(prev => [...prev, newConnection]);
            console.log('Created connection:', newConnection);
          }
          
          setConnectedLetters(prev => [...prev, letter]);
        } else {
          console.log('Not adjacent to drag start letter');
        }
      }
      
      if (!isValidConnection) {
        console.log('Invalid connection - not adjacent');
        playWrongSound();
      } else {
        // Check if word is complete
        const currentQuestion = content.activityB.questions[currentQuestionIndex];
        const targetWord = currentQuestion.answer.toUpperCase();
        const formedWord = connectedLetters.length === 0 ? 
          [dragStartLetter, letter].join('') : 
          [...connectedLetters, letter].join('');
        
        console.log('Formed word:', formedWord, 'Target:', targetWord);
        
        if (formedWord === targetWord) {
          console.log('Word completed!');
          playCorrectSound();
          setCompletedWords(prev => new Set([...prev, currentQuestionIndex]));
          
          setTimeout(() => {
            speak(targetWord, { rate: 0.8, pitch: 1.2 });
            
            setTimeout(() => {
              if (currentQuestionIndex < content.activityB.questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
              }
            }, 1500);
          }, 500);
        }
      }
    }
    
    setIsDrawing(false);
    setTempLine(null);
    setHoveredLetter(null);
    setDragStartLetter(null);
  };

  // Get current question
  const currentQuestion = content?.activityB?.questions?.[currentQuestionIndex];
  const totalQuestions = content?.activityB?.questions?.length || 0;
  const allCompleted = completedWords.size === totalQuestions;

  const handleSentenceClick = () => {
    if (currentQuestion) {
      const sentence = currentQuestion.sentence.replace('____', currentQuestion.answer);
      speak(sentence, { rate: 0.8 });
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (!hasLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading word connection activity...</p>
        </div>
      </div>
    );
  }

  if (!content?.activityB?.questions || !currentQuestion) {
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
      {/* Compact Header */}
      <div className="flex-shrink-0 text-center mb-4">
        <h3 className="text-xl font-bold text-orange-800 mb-1">
          {content.activityB.title || "Connect the Letters"}
        </h3>
        
        {/* Progress */}
        <div className="flex items-center justify-center space-x-3 mb-2">
          <span className="text-sm text-gray-600">
            {currentQuestionIndex + 1}/{totalQuestions}
          </span>
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-orange-600">
            {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
          </span>
        </div>

        {allCompleted && (
          <div className="p-2 bg-green-100 border border-green-300 rounded-lg">
            <p className="text-green-700 font-semibold text-sm">
              All words completed! Excellent work!
            </p>
          </div>
        )}
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
                
                {completedWords.has(currentQuestionIndex) && (
                  <div className="mt-3 p-2 bg-green-100 rounded-lg">
                    <p className="text-green-700 font-semibold text-sm">
                      ✓ Word: {currentQuestion.answer.toUpperCase()}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-4 flex-shrink-0">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                ← Prev
              </button>
              
              <div className="px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-sm">
                Drag to connect
              </div>
              
              <button
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex >= totalQuestions - 1}
                className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                  currentQuestionIndex >= totalQuestions - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Letters and Connection Area */}
        <div className="w-80 flex-shrink-0">
          <div 
            ref={containerRef}
            className="bg-white rounded-lg shadow-lg p-4 h-full relative"
            onMouseMove={handleMouseMove}
            onMouseUp={() => {
              setIsDrawing(false);
              setTempLine(null);
              setHoveredLetter(null);
            }}
            onMouseLeave={() => {
              setIsDrawing(false);
              setTempLine(null);
              setHoveredLetter(null);
            }}
            style={{ overflow: 'hidden' }}
          >
            <h4 className="text-lg font-semibold text-center mb-3 text-gray-700">
              Drag to Connect Letters
            </h4>
            
            {/* Letter Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4 relative z-20">
              {questionLetters.slice(0, 9).map((letter, index) => {
                const isConnected = connectedLetters.includes(letter);
                const isHovered = hoveredLetter === letter && isDrawing;
                const isDragStart = dragStartLetter === letter && isDrawing;
                
                return (
                  <div
                    key={`${letter}-${index}`}
                    className={`letter-container w-14 h-14 rounded-lg font-bold text-lg flex items-center justify-center cursor-pointer transition-all select-none relative z-30 ${
                      completedWords.has(currentQuestionIndex)
                        ? 'bg-green-200 text-green-800'
                        : isConnected || isHovered || isDragStart
                          ? 'bg-orange-500 text-white shadow-lg scale-105'
                          : 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900 shadow-md hover:shadow-lg hover:scale-105'
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleMouseDown(letter, e, index);
                    }}
                    onMouseUp={(e) => {
                      e.preventDefault();
                      handleMouseUp(letter, e, index);
                    }}
                    style={{ 
                      boxShadow: (isConnected || isHovered || isDragStart) ? '0 0 15px rgba(249, 115, 22, 0.6)' : undefined,
                      transform: (isConnected || isHovered || isDragStart) ? 'scale(1.05)' : undefined,
                      userSelect: 'none'
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
                {connectedLetters.join('') || 'None yet'}
              </p>
              <p className="text-xs text-gray-500">
                Target: {currentQuestion.answer.toUpperCase()}
              </p>
            </div>
            
            {/* Enhanced Connection lines */}
            <svg
              ref={svgRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 5 }}
            >
              <defs>
                {/* Enhanced gradient for connection lines */}
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#F97316', stopOpacity: 0.9 }} />
                  <stop offset="50%" style={{ stopColor: '#EAB308', stopOpacity: 0.8 }} />
                  <stop offset="100%" style={{ stopColor: '#F97316', stopOpacity: 0.9 }} />
                </linearGradient>
                
                {/* Glow effect for lines */}
                <filter id="lineGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                {/* Arrow marker for direction */}
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon
                    points="0 0, 8 3, 0 6"
                    fill="#F97316"
                    fillOpacity="0.8"
                  />
                </marker>
              </defs>
              
              {/* Enhanced connection lines */}
              {connections.map((connection, index) => (
                <g key={connection.id}>
                  {/* Shadow/glow line */}
                  <line
                    x1={connection.x1}
                    y1={connection.y1}
                    x2={connection.x2}
                    y2={connection.y2}
                    stroke="rgba(249, 115, 22, 0.3)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    filter="url(#lineGlow)"
                  />
                  
                  {/* Main connection line with animation */}
                  <line
                    x1={connection.x1}
                    y1={connection.y1}
                    x2={connection.x2}
                    y2={connection.y2}
                    stroke="url(#connectionGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    markerEnd="url(#arrowhead)"
                    strokeDasharray="0"
                  >
                    {/* Animated drawing effect */}
                    <animate
                      attributeName="stroke-dasharray"
                      values="0,100;100,0"
                      dur="0.8s"
                      begin="0s"
                      fill="freeze"
                    />
                  </line>
                  
                  {/* Enhanced connection points */}
                  <circle
                    cx={connection.x1}
                    cy={connection.y1}
                    r="4"
                    fill="#F97316"
                    stroke="white"
                    strokeWidth="2"
                    fillOpacity="0.9"
                  >
                    <animate
                      attributeName="r"
                      values="2;4;3"
                      dur="0.5s"
                      begin="0s"
                      fill="freeze"
                    />
                  </circle>
                  
                  <circle
                    cx={connection.x2}
                    cy={connection.y2}
                    r="4"
                    fill="#EAB308"
                    stroke="white"
                    strokeWidth="2"
                    fillOpacity="0.9"
                  >
                    <animate
                      attributeName="r"
                      values="2;4;3"
                      dur="0.5s"
                      begin="0.3s"
                      fill="freeze"
                    />
                  </circle>
                  
                  {/* Flowing animation along the line */}
                  <circle r="2" fill="#FFFFFF" fillOpacity="0.8">
                    <animateMotion
                      dur="1.5s"
                      repeatCount="indefinite"
                      begin={`${index * 0.2}s`}
                    >
                      <path d={`M${connection.x1},${connection.y1} L${connection.x2},${connection.y2}`}/>
                    </animateMotion>
                  </circle>
                </g>
              ))}
              
              {/* Temporary line while dragging */}
              {tempLine && (
                <line
                  x1={tempLine.x1}
                  y1={tempLine.y1}
                  x2={tempLine.x2}
                  y2={tempLine.y2}
                  stroke="rgba(156, 163, 175, 0.6)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="6,3"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;9;0"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </line>
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};