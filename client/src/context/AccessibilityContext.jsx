import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { api } from '../services/api';
import { translations } from '../utils/translations';

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

  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('careconnect_lang') || 'en';
  });

  const [colorTheme, setColorThemeState] = useState(() => {
    return localStorage.getItem('careconnect_color_theme') || 'indigo';
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeechText, setCurrentSpeechText] = useState('');
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // 2. Synchronize DOM classes and attributes whenever state changes
  useEffect(() => {
    localStorage.setItem('careconnect_lang', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorTheme);
    localStorage.setItem('careconnect_color_theme', colorTheme);
  }, [colorTheme]);

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
  // Pre-load voices on mount to prevent missing voices on macOS/Chromium
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Force initial load of voices
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      };
    }
  }, []);

  // Play a gentle, soft chime to immediately wake up audio pipeline & confirm speaker sound
  const playActivationChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // AudioContext fallback ignored
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (window.__careconnect_speech_timer) {
        clearInterval(window.__careconnect_speech_timer);
        window.__careconnect_speech_timer = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
      window.__careconnect_current_utterance = null;
      setIsSpeaking(false);
      setCurrentSpeechText('');
    }
  }, []);

  const speak = useCallback((text, forcedLang) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return;

    // 1. Play tactile chime
    playActivationChime();

    const isHindi = forcedLang === 'hi' || (!forcedLang && language === 'hi');

    // 2. Clean and format text (adapt currency & honorifics per language)
    const cleanText = text
      .replace(/₹\s*(\d+)/g, isHindi ? '$1 रुपये' : '$1 rupees')
      .replace(/\bDr\./gi, isHindi ? 'डॉक्टर' : 'Doctor')
      .replace(/<[^>]*>?/gm, '')
      .replace(/[*#`_~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      setIsSpeaking(false);
      setCurrentSpeechText('');
      return;
    }

    // 3. Set UI state immediately
    setIsSpeaking(true);
    setCurrentSpeechText(cleanText);

    // 4. Clear any active keep-alive interval
    if (window.__careconnect_speech_timer) {
      clearInterval(window.__careconnect_speech_timer);
      window.__careconnect_speech_timer = null;
    }

    // 5. Unpause engine if stuck
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // 6. Only cancel if something is actually speaking already; never cancel an idle engine
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    // Keep global reference so V8 GC does not drop it
    window.__careconnect_current_utterance = utterance;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();

    if (isHindi) {
      // Hindi voice configuration
      utterance.lang = 'hi-IN';
      utterance.rate = 0.90; // Calm, respectful Hindi cadence
      utterance.pitch = 1.05;

      if (voices && voices.length > 0) {
        // macOS / Chromium Hindi voices: Lekha, Swara, Neel, Google हिन्दी
        const hindiVoice = voices.find(v => v.lang.toLowerCase().startsWith('hi')) ||
                           voices.find(v => v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('lekha') || v.name.toLowerCase().includes('swara')) ||
                           voices.find(v => v.lang.toLowerCase().includes('in'));
        if (hindiVoice) {
          utterance.voice = hindiVoice;
          utterance.lang = hindiVoice.lang || 'hi-IN';
        }
      }
    } else {
      // English soft female voice configuration
      utterance.lang = 'en-US';
      utterance.rate = 0.88; // Gentle, unhurried, reassuring cadence
      utterance.pitch = 1.08; // Slightly elevated pitch for a warm, soft female tone

      if (voices && voices.length > 0) {
        const femaleKeywords = [
          'samantha', 'ava', 'karen', 'serena', 'victoria', 'allison', 
          'susan', 'zoe', 'tessa', 'moira', 'veena', 'jenny', 'aria', 'female'
        ];
        
        const maleKeywords = [
          'alex', 'daniel', 'fred', 'bruce', 'junior', 'ralph', 'tom', 
          'oliver', 'george', 'david', 'arthur', 'male', 'guy'
        ];

        let softFemaleVoice = voices.find(v => {
          const name = v.name.toLowerCase();
          const lang = v.lang.toLowerCase();
          return lang.startsWith('en') && 
                 femaleKeywords.some(keyword => name.includes(keyword)) &&
                 !maleKeywords.some(keyword => name.includes(keyword));
        });

        if (!softFemaleVoice) {
          softFemaleVoice = voices.find(v => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            return lang.startsWith('en') && !maleKeywords.some(keyword => name.includes(keyword));
          });
        }

        if (softFemaleVoice) {
          utterance.voice = softFemaleVoice;
          utterance.lang = softFemaleVoice.lang || 'en-US';
        }
      }
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      // Keep Chrome alive for longer speeches (>15s)
      if (window.__careconnect_speech_timer) clearInterval(window.__careconnect_speech_timer);
      window.__careconnect_speech_timer = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 7000);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeechText('');
      window.__careconnect_current_utterance = null;
      if (window.__careconnect_speech_timer) {
        clearInterval(window.__careconnect_speech_timer);
        window.__careconnect_speech_timer = null;
      }
    };

    utterance.onerror = (e) => {
      if (e?.error !== 'canceled' && e?.error !== 'interrupted') {
        console.warn('SpeechSynthesis error:', e?.error);
      }
      setIsSpeaking(false);
      setCurrentSpeechText('');
      window.__careconnect_current_utterance = null;
      if (window.__careconnect_speech_timer) {
        clearInterval(window.__careconnect_speech_timer);
        window.__careconnect_speech_timer = null;
      }
    };

    // 7. Speak directly in user gesture
    window.speechSynthesis.speak(utterance);

    // Unpause immediately if Chrome queued it in paused state
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, [language, playActivationChime]);

  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => (prev === 'en' ? 'hi' : 'en'));
  }, []);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback((key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  }, [language]);

  // 4. Live Announcer for Screen Readers (ARIA live region only — no unsolicited audio)
  const announce = useCallback((message) => {
    setLiveAnnouncement(message);
  }, []);

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
    setVoiceGuidanceState(prev => !prev);
  };

  const setColorTheme = (newTheme) => {
    setColorThemeState(newTheme);
    const names = {
      indigo: 'Warm Indigo and Lavender',
      blue: 'Clinical Ocean Blue',
      emerald: 'Sage and Emerald Health'
    };
    announce(`Color scheme changed to ${names[newTheme] || newTheme}`);
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
        colorTheme,
        setColorTheme,
        language,
        setLanguage,
        toggleLanguage,
        t,
        speak,
        stopSpeaking,
        isSpeaking,
        currentSpeechText,
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

      {/* Synchronized Live Speech Caption Banner (WCAG 1.2.2 Dual Modality) */}
      {isSpeaking && currentSpeechText && (
        <aside 
          aria-label="Spoken voice guide captions"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-indigo-500/40 z-50 flex items-start gap-3 backdrop-blur-md transition-all animate-bounce-subtle"
        >
          <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 flex-shrink-0 mt-0.5">
            <Volume2 className="w-5 h-5 animate-pulse" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                {t('voice_guide_active')}
              </span>
              <button
                type="button"
                onClick={stopSpeaking}
                className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                aria-label="Stop reading out loud"
              >
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span>{language === 'hi' ? 'रोकें' : 'Stop'}</span>
              </button>
            </div>
            <p className="text-sm text-slate-200 leading-snug break-words">
              {currentSpeechText}
            </p>
          </div>
        </aside>
      )}

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

