// /app/lesson/components/useTextToSpeech.js
import { useState, useEffect, useRef } from 'react';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    // Check if Speech Synthesis is supported
    setIsSupported('speechSynthesis' in window);

    // Cleanup function
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (text, options = {}) => {
    if (!isSupported) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Configure speech options
    utterance.rate = options.rate || 0.8;        // Slower for children
    utterance.pitch = options.pitch || 1.1;      // Slightly higher pitch
    utterance.volume = options.volume || 1;      // Full volume
    utterance.lang = options.lang || 'en-US';    // English

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    };

    // Speak the text
    speechSynthesis.speak(utterance);
  };

  const stop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const pause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
  };

  const resume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  };

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isSupported
  };
};