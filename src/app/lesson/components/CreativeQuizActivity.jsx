// /app/lesson/components/CreativeQuizActivity.jsx
import { useState } from 'react';
import { useTextToSpeech } from './useTextToSpeech';

export const CreativeQuizActivity = ({ content }) => {
  const { speak } = useTextToSpeech();
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [matches, setMatches] = useState({});
  const [correctMatches, setCorrectMatches] = useState(new Set());

  // Convert actions to action objects with emojis/images
  const actionImages = {
    // Lesson 1 actions
    "Found the map": "🗺️🔍",
    "Sat on the hat": "🎩💺", 
    "Flew with the bat": "🦇✈️",
    "Played with the cat": "🐱🎮",
    "Slept on the mat": "🛏️😴",
    
    // Lesson 2 actions
    "Slept in the bed": "🛏️😴",
    "Wrote with a pen": "🖊️✍️",
    "Pecked like a hen": "🐔🌾",
    "Got caught in a net": "🥅🎣",
    "Sat near the red bed": "🛏️❤️",
    
    // Lesson 3 actions
    "Dropped the fig": "🍈⬇️",
    "Sat in a bin": "🗑️💺",
    "Wore a lid on the head": "🧢👤",
    "Ran after the pig": "🐷🏃",
    "Found a fig on the lid": "🍈🧢",
    
    // Add more action mappings as needed
    "default": "🎭✨"
  };

  const getActionEmoji = (action) => {
    return actionImages[action] || actionImages["default"];
  };

  const currentAction = content.actions[currentActionIndex];
  const isLastAction = currentActionIndex === content.actions.length - 1;

  const handleCharacterClick = (character) => {
    speak(character.name, { rate: 0.8 });
    setSelectedCharacter(selectedCharacter?.name === character.name ? null : character);
  };

  const handleActionClick = () => {
    speak(currentAction, { rate: 0.8 });
  };

  const handleMatch = () => {
    if (!selectedCharacter) return;

    // Check if this is a correct match (if answers are provided)
    const isCorrect = content.answers && content.answers[selectedCharacter.name] === currentAction;
    
    // Store the match
    setMatches(prev => ({
      ...prev,
      [currentAction]: selectedCharacter
    }));

    if (isCorrect) {
      setCorrectMatches(prev => new Set([...prev, currentAction]));
    }

    // Move to next action or finish
    if (isLastAction) {
      // Quiz complete
      speak("Great job! You completed the quiz!", { rate: 0.8, pitch: 1.2 });
    } else {
      setCurrentActionIndex(prev => prev + 1);
    }
    
    setSelectedCharacter(null);
  };

  const resetQuiz = () => {
    setCurrentActionIndex(0);
    setSelectedCharacter(null);
    setMatches({});
    setCorrectMatches(new Set());
  };

  const goToPreviousAction = () => {
    if (currentActionIndex > 0) {
      setCurrentActionIndex(prev => prev - 1);
      setSelectedCharacter(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-red-50 rounded-lg">
      {/* Header */}
      <div className="text-center py-6 bg-white rounded-t-lg shadow-sm">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{content.title}</h2>
        <p className="text-red-600 text-lg italic mb-4">{content.instruction}</p>
        
        {/* Progress */}
        <div className="flex items-center justify-center space-x-4">
          <span className="text-sm text-gray-600">
            Action {currentActionIndex + 1} of {content.actions.length}
          </span>
          <button
            onClick={resetQuiz}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      <div className="flex-1 flex p-6 space-x-6">
        {/* Left side - Current Action */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-red-800 text-center mb-4">Who did this action?</h3>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-8">
              <div 
                className="text-center cursor-pointer hover:scale-105 transition-transform"
                onClick={handleActionClick}
              >
                {/* Action Emoji/Image */}
                <div className="text-6xl mb-4">
                  {getActionEmoji(currentAction)}
                </div>
                
                {/* Action Text */}
                <div className="bg-blue-100 rounded-lg p-4 mb-4">
                  <p className="text-2xl font-bold text-blue-800">{currentAction}</p>
                </div>
                
                <p className="text-gray-600">🔈 Click to hear action</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="p-4 border-t flex justify-between">
              <button
                onClick={goToPreviousAction}
                disabled={currentActionIndex === 0}
                className={`px-4 py-2 rounded font-semibold ${
                  currentActionIndex === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                ← Previous
              </button>
              
              <button
                onClick={handleMatch}
                disabled={!selectedCharacter}
                className={`px-6 py-2 rounded font-semibold ${
                  selectedCharacter
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLastAction ? 'Finish Quiz' : 'Next Action'} →
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Characters */}
        <div className="w-80">
          <div className="bg-white rounded-lg shadow-lg h-full">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold text-red-800 text-center">Choose a character:</h3>
              {selectedCharacter && (
                <p className="text-center text-sm text-green-600 mt-2">
                  Selected: {selectedCharacter.name}
                </p>
              )}
            </div>
            
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {content.characters.map((character, index) => (
                <div
                  key={index}
                  onClick={() => handleCharacterClick(character)}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedCharacter?.name === character.name
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  <span className="text-2xl">{character.emoji}</span>
                  <span className="font-semibold">{character.name}</span>
                  <span className="ml-auto text-sm">🔈</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {Object.keys(matches).length > 0 && (
        <div className="bg-white rounded-b-lg shadow-lg p-4 border-t">
          <h4 className="font-bold text-gray-800 mb-2">Your Matches:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {Object.entries(matches).map(([action, character]) => (
              <div 
                key={action}
                className={`p-2 rounded ${
                  correctMatches.has(action) 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                <span className="font-semibold">{character.name}</span>
                <br />
                <span className="text-xs">{action}</span>
                {correctMatches.has(action) && <span className="ml-1">✓</span>}
              </div>
            ))}
          </div>
          
          {Object.keys(matches).length === content.actions.length && (
            <div className="text-center mt-4">
              <p className="text-lg font-bold text-green-600">
                🎉 Quiz Complete! 
                {content.answers && (
                  <span className="ml-2">
                    Score: {correctMatches.size}/{content.actions.length}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};