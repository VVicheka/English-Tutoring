// /app/lesson/components/SpeakableComponents.jsx
import { useTextToSpeech } from './useTextToSpeech';

// Speakable Word Component
export const SpeakableWord = ({ 
  word, 
  emoji, 
  instruction, 
  className = "",
  speechOptions = {} 
}) => {
  const { speak, isSpeaking } = useTextToSpeech();

  const handleClick = () => {
    speak(word, {
      rate: 0.7,        // Slower for individual words
      pitch: 1.2,       // Higher pitch for words
      ...speechOptions
    });
  };

  return (
    <div 
      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${className}`}
      onClick={handleClick}
    >
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className={`text-2xl font-bold mb-2 ${isSpeaking ? 'text-green-600' : 'text-blue-800'}`}>
        {word}
      </h3>
      
      {/* Audio indicator */}
      <div className="flex items-center justify-center space-x-1 mb-2">
        <span className={`text-lg ${isSpeaking ? 'animate-pulse' : ''}`}>
          {isSpeaking ? '🔊' : '🔈'}
        </span>
        <span className="text-xs text-gray-600">
          {isSpeaking ? 'Speaking...' : 'Click to hear'}
        </span>
      </div>
      
      <p className="text-sm text-blue-600 italic">{instruction}</p>
    </div>
  );
};

// Speakable Sentence Component
export const SpeakableSentence = ({ 
  sentence, 
  index, 
  className = "",
  speechOptions = {} 
}) => {
  const { speak, isSpeaking } = useTextToSpeech();

  const handleClick = () => {
    speak(sentence, {
      rate: 0.8,        // Normal speed for sentences
      pitch: 1.0,       // Normal pitch for sentences
      ...speechOptions
    });
  };

  return (
    <p 
      className={`text-lg leading-relaxed mb-3 cursor-pointer hover:bg-green-50 rounded p-2 transition-all duration-200 ${
        isSpeaking ? 'bg-green-100 text-green-800' : 'text-gray-700'
      } ${className}`}
      onClick={handleClick}
    >
      {sentence}
      {isSpeaking && (
        <span className="ml-2 text-green-600 animate-pulse">🔊</span>
      )}
    </p>
  );
};

// Speakable Chant Component  
export const SpeakableChant = ({ 
  chant, 
  direction, 
  className = "",
  speechOptions = {} 
}) => {
  const { speak, isSpeaking } = useTextToSpeech();

  const handleChantClick = () => {
    speak(chant, {
      rate: 0.9,        // Slightly slower for chants
      pitch: 1.3,       // Higher pitch for chants (more playful)
      ...speechOptions
    });
  };

  const handleDirectionClick = () => {
    speak(direction, {
      rate: 0.8,
      pitch: 1.0,
      ...speechOptions
    });
  };

  return (
    <div className={`text-center ${className}`}>
      <div 
        className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 cursor-pointer hover:bg-yellow-100 transition-all duration-200"
        onClick={handleChantClick}
      >
        <p className={`text-xl font-semibold mb-4 ${isSpeaking ? 'text-green-600' : 'text-gray-700'}`}>
          "{chant}"
          {isSpeaking && <span className="ml-2 animate-pulse">🔊</span>}
        </p>
        
        <div className="flex items-center justify-center space-x-1 mb-3">
          <span className="text-sm text-yellow-600">
            {isSpeaking ? 'Speaking chant...' : 'Click to hear chant'}
          </span>
        </div>
      </div>
      
      <div 
        className="mt-4 cursor-pointer hover:text-blue-600 transition-colors duration-200"
        onClick={handleDirectionClick}
      >
        <p className="text-lg text-gray-600 italic">
          {direction}
          <span className="ml-2 text-sm">🔈 (click to hear)</span>
        </p>
      </div>
    </div>
  );
};

// Story with speakable sentences
export const SpeakableStory = ({ 
  sentences, 
  encouragement,
  className = "" 
}) => {
  const { speak, isSpeaking } = useTextToSpeech();

  const handleReadAll = () => {
    const fullStory = sentences.join(' ') + ' ' + encouragement;
    speak(fullStory, { rate: 0.8 });
  };

  return (
    <div className={`bg-green-50 border-2 border-green-200 rounded-lg p-6 ${className}`}>
      {/* Read All Button */}
      <div className="text-center mb-4">
        <button
          onClick={handleReadAll}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
            isSpeaking 
              ? 'bg-green-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isSpeaking ? '🔊 Reading Story...' : '📖 Read Whole Story'}
        </button>
      </div>

      {/* Individual sentences */}
      {sentences.map((sentence, index) => (
        <SpeakableSentence 
          key={index}
          sentence={sentence}
          index={index}
        />
      ))}
      
      <div className="mt-6 pt-4 border-t border-green-300">
        <SpeakableSentence 
          sentence={encouragement}
          className="text-green-700 font-semibold italic text-center"
        />
      </div>
    </div>
  );
};