// /app/lesson/components/ActivityComponents.jsx
import { 
  SpeakableWord, 
  SpeakableSentence, 
  SpeakableChant, 
  SpeakableStory 
} from './speakableComponents';
import { useTextToSpeech } from './useTextToSpeech';

// Warm-Up Activity with Speech
export const WarmUpActivity = ({ content }) => (
  <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{content.title}</h2>
      <SpeakableChant 
        chant={content.chant}
        direction={content.direction}
      />
    </div>
  </div>
);

// Vocabulary Activity with Speech
export const VocabularyActivity = ({ content }) => (
  <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{content.title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {content.words.map((wordItem, index) => (
        <SpeakableWord
          key={index}
          word={wordItem.word}
          emoji={wordItem.emoji}
          instruction={wordItem.instruction}
          className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center"
        />
      ))}
    </div>
  </div>
);

// Story Activity with Speech
export const StoryActivity = ({ content }) => (
  <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{content.title}</h2>
    <SpeakableStory 
      sentences={content.sentences}
      encouragement={content.encouragement}
    />
  </div>
);

// Practice Activity with Speech  
export const PracticeActivity = ({ content }) => (
  <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{content.title}</h2>
    
    {/* Activity A - Matching with Speech */}
    <div className="mb-8 bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-purple-800 mb-4">{content.activityA.title}</h3>
      <SpeakableSentence 
        sentence={content.activityA.instruction}
        className="text-purple-600 mb-4 italic"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {content.activityA.pairs.map((pair, index) => (
          <SpeakableWord
            key={index}
            word={pair.word}
            emoji={pair.emoji}
            instruction=""
            className="bg-white border border-purple-300 rounded-lg p-4 text-center"
          />
        ))}
      </div>
    </div>

    {/* Activity B - Fill-in-the-Blank with Speech */}
    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-orange-800 mb-4">{content.activityB.title}</h3>
      <SpeakableSentence 
        sentence={content.activityB.instruction}
        className="text-orange-600 mb-4 italic"
      />
      <div className="space-y-3">
        {content.activityB.questions.map((question, index) => (
          <SpeakableFillBlank
            key={index}
            sentence={question.sentence}
            answer={question.answer}
            index={index}
          />
        ))}
      </div>
    </div>
  </div>
);

// Fill-in-the-Blank Component with Speech
const SpeakableFillBlank = ({ 
  sentence, 
  answer, 
  index,
  className = "" 
}) => {
  const { speak, isSpeaking } = useTextToSpeech();

  const handleSentenceClick = () => {
    // Replace blank with answer for speech
    const completeText = sentence.replace('____', answer);
    speak(completeText, { rate: 0.8 });
  };

  const handleAnswerClick = () => {
    speak(answer, { rate: 0.7, pitch: 1.2 });
  };

  return (
    <div className={`bg-white border border-orange-300 rounded p-3 ${className}`}>
      <p 
        className={`text-lg cursor-pointer hover:bg-orange-50 rounded p-1 transition-all duration-200 ${
          isSpeaking ? 'bg-orange-100 text-orange-800' : ''
        }`}
        onClick={handleSentenceClick}
      >
        {sentence}
        {isSpeaking && <span className="ml-2 text-orange-600 animate-pulse">🔊</span>}
      </p>
      
      <div className="mt-2 flex items-center space-x-2">
        <span className="text-sm text-gray-500">Answer:</span>
        <span 
          className="text-sm font-semibold text-green-600 cursor-pointer hover:text-green-700 underline"
          onClick={handleAnswerClick}
        >
          {answer} 🔈
        </span>
      </div>
    </div>
  );
};

// Quiz Activity (existing code with some speech features)
export const QuizActivity = ({ content }) => (
  <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{content.title}</h2>
    
    {content.type === 'multiple-choice' ? (
      // Checkpoint Quiz
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <SpeakableSentence 
          sentence={content.instruction}
          className="text-red-600 mb-6 italic text-center"
        />
        <div className="space-y-6">
          {content.questions.map((question, index) => (
            <div key={index} className="bg-white border border-red-300 rounded-lg p-4">
              <SpeakableSentence 
                sentence={`${index + 1}. ${question.question}`}
                className="text-lg font-semibold mb-3"
              />
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name={`question-${index}`} value={option} className="text-red-500" />
                    <span 
                      className={`cursor-pointer hover:text-blue-600 ${optionIndex === question.correctIndex ? 'font-semibold text-green-600' : ''}`}
                      onClick={() => {
                        const { speak } = useTextToSpeech();
                        speak(option, { rate: 0.8 });
                      }}
                    >
                      {option} 🔈
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      // Character Matching Quiz
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <SpeakableSentence 
          sentence={content.instruction}
          className="text-red-600 mb-6 italic text-center"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Characters */}
          <div>
            <h3 className="text-lg font-bold text-red-800 mb-4">Characters:</h3>
            <div className="space-y-3">
              {content.characters.map((character, index) => (
                <SpeakableSentence
                  key={index}
                  sentence={character.name}
                  className="bg-white border border-red-300 rounded-lg p-3 flex items-center space-x-3"
                  speechOptions={{ rate: 0.8 }}
                />
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div>
            <h3 className="text-lg font-bold text-red-800 mb-4">Actions:</h3>
            <div className="space-y-3">
              {content.actions.map((action, index) => (
                <SpeakableSentence
                  key={index}
                  sentence={action}
                  className="bg-white border border-red-300 rounded-lg p-3"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

// Wrap-Up Activity with Speech
export const WrapUpActivity = ({ content }) => (
  <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{content.title}</h2>
    <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-6 text-center">
      <SpeakableChant 
        chant={content.chant}
        direction={content.instruction}
      />
      <div className="border-t border-pink-300 pt-4 mt-4">
        <p className="text-pink-700 font-semibold">Homework:</p>
        <SpeakableSentence 
          sentence={content.homework}
          className="text-gray-600"
        />
      </div>
    </div>
  </div>
);