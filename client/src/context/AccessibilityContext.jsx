import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AccessibilityContext = createContext(null);

export const AccessibilityProvider = ({ children }) => {
  // 1. Initial state from localStorage for instantaneous zero-FOUC rendering
  const [fontSize, setFontSizeState] = useState(() => {
    return localStorage.getItem('careconnect_font_size') || 'normal';
  });

  const [highContrast, setHighContrastState] = useState(() => {
    return localStorage.getItem('careconnect_high_contrast') === 'true';
  });

  const [voiceGuidance, setVoiceGuidanceState] = useState(() => {
    return localStorage.getItem('careconnect_voice_guidance') === 'true';
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // 2. Synchronize DOM classes and attributes whenever state changes
  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem('careconnect_font_size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('careconnect_high_contrast', highContrast.toString());
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('careconnect_voice_guidance', voiceGuidance.toString());
  }, [voiceGuidance]);

  // 3. Web Speech API Speech Synthesis for audio assistance
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window) || !text) return;

    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower pace for elderly and cognitive ease
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  // 4. Live Announcer for Assistive Screen Readers (WCAG 4.1.3 Status Messages)
  const announce = useCallback((message) => {
    setLiveAnnouncement(message);
    if (voiceGuidance) {
      speak(message);
    }
  }, [voiceGuidance, speak]);

  // 5. Controls
  const setFontSize = (size) => {
    setFontSizeState(size);
    announce(`Text size changed to ${size}`);
  };

  const toggleHighContrast = () => {
    setHighContrastState(prev => {
      const next = !prev;
      announce(next ? 'High contrast mode turned on' : 'High contrast mode turned off');
      return next;
    });
  };

  const toggleVoiceGuidance = () => {
    setVoiceGuidanceState(prev => {
      const next = !prev;
      if (next) {
        speak('Voice guidance is now enabled. CareConnect will read important page details to you.');
      } else {
        stopSpeaking();
      }
      return next;
    });
  };

  // Sync with user profile on server if logged in
  const syncPreferencesFromServer = (prefs) => {
    if (!prefs) return;
    if (prefs.font_size) setFontSizeState(prefs.font_size);
    if (typeof prefs.high_contrast === 'boolean') setHighContrastState(prefs.high_contrast);
    if (typeof prefs.voice_guidance === 'boolean') setVoiceGuidanceState(prefs.voice_guidance);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        highContrast,
        toggleHighContrast,
        voiceGuidance,
        toggleVoiceGuidance,
        speak,
        stopSpeaking,
        isSpeaking,
        announce,
        liveAnnouncement,
        syncPreferencesFromServer,
      }}
    >
      {/* ARIA Live Region for screen readers */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {liveAnnouncement}
      </div>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
