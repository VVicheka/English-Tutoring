// CreativeQuizActivity - Cohesive Design System
import { useState, useEffect } from 'react';
import { useTextToSpeech } from './useTextToSpeech';

// Design system constants
const DESIGN = {
  colors: {
    bg: 'from-emerald-100 via-green-100 to-lime-100',
    header: 'from-emerald-400 to-green-400',
    card: 'bg-white',
    action: 'from-blue-100 to-cyan-100',
  },
  character: {
    correct: 'bg-green-500',
    wrong: 'bg-red-500',
    selected: 'bg-blue-500',
    idle: 'bg-gray-100 hover:bg-gray-200',
    disabled: 'bg-gray-50',
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

export const CreativeQuizActivity = ({ 
  content, 
  currentStep = 0,
  completedSteps = {},
  onStepComplete,
  onComplete
}) => {
  const { speak } = useTextToSpeech();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sound functions
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

  // Reset selection when step changes
  useEffect(() => {
    setSelectedCharacter(null);
    setShowResult(false);
    setIsCorrect(false);
    setIsProcessing(false);
  }, [currentStep]);

  // Load completed step data
  useEffect(() => {
    const stepData = completedSteps[currentStep];
    if (stepData) {
      setSelectedCharacter(stepData.selectedCharacter);
      setShowResult(true);
      setIsCorrect(stepData.isCorrect);
    }
  }, [currentStep, completedSteps]);

  // Check for completion
  useEffect(() => {
    if (!content?.actions || !onComplete) return;
    
    const totalSteps = content.actions.length;
    const completedCount = Object.keys(completedSteps).length;
    
    if (completedCount === totalSteps && completedCount > 0) {
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [completedSteps, content, onComplete]);

  const currentAction = content.actions[currentStep];
  const stepData = completedSteps[currentStep];
  const isCompleted = !!stepData;

  const handleCharacterClick = (character) => {
    if (isCompleted || isProcessing) return;
    
    setIsProcessing(true);
    setSelectedCharacter(character);

    const correct = content.answers && content.answers[character.name] === currentAction;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playCorrectSound();
      setTimeout(() => {
        speak(character.name, { rate: 0.8 });
      }, 400);
    } else {
      const correctCharacterName = content.answers 
        ? Object.keys(content.answers).find(char => content.answers[char] === currentAction)
        : null;
      
      playWrongSound();
      setTimeout(() => {
        if (correctCharacterName) {
          speak(correctCharacterName, { rate: 0.8 });
        }
      }, 300);
    }

    setTimeout(() => {
      if (onStepComplete) {
        onStepComplete(currentStep, {
          selectedCharacter: character,
          isCorrect: correct,
          correctAnswer: correct 
            ? character.name 
            : Object.keys(content.answers || {}).find(char => content.answers[char] === currentAction)
        });
      }
      setIsProcessing(false);
    }, 2000);
  };

  const handleActionClick = () => {
    speak(currentAction, { rate: 0.8 });
  };

  // Calculate completion status
  const totalSteps = content?.actions?.length || 0;
  const completedCount = Object.keys(completedSteps).length;
  const allCompleted = completedCount === totalSteps && totalSteps > 0;

  return (
    <div className={`h-full flex flex-col bg-gradient-to-br ${DESIGN.colors.bg} p-3 rounded-2xl overflow-hidden`}>
      {/* Header - Ultra Compact */}
      <div className={`flex-shrink-0 bg-gradient-to-r ${DESIGN.colors.header} rounded-xl px-3 py-1.5 mb-2 ${DESIGN.shadows.card} border border-white`}>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-xl">🎯</span>
          <h2 className="text-base md:text-lg font-black text-white">{content.title}</h2>
          
          {allCompleted && (
            <span className="ml-2 px-2 py-1 bg-white rounded-full text-green-600 font-black text-xs">
              ✓ Done!
            </span>
          )}
        </div>
      </div>

      {/* Main Content - Fit to screen */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0 overflow-hidden">
        {/* Left - Action Card (45%) */}
        <div className="flex-1 lg:w-[45%] min-h-0 overflow-hidden">
          <div className={`${DESIGN.colors.card} rounded-2xl h-full flex flex-col ${DESIGN.shadows.card} overflow-hidden`}>
            {/* Card Header - Compact */}
            <div className={`bg-gradient-to-r ${DESIGN.colors.action} px-3 py-2 border-b-2 border-white flex-shrink-0`}>
              <h3 className="text-sm font-black text-blue-800 text-center">Who did this action?</h3>
            </div>
            
            {/* Card Content - Compact */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              <div 
                onClick={handleActionClick}
                className={`text-center cursor-pointer ${DESIGN.transitions} transform hover:scale-105 w-full`}
              >
                {/* Image Placeholder - Smaller */}
                <div className="w-full max-w-[200px] mx-auto aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center mb-3 border-2 border-white shadow-md">
                  <div className="text-center">
                    <div className="text-4xl mb-1">🖼️</div>
                    <p className="text-xs text-gray-600 font-medium">Action</p>
                  </div>
                </div>
                
                {/* Action Text - Compact */}
                <div className={`rounded-xl px-3 py-2 mb-3 ${DESIGN.shadows.button} ${
                  allCompleted ? 'bg-gradient-to-r from-green-100 to-emerald-100' : 'bg-gradient-to-r from-blue-100 to-cyan-100'
                }`}>
                  <p className={`text-lg md:text-xl font-black ${
                    allCompleted ? 'text-green-800' : 'text-blue-800'
                  }`}>
                    {currentAction}
                  </p>
                </div>
                
                {/* Speaker Button - Compact */}
                <button className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm ${DESIGN.transitions} ${DESIGN.shadows.button} bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white mx-auto`}>
                  <span className="text-base">🔈</span>
                  <span>Hear it</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Characters (55%) */}
        <div className="flex-1 lg:w-[55%] min-h-0 overflow-hidden">
          <div className={`${DESIGN.colors.card} rounded-2xl h-full flex flex-col ${DESIGN.shadows.card} overflow-hidden`}>
            {/* Characters Header - Compact */}
            <div className={`bg-gradient-to-r from-green-400 to-emerald-400 px-3 py-2 border-b-2 border-white flex-shrink-0`}>
              <h3 className="text-sm font-black text-white text-center">
                {isCompleted ? '✓ Your Answer' : '👆 Choose Character'}
              </h3>
            </div>
            
            {/* Characters List - Scrollable if needed */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-2">
                {content.characters.map((character, index) => {
                  const isSelected = selectedCharacter?.name === character.name;
                  const isCorrectChoice = showResult && content.answers && content.answers[character.name] === currentAction;
                  const isWrongChoice = showResult && isSelected && !isCorrect;
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handleCharacterClick(character)}
                      className={`flex items-center space-x-3 p-3 rounded-xl ${DESIGN.transitions} ${
                        isCorrectChoice && showResult
                          ? `${DESIGN.character.correct} text-white ${DESIGN.shadows.card} transform scale-105`
                          : isWrongChoice
                            ? `${DESIGN.character.wrong} text-white ${DESIGN.shadows.card}`
                            : isSelected
                              ? `${DESIGN.character.selected} text-white ${DESIGN.shadows.button}`
                              : showResult || isProcessing
                                ? `${DESIGN.character.disabled} text-gray-400 cursor-not-allowed`
                                : `${DESIGN.character.idle} text-gray-800 cursor-pointer ${DESIGN.shadows.button} hover:scale-105`
                      }`}
                      style={{ 
                        cursor: (showResult || isProcessing) ? 'not-allowed' : 'pointer' 
                      }}
                    >
                      {/* Emoji - Smaller */}
                      <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                        isCorrectChoice || isWrongChoice || isSelected ? 'bg-white bg-opacity-20' : 'bg-gray-200'
                      }`}>
                        <span className="text-2xl">{character.emoji}</span>
                      </div>
                      
                      {/* Name - Smaller */}
                      <span className="flex-1 font-black text-sm">{character.name}</span>
                      
                      {/* Status Icon - Smaller */}
                      <span className="text-lg">
                        {showResult && isCorrectChoice ? '✓' : 
                         showResult && isWrongChoice ? '✗' : 
                         isProcessing ? '⏳' : '🔈'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};