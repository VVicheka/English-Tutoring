// QuizQuestionComponents.jsx
// Interactive quiz question types for AI-generated personalized quizzes

"use client";
import { useState, useEffect } from 'react';
import { useTextToSpeech } from './useTextToSpeech';

/**
 * Multiple Choice Question Component
 * Interactive bubble-style answer selection
 */
export const MultipleChoiceQuestion = ({ 
  question, 
  options, 
  correctAnswer, 
  onAnswer, 
  showResult = false,
  userAnswer = null 
}) => {
  const [selected, setSelected] = useState(userAnswer);
  const [isRevealed, setIsRevealed] = useState(showResult);
  const { speak } = useTextToSpeech();

  const handleSelect = (option) => {
    if (isRevealed) return; // Don't allow changes after reveal
    
    setSelected(option);
    speak(option);
    
    if (onAnswer) {
      onAnswer(option, option === correctAnswer);
    }
  };

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const getOptionStyle = (option) => {
    if (!isRevealed) {
      // Before reveal
      return selected === option
        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
        : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50 hover:scale-102';
    } else {
      // After reveal
      if (option === correctAnswer) {
        return 'border-green-500 bg-green-50 shadow-lg';
      } else if (option === selected && option !== correctAnswer) {
        return 'border-red-500 bg-red-50 shadow-lg';
      } else {
        return 'border-gray-200 bg-gray-50 opacity-60';
      }
    }
  };

  const getOptionIcon = (option) => {
    if (!isRevealed) {
      return selected === option ? (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-full"></div>
        </div>
      ) : (
        <div className="w-8 h-8 border-2 border-gray-400 rounded-full"></div>
      );
    } else {
      if (option === correctAnswer) {
        return <span className="text-4xl">✅</span>;
      } else if (option === selected && option !== correctAnswer) {
        return <span className="text-4xl">❌</span>;
      } else {
        return <div className="w-8 h-8 border-2 border-gray-300 rounded-full"></div>;
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-3xl mx-auto">
      {/* Question */}
      <div className="mb-8">
        <button
          onClick={() => speak(question)}
          className="w-full text-left group"
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 text-5xl group-hover:animate-bounce">
              🎯
            </div>
            <h2 className="text-3xl font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">
              {question}
            </h2>
          </div>
        </button>
      </div>

      {/* Options */}
      <div className="space-y-4">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(option)}
            disabled={isRevealed}
            className={`w-full p-6 rounded-2xl border-4 transition-all duration-300 transform ${getOptionStyle(option)} ${
              isRevealed ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <div className="flex items-center space-x-4">
              {getOptionIcon(option)}
              <span className="text-2xl font-bold text-gray-800">{option}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Check Answer Button */}
      {!isRevealed && selected && (
        <button
          onClick={handleReveal}
          className="mt-6 w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-2xl font-bold text-xl shadow-lg transform hover:scale-105 transition-all animate-pulse"
        >
          Check Answer ✨
        </button>
      )}

      {/* Result Message */}
      {isRevealed && (
        <div className={`mt-6 p-6 rounded-2xl ${
          selected === correctAnswer 
            ? 'bg-green-50 border-4 border-green-300' 
            : 'bg-orange-50 border-4 border-orange-300'
        }`}>
          <div className="flex items-center space-x-3">
            <span className="text-4xl">
              {selected === correctAnswer ? '🎉' : '💪'}
            </span>
            <p className="text-xl font-bold text-gray-800">
              {selected === correctAnswer 
                ? 'Awesome! You got it right!' 
                : `Good try! The answer is: ${correctAnswer}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Emoji Matching Question Component
 * Match emoji to word with visual feedback
 */
export const EmojiMatchQuestion = ({ 
  emoji, 
  word, 
  options, 
  onAnswer,
  showResult = false,
  userAnswer = null 
}) => {
  const [selected, setSelected] = useState(userAnswer);
  const [isRevealed, setIsRevealed] = useState(showResult);
  const { speak } = useTextToSpeech();

  const handleSelect = (option) => {
    if (isRevealed) return;
    
    setSelected(option);
    speak(option);
    
    if (onAnswer) {
      onAnswer(option, option === word);
    }
  };

  const handleReveal = () => {
    setIsRevealed(true);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-3xl mx-auto">
      {/* Emoji Display */}
      <div className="text-center mb-8">
        <div className="inline-block p-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl shadow-lg transform hover:scale-110 transition-transform">
          <span className="text-9xl">{emoji}</span>
        </div>
        <p className="mt-4 text-2xl font-bold text-gray-600">
          What word matches this?
        </p>
      </div>

      {/* Word Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((option, index) => {
          const isCorrect = option === word;
          const isSelected = selected === option;
          
          let buttonStyle = 'border-gray-300 hover:border-purple-300 hover:bg-gray-50';
          let iconStyle = '🔘';
          
          if (isRevealed) {
            if (isCorrect) {
              buttonStyle = 'border-green-500 bg-green-50 shadow-lg';
              iconStyle = '✅';
            } else if (isSelected && !isCorrect) {
              buttonStyle = 'border-red-500 bg-red-50 shadow-lg';
              iconStyle = '❌';
            } else {
              buttonStyle = 'border-gray-200 bg-gray-50 opacity-60';
            }
          } else if (isSelected) {
            buttonStyle = 'border-purple-500 bg-purple-50 shadow-lg scale-105';
            iconStyle = '⭐';
          }
          
          return (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              disabled={isRevealed}
              className={`p-6 rounded-2xl border-4 transition-all duration-300 transform hover:scale-105 ${buttonStyle}`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{iconStyle}</div>
                <span className="text-2xl font-bold text-gray-800">{option}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Check Answer Button */}
      {!isRevealed && selected && (
        <button
          onClick={handleReveal}
          className="mt-6 w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl font-bold text-xl shadow-lg transform hover:scale-105 transition-all animate-pulse"
        >
          Check Answer! 🎯
        </button>
      )}

      {/* Result */}
      {isRevealed && (
        <div className={`mt-6 p-6 rounded-2xl text-center ${
          selected === word 
            ? 'bg-green-50 border-4 border-green-300' 
            : 'bg-orange-50 border-4 border-orange-300'
        }`}>
          <div className="text-5xl mb-3">
            {selected === word ? '🎊' : '📚'}
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {selected === word 
              ? `Perfect! ${emoji} = ${word}` 
              : `${emoji} = ${word}. Keep practicing!`}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Drag and Drop Question Component
 * Drag letters to form words
 */
export const DragDropQuestion = ({ 
  word, 
  scrambledLetters, 
  emoji,
  onAnswer,
  showResult = false 
}) => {
  const [droppedLetters, setDroppedLetters] = useState([]);
  const [availableLetters, setAvailableLetters] = useState(scrambledLetters || word.split('').sort(() => Math.random() - 0.5));
  const [isRevealed, setIsRevealed] = useState(showResult);
  const { speak } = useTextToSpeech();

  const handleLetterClick = (letter, index) => {
    if (isRevealed) return;
    
    // Move from available to dropped
    setDroppedLetters([...droppedLetters, letter]);
    setAvailableLetters(availableLetters.filter((_, i) => i !== index));
    speak(letter);
  };

  const handleDroppedClick = (index) => {
    if (isRevealed) return;
    
    // Move back from dropped to available
    const letter = droppedLetters[index];
    setAvailableLetters([...availableLetters, letter]);
    setDroppedLetters(droppedLetters.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    setAvailableLetters(scrambledLetters || word.split('').sort(() => Math.random() - 0.5));
    setDroppedLetters([]);
    setIsRevealed(false);
  };

  const handleCheck = () => {
    const formedWord = droppedLetters.join('');
    const isCorrect = formedWord.toLowerCase() === word.toLowerCase();
    
    setIsRevealed(true);
    
    if (onAnswer) {
      onAnswer(formedWord, isCorrect);
    }
    
    if (isCorrect) {
      speak(`Correct! ${word}`);
    } else {
      speak(`Try again! The word is ${word}`);
    }
  };

  const formedWord = droppedLetters.join('');
  const isCorrect = formedWord.toLowerCase() === word.toLowerCase();

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-3xl mx-auto">
      {/* Emoji */}
      <div className="text-center mb-6">
        <div className="inline-block p-6 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl shadow-lg">
          <span className="text-8xl">{emoji}</span>
        </div>
        <p className="mt-4 text-xl font-bold text-gray-600">
          Drag the letters to spell the word!
        </p>
      </div>

      {/* Drop Zone */}
      <div className="mb-8">
        <div className="flex justify-center items-center space-x-2 min-h-24 p-4 bg-gray-100 rounded-2xl border-4 border-dashed border-gray-300">
          {droppedLetters.length === 0 ? (
            <p className="text-gray-400 text-xl font-medium">Drop letters here...</p>
          ) : (
            droppedLetters.map((letter, index) => (
              <button
                key={index}
                onClick={() => handleDroppedClick(index)}
                disabled={isRevealed}
                className={`w-16 h-16 ${
                  isRevealed && isCorrect
                    ? 'bg-green-400'
                    : isRevealed && !isCorrect
                    ? 'bg-red-400'
                    : 'bg-blue-400 hover:bg-blue-500'
                } text-white rounded-xl text-3xl font-bold shadow-lg transform hover:scale-110 transition-all`}
              >
                {letter}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Available Letters */}
      <div className="mb-6">
        <p className="text-center text-lg font-medium text-gray-600 mb-3">
          Available Letters:
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {availableLetters.map((letter, index) => (
            <button
              key={index}
              onClick={() => handleLetterClick(letter, index)}
              disabled={isRevealed}
              className="w-16 h-16 bg-purple-400 hover:bg-purple-500 text-white rounded-xl text-3xl font-bold shadow-lg transform hover:scale-110 transition-all active:scale-95"
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isRevealed && droppedLetters.length > 0 && (
          <>
            <button
              onClick={handleClear}
              className="flex-1 py-3 bg-gray-400 hover:bg-gray-500 text-white rounded-2xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
            >
              🔄 Clear
            </button>
            <button
              onClick={handleCheck}
              disabled={droppedLetters.length !== word.length}
              className={`flex-1 py-3 rounded-2xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all ${
                droppedLetters.length === word.length
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white animate-pulse'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              ✓ Check
            </button>
          </>
        )}
      </div>

      {/* Result */}
      {isRevealed && (
        <div className={`mt-6 p-6 rounded-2xl text-center ${
          isCorrect 
            ? 'bg-green-50 border-4 border-green-300' 
            : 'bg-orange-50 border-4 border-orange-300'
        }`}>
          <div className="text-5xl mb-3">
            {isCorrect ? '🎉' : '💪'}
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-3">
            {isCorrect 
              ? 'Perfect spelling!' 
              : `The correct word is: ${word}`}
          </p>
          <button
            onClick={handleClear}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all"
          >
            Try Again 🔄
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Picture Choice Question Component
 * Choose the correct picture for a word
 */
export const PictureChoiceQuestion = ({ 
  word, 
  pictures, // [{emoji, isCorrect}, ...]
  onAnswer,
  showResult = false,
  userAnswer = null 
}) => {
  const [selected, setSelected] = useState(userAnswer);
  const [isRevealed, setIsRevealed] = useState(showResult);
  const { speak } = useTextToSpeech();

  const handleSelect = (index) => {
    if (isRevealed) return;
    
    setSelected(index);
    speak(word);
    
    if (onAnswer) {
      onAnswer(index, pictures[index].isCorrect);
    }
  };

  const handleReveal = () => {
    setIsRevealed(true);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-4xl mx-auto">
      {/* Word Display */}
      <div className="text-center mb-8">
        <button
          onClick={() => speak(word)}
          className="inline-block group"
        >
          <div className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg transform group-hover:scale-110 transition-all">
            <span className="text-5xl font-black text-white">{word}</span>
          </div>
        </button>
        <p className="mt-4 text-xl font-bold text-gray-600">
          Which picture shows this word?
        </p>
      </div>

      {/* Picture Options */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {pictures.map((pic, index) => {
          const isSelected = selected === index;
          const isCorrect = pic.isCorrect;
          
          let cardStyle = 'border-gray-300 hover:border-blue-400 hover:shadow-xl';
          let overlayContent = null;
          
          if (isRevealed) {
            if (isCorrect) {
              cardStyle = 'border-green-500 bg-green-50 shadow-2xl';
              overlayContent = <div className="absolute top-2 right-2 text-5xl">✅</div>;
            } else if (isSelected && !isCorrect) {
              cardStyle = 'border-red-500 bg-red-50 shadow-2xl';
              overlayContent = <div className="absolute top-2 right-2 text-5xl">❌</div>;
            } else {
              cardStyle = 'border-gray-200 opacity-50';
            }
          } else if (isSelected) {
            cardStyle = 'border-blue-500 bg-blue-50 shadow-2xl scale-105';
            overlayContent = <div className="absolute top-2 right-2 text-4xl">⭐</div>;
          }
          
          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={isRevealed}
              className={`relative p-8 rounded-3xl border-4 transition-all duration-300 transform hover:scale-105 ${cardStyle}`}
            >
              <span className="text-8xl">{pic.emoji}</span>
              {overlayContent}
            </button>
          );
        })}
      </div>

      {/* Check Answer Button */}
      {!isRevealed && selected !== null && (
        <button
          onClick={handleReveal}
          className="mt-8 w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-2xl font-bold text-xl shadow-lg transform hover:scale-105 transition-all animate-pulse"
        >
          Check Answer! 🎯
        </button>
      )}

      {/* Result */}
      {isRevealed && (
        <div className={`mt-8 p-6 rounded-2xl text-center ${
          pictures[selected]?.isCorrect 
            ? 'bg-green-50 border-4 border-green-300' 
            : 'bg-orange-50 border-4 border-orange-300'
        }`}>
          <div className="text-5xl mb-3">
            {pictures[selected]?.isCorrect ? '🎊' : '📖'}
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {pictures[selected]?.isCorrect 
              ? `Yes! ${pictures.find(p => p.isCorrect).emoji} = ${word}` 
              : `The correct answer is ${pictures.find(p => p.isCorrect).emoji}`}
          </p>
        </div>
      )}
    </div>
  );
};

// Named exports only - no default export with object
// Use like: import { MultipleChoiceQuestion } from './QuizQuestionComponents';