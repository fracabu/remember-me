
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MicIcon, StopCircleIcon, LoaderIcon } from './icons';

// Type definitions for the Web Speech API to avoid TypeScript errors.
// These interfaces are based on the MDN documentation for robust typing.
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

// Extend the global Window interface to let TypeScript know about the SpeechRecognition API.
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

interface RecorderProps {
  onTranscript: (transcript: string) => void;
  isProcessing: boolean;
}

// Get the browser's implementation of the SpeechRecognition API.
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognitionAPI;

export const Recorder: React.FC<RecorderProps> = ({ onTranscript, isProcessing }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = navigator.language || 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        onTranscript(lastResult[0].transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}. Please check microphone permissions.`);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Cleanup function to stop recognition on component unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current.onend = null; // Prevent onend from firing after unmount
        recognitionRef.current = null;
      }
    };
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      // The onend event will set isListening to false
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (e) {
         setError("Could not start recording. Please allow microphone access.");
         console.error("Error starting recognition:", e);
      }
    }
  }, [isListening]);

  if (!isSpeechRecognitionSupported) {
    return (
      <div className="text-center p-4 bg-yellow-100 border border-yellow-400 rounded-md text-yellow-800">
        <p>Sorry, your browser doesn't support voice commands.</p>
      </div>
    );
  }
  
  const getButtonState = () => {
    if (isProcessing) {
      return {
        icon: <LoaderIcon className="h-10 w-10 animate-spin" />,
        text: 'Processing...',
        disabled: true,
        className: 'bg-gray-400 cursor-not-allowed',
      };
    }
    if (isListening) {
      return {
        icon: <StopCircleIcon className="h-10 w-10" />,
        text: 'Listening... Click to Stop',
        disabled: false,
        className: 'bg-red-500 hover:bg-red-600',
      };
    }
    return {
      icon: <MicIcon className="h-10 w-10" />,
      text: 'Tap to Speak',
      disabled: false,
      className: 'bg-brand-secondary hover:bg-brand-primary',
    };
  };

  const buttonState = getButtonState();

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        type="button"
        onClick={toggleListening}
        disabled={buttonState.disabled}
        className={`flex items-center justify-center h-24 w-24 rounded-full text-white transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4 focus:ring-opacity-75 focus:ring-brand-secondary ${buttonState.className}`}
        aria-label={buttonState.text}
      >
        {buttonState.icon}
      </button>
      <p className="text-slate-500 h-5">{buttonState.text}</p>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};
