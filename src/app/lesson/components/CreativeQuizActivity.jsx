// Refactored CreativeQuizActivity - Parent-Controlled Navigation
import { useState, useEffect } from 'react';
import { useTextToSpeech } from './useTextToSpeech';

export const CreativeQuizActivity = ({ 
  content, 
  currentStep = 0,           // Parent controls which action we're on
  completedSteps = {},       // Parent tracks completed pairs {stepIndex: {selectedCharacter, isCorrect, correctAnswer}}
  onStepComplete,           // Notify parent when a pair is matched
  onComplete                // NEW: Notify parent when all steps are completed
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

  // Load completed step data when step changes
  useEffect(() => {
    const stepData = completedSteps[currentStep];
    if (stepData) {
      setSelectedCharacter(stepData.selectedCharacter);
      setShowResult(true);
      setIsCorrect(stepData.isCorrect);
    }
  }, [currentStep, completedSteps]);

  // NEW: Check for completion and notify parent
  useEffect(() => {
    if (!content?.actions || !onComplete) return;
    
    const totalSteps = content.actions.length;
    const completedCount = Object.keys(completedSteps).length;
    
    // Check if all steps are completed
    if (completedCount === totalSteps && completedCount > 0) {
      console.log('CreativeQuiz: All steps completed, calling onComplete');
      
      // Delay the completion callback to allow for final animations
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [completedSteps, content, onComplete]);

  const currentAction = content.actions[currentStep];
  const isLastAction = currentStep === content.actions.length - 1;
  const stepData = completedSteps[currentStep];
  const isCompleted = !!stepData;

  const handleCharacterClick = (character) => {
    // Don't allow changes to completed steps or while processing
    if (isCompleted || isProcessing) return;
    
    setIsProcessing(true);
    setSelectedCharacter(character);

    // Check if this is a correct match
    const correct = content.answers && content.answers[character.name] === currentAction;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playCorrectSound();
      setTimeout(() => {
        speak(character.name, { rate: 0.8 });
      }, 400);
    } else {
      // Find the correct character name
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

    // Notify parent of completion after sound/speech delay
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
    <div className="h-full flex flex-col rounded-lg">
      {/* Header */}
      <div className="text-center py-2">
        <h2 className="text-2xl font-bold text-gray-800">{content.title}</h2>
        
        {/* Progress */}
        <div className="flex items-center justify-center space-x-4">
          {/* <span className="text-sm text-gray-600">
            Action {currentStep + 1} of {content.actions.length}
          </span> */}
          
          {/* NEW: Completion indicator */}
          {allCompleted && (
            <span className="text-sm font-bold text-green-600">
              ✅ Quiz Complete!
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex space-x-6 p-2">
        {/* Left side - Current Action */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-xl font-bold text-blue-800 text-center">Who did this action?</h3>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-8">
              <div 
                className="text-center cursor-pointer hover:scale-105 transition-transform"
                onClick={handleActionClick}
              >
                <div className="text-6xl mb-4">
                  <div className="text-4xl mb-2">🖼️</div>
                </div>
                
                <div className={`rounded-lg p-4 mb-4 ${
                  allCompleted ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <p className={`text-2xl font-bold ${
                    allCompleted ? 'text-green-800' : 'text-blue-800'
                  }`}>{currentAction}</p>
                </div>
                
                <p className="text-gray-600">🔈 Click to hear action</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Characters */}
        <div className="w-80">
          <div className="bg-white rounded-lg shadow-lg h-full">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold text-blue-800 text-center">
                {isCompleted ? 'Your Answer:' : 'Choose a character:'}
              </h3>
            </div>
            
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {content.characters.map((character, index) => {
                const isSelected = selectedCharacter?.name === character.name;
                const isCorrectChoice = showResult && content.answers && content.answers[character.name] === currentAction;
                const isWrongChoice = showResult && isSelected && !isCorrect;
                
                return (
                  <div
                    key={index}
                    onClick={() => handleCharacterClick(character)}
                    className={`flex items-center space-x-3 p-3.5 rounded-lg transition-all ${
                      isCorrectChoice && showResult
                        ? 'bg-green-500 text-white shadow-lg'
                        : isWrongChoice
                          ? 'bg-red-500 text-white shadow-lg'
                          : isSelected
                            ? 'bg-blue-500 text-white shadow-lg'
                            : showResult || isProcessing
                              ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer'
                    }`}
                    style={{ 
                      cursor: (showResult || isProcessing) ? 'not-allowed' : 'pointer' 
                    }}
                  >
                    <span className="text-2xl">{character.emoji}</span>
                    <span className="font-semibold">{character.name}</span>
                    <span className="ml-auto text-sm">
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

      {/* Results Summary */}
      {Object.keys(completedSteps).length > 0 && (
        <div className="bg-white rounded-b-lg shadow-lg p-4 border-t">
          <h4 className="font-bold text-gray-800 mb-2">Your Matches:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {Object.entries(completedSteps).map(([stepIndex, stepData]) => (
              <div 
                key={stepIndex}
                className={`p-2 rounded ${
                  stepData.isCorrect 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <span className="font-semibold">{stepData.selectedCharacter.name}</span>
                <br />
                <span className="text-xs">{content.actions[stepIndex]}</span>
                <span className="ml-1">{stepData.isCorrect ? '✓' : '✗'}</span>
                {!stepData.isCorrect && (
                  <div className="text-xs text-gray-600 mt-1">
                    Correct: {stepData.correctAnswer}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* NEW: Enhanced completion message */}
          {allCompleted && (
            <div className="text-center mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-lg font-bold text-green-600">
                🎉 Quiz Complete! 
                {content.answers && (
                  <span className="ml-2">
                    Score: {Object.values(completedSteps).filter(step => step.isCorrect).length}/{content.actions.length}
                  </span>
                )}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Great job! Moving to next activity...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};