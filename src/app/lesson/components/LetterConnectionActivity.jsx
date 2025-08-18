// /app/lesson/components/LetterConnectionActivity.jsx
import { useState } from 'react';
import { useTextToSpeech } from './useTextToSpeech';

export const LetterConnectionActivity = ({ content }) => {
  const { speak } = useTextToSpeech();
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [connections, setConnections] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState(new Set());

  // Get unique letters from all answers
  const getAllLetters = () => {
    const answers = content.activityB.questions.map(q => q.answer.toUpperCase());
    const allLetters = answers.join('').split('');
    const uniqueLetters = [...new Set(allLetters)].sort();
    
    // Add some random letters to make it challenging
    const extraLetters = ['X', 'Y', 'Z', 'Q', 'V'].filter(l => !uniqueLetters.includes(l));
    return [...uniqueLetters, ...extraLetters.slice(0, 3)].slice(0, 9); // Max 9 letters
  };

  const letters = getAllLetters();

  const handleLetterClick = (letter) => {
    speak(letter, { rate: 0.8, pitch: 1.1 });
    setSelectedLetter(selectedLetter === letter ? null : letter);
  };

  const handleBlankClick = (questionIndex, blankIndex) => {
    if (!selectedLetter) return;

    const question = content.activityB.questions[questionIndex];
    const answer = question.answer.toUpperCase();
    const correctLetter = answer[blankIndex];

    const connectionKey = `${questionIndex}-${blankIndex}`;
    
    // Update connections
    setConnections(prev => ({
      ...prev,
      [connectionKey]: selectedLetter
    }));

    // Check if correct
    if (selectedLetter === correctLetter) {
      setCorrectAnswers(prev => new Set([...prev, connectionKey]));
      speak(question.answer, { rate: 0.8 });
    }

    setSelectedLetter(null);
  };

  const handleSentenceClick = (question) => {
    const completeSentence = question.sentence.replace('____', question.answer);
    speak(completeSentence, { rate: 0.8 });
  };

  const resetActivity = () => {
    setConnections({});
    setCorrectAnswers(new Set());
    setSelectedLetter(null);
  };

  const getBlankDisplay = (questionIndex, blankIndex) => {
    const connectionKey = `${questionIndex}-${blankIndex}`;
    const letter = connections[connectionKey];
    const isCorrect = correctAnswers.has(connectionKey);
    
    return {
      letter: letter || '',
      isCorrect,
      isFilled: !!letter
    };
  };

  return (
    <div className="h-full flex flex-col bg-orange-50 rounded-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-orange-800 mb-2">{content.activityB.title}</h3>
        <p className="text-orange-600 text-lg italic mb-4">{content.activityB.instruction}</p>
        <button
          onClick={resetActivity}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm"
        >
          🔄 Reset
        </button>
      </div>

      <div className="flex-1 flex">
        {/* Left side - Sentences with blanks */}
        <div className="flex-1 pr-8">
          <div className="bg-white rounded-lg shadow-lg p-6 h-full">
            <div className="space-y-6">
              {content.activityB.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="border-b pb-4 last:border-b-0">
                  {/* Sentence with clickable blanks */}
                  <div 
                    className="text-xl leading-relaxed cursor-pointer hover:bg-gray-50 p-2 rounded"
                    onClick={() => handleSentenceClick(question)}
                  >
                    {question.sentence.split('____').map((part, partIndex) => (
                      <span key={partIndex}>
                        {part}
                        {partIndex < question.sentence.split('____').length - 1 && (
                          <span className="inline-flex space-x-1 mx-2">
                            {question.answer.split('').map((_, blankIndex) => {
                              const display = getBlankDisplay(questionIndex, blankIndex);
                              return (
                                <span
                                  key={blankIndex}
                                  className={`inline-block w-8 h-8 border-2 border-dashed text-center leading-8 text-lg font-bold cursor-pointer transition-all ${
                                    display.isCorrect 
                                      ? 'bg-green-100 border-green-400 text-green-700' 
                                      : display.isFilled
                                        ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                                        : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBlankClick(questionIndex, blankIndex);
                                  }}
                                >
                                  {display.letter}
                                </span>
                              );
                            })}
                          </span>
                        )}
                      </span>
                    ))}
                    <span className="ml-2 text-sm text-gray-500">🔈</span>
                  </div>
                  
                  {/* Show answer when complete */}
                  {question.answer.split('').every((_, blankIndex) => 
                    correctAnswers.has(`${questionIndex}-${blankIndex}`)
                  ) && (
                    <div className="mt-2 text-green-600 font-semibold">
                      ✓ Complete! Word: {question.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Letter grid */}
        <div className="w-72">
          <div className="bg-white rounded-lg shadow-lg p-6 h-full">
            <h4 className="text-lg font-semibold text-center mb-4 text-gray-700">Choose letters:</h4>
            
            <div className="grid grid-cols-3 gap-3">
              {letters.map((letter, index) => (
                <button
                  key={index}
                  onClick={() => handleLetterClick(letter)}
                  className={`w-16 h-16 rounded-lg font-bold text-xl transition-all hover:scale-105 ${
                    selectedLetter === letter
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>

            {selectedLetter && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Selected: <span className="font-bold text-blue-600">{selectedLetter}</span></p>
                <p className="text-xs text-gray-500">Click on a blank to place it</p>
              </div>
            )}

            {/* Progress */}
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600">
                Correct: {correctAnswers.size} / {content.activityB.questions.reduce((total, q) => total + q.answer.length, 0)}
              </div>
              
              {correctAnswers.size === content.activityB.questions.reduce((total, q) => total + q.answer.length, 0) && (
                <div className="mt-2 text-green-600 font-bold">🎉 Perfect!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};