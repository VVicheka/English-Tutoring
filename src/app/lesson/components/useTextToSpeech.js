import { useState, useEffect, useRef } from "react";

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);

      const femaleVoices = availableVoices.filter (v =>
        v.name.includes('Female') ||
        v.name.includes('Samantha') ||
        v.name.includes('Zira')
      );
      console.log('Female voices found: ', femaleVoices.map(v => v.name));
    };

    loadVoices(); // Load immediately (for firefox and some browser)
    speechSynthesis.onvoiceschanged = loadVoices; // Load when ready (for chrome)

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

    speechSynthesis.cancel();

    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text.trim());
        utteranceRef.current = utterance;

        const femaleVoice = voices.find(voice =>
          voice.name.includes('Samantha') ||
          voice.name === 'Google US English Female' ||
          voice.name.includes('Zira') ||
          voice.name.includes('Female') ||
          voice.name.includes('Victoria') ||
          voice.name.includes('Karen')
        );

        if (femaleVoice) {
          utterance.voice = femaleVoice;
          console.log('Using female voice:', femaleVoice.name);
        } else {
          console.warn('No female voice found, using default');
        }

        utterance.rate = options.rate || 0.75; // Change Reading Speed
        utterance.pitch = options.pitch || 1.1;
        utterance.volume = options.volume || 1;
        utterance.lang = options.lang || 'en-US';

        // Event handlers
        utterance.onstart = () => {
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
        };

        utterance.onerror = (error) => {
          if (error && error.error && error.error !== 'interrupted') {
            console.warn('Speech synthesis error:', error.error);
          }
          setIsSpeaking(false);
        };

        utterance.onpause = () => {

        };

        utterance.onresume = () => {
          setIsSpeaking(true);
        };

        speechSynthesis.speak(utterance);

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
      
    } catch (err) {
      console.warn('Error stopping speech:', err);
      setIsSpeaking(false);
    }
  };

  const resume = () => {
    try {
      if (speechSynthesis.pause) {
        speechSynthesis.resume();
      }
    } catch (err) {
      console.warn('Error resuming speech:', err);
    }
  }

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isSupported
  };
};