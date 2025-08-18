// /app/lesson/components/DragableMatchingActivity.jsx
import { useState } from 'react';
import { useTextToSpeech } from './useTextToSpeech';

export const DragableMatchingActivity = ({ content }) => {
  const { speak } = useTextToSpeech();
  const [draggedWord, setDraggedWord] = useState(null);
  const [dropZones, setDropZones] = useState({});
  const [correctMatches, setCorrectMatches] = useState(new Set());

  const handleDragStart = (e, word) => {
    setDraggedWord(word);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetEmoji) => {
    e.preventDefault();
    
    if (!draggedWord) return;

    // Find the correct match for this emoji
    const correctPair = content.activityA.pairs.find(pair => pair.emoji === targetEmoji);
    const isCorrect = correctPair && correctPair.word === draggedWord;

    // Update drop zones
    setDropZones(prev => ({
      ...prev,
      [targetEmoji]: draggedWord
    }));

    // Track correct matches
    if (isCorrect) {
      setCorrectMatches(prev => new Set([...prev, targetEmoji]));
      // Speak the word when correctly matched
      speak(draggedWord, { rate: 0.7, pitch: 1.2 });
    }

    setDraggedWord(null);
  };

  const handleWordClick = (word) => {
    speak(word, { rate: 0.7, pitch: 1.2 });
  };

  const handleImageClick = (emoji, word) => {
    // Find the word that matches this emoji
    const correctPair = content.activityA.pairs.find(pair => pair.emoji === emoji);
    if (correctPair) {
      speak(correctPair.word, { rate: 0.7, pitch: 1.2 });
    }
  };

  const resetActivity = () => {
    setDropZones({});
    setCorrectMatches(new Set());
    setDraggedWord(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-purple-800 mb-2">{content.activityA.title}</h3>
        <p className="text-purple-600 text-lg italic mb-4">{content.activityA.instruction}</p>
        <button
          onClick={resetActivity}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm"
        >
          🔄 Reset
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Images with Drop Zones */}
        <div className="flex-1 bg-blue-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-4 gap-6 h-full">
            {content.activityA.pairs.map((pair, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* Image */}
                <div 
                  className="w-24 h-24 bg-white rounded-lg shadow-md flex items-center justify-center mb-4 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleImageClick(pair.emoji, pair.word)}
                >
                  <span className="text-4xl">{pair.emoji}</span>
                </div>

                {/* Drop Zone */}
                <div
                  className={`w-32 h-12 border-2 border-dashed rounded-lg flex items-center justify-center text-lg font-semibold transition-all ${
                    correctMatches.has(pair.emoji) 
                      ? 'bg-green-100 border-green-400 text-green-700' 
                      : dropZones[pair.emoji]
                        ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, pair.emoji)}
                >
                  {dropZones[pair.emoji] || 'Drop here'}
                  {correctMatches.has(pair.emoji) && <span className="ml-2">✓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Draggable Words */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-semibold text-center mb-4 text-gray-700">Drag the words to match:</h4>
          <div className="flex justify-center space-x-4">
            {content.activityA.pairs.map((pair, index) => {
              const isUsed = Object.values(dropZones).includes(pair.word);
              return (
                <div
                  key={index}
                  draggable={!isUsed}
                  onDragStart={(e) => handleDragStart(e, pair.word)}
                  onClick={() => handleWordClick(pair.word)}
                  className={`px-6 py-3 rounded-lg font-semibold text-lg cursor-pointer transition-all ${
                    isUsed 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' 
                      : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 hover:scale-105 shadow-md'
                  }`}
                  style={{
                    opacity: draggedWord === pair.word ? 0.5 : 1
                  }}
                >
                  {pair.word}
                  {!isUsed && <span className="ml-2 text-sm">🔈</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="text-center mt-4">
          <p className="text-lg text-gray-600">
            Matched: {correctMatches.size} / {content.activityA.pairs.length}
            {correctMatches.size === content.activityA.pairs.length && (
              <span className="ml-3 text-green-600 font-bold">🎉 Well done!</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};