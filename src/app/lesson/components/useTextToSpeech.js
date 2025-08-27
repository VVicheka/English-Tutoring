// /app/lesson/components/useTextToSpeech.js - Improved with better error handling
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

    if (!text || text.trim() === '') {
      console.warn('Empty text provided to speech synthesis');
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    // Small delay to ensure previous speech is cancelled
    setTimeout(() => {
      try {
        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(text.trim());
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
          // Don't log empty error objects, they're usually not critical
          if (error && error.error && error.error !== 'interrupted') {
            console.warn('Speech synthesis error:', error.error);
          }
          setIsSpeaking(false);
        };

        utterance.onpause = () => {
          // Keep speaking state true when paused
        };

        utterance.onresume = () => {
          setIsSpeaking(true);
        };

        // Speak the text
        speechSynthesis.speak(utterance);

        // Fallback: if speech doesn't start in 1 second, reset state
        setTimeout(() => {
          if (!speechSynthesis.speaking && isSpeaking) {
            setIsSpeaking(false);
          }
        }, 1000);

      } catch (err) {
        console.error('Error creating speech utterance:', err);
        setIsSpeaking(false);
      }
    }, 100);
  };

  const stop = () => {
    try {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } catch (err) {
      console.warn('Error stopping speech:', err);
      setIsSpeaking(false);
    }
  };

  const pause = () => {
    try {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
      }
    } catch (err) {
      console.warn('Error pausing speech:', err);
    }
  };

  const resume = () => {
    try {
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
      }
    } catch (err) {
      console.warn('Error resuming speech:', err);
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