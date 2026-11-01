import React from 'react';
import { Volume2, VolumeX, Eye, Settings, Languages } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Link } from 'react-router-dom';

export const AccessibilityBar = () => {
  const {
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast,
    isSpeaking,
    stopSpeaking,
    speak,
    language,
    setLanguage,
    toggleLanguage,
    t,
  } = useAccessibility();

  const handleReadPage = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    const pageHeading = document.querySelector('main h1')?.innerText || document.title;
    const subHeadings = Array.from(document.querySelectorAll('main h2, main p'))
      .map(el => el.innerText.trim())
      .filter(t => t.length > 10 && !t.includes('©') && !t.includes('http'))
      .slice(0, 3)
      .join('. ');

    const readText = language === 'hi'
      ? `आप ${pageHeading} पृष्ठ पर हैं। ${subHeadings}`
      : `You are on ${pageHeading}. ${subHeadings}`;
    speak(readText);
  };

  return (
    <aside 
      aria-label="Accessibility controls bar"
      className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-2.5 text-sm border-b border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Quick Label */}
        <div className="flex items-center gap-2">
          <span className="font-semibold flex items-center gap-1.5 text-indigo-300">
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span>{language === 'hi' ? 'आराम पट्टी:' : 'Comfort Bar:'}</span>
          </span>
          <span className="text-slate-400 text-xs hidden sm:inline">
            {t('comfort_bar_title')}
          </span>
        </div>

        {/* Center / Right: Accessibility Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
          {/* Crystal Clear Segmented Language Switcher: English | हिन्दी */}
          <div 
            className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700" 
            role="group" 
            aria-label="Language selection"
          >
            <span className="text-xs text-slate-400 px-2 flex items-center gap-1 select-none">
              <Languages className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
              <span className="hidden sm:inline">Lang:</span>
            </span>

            <button
              type="button"
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                language === 'en'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              English
            </button>

            <button
              type="button"
              onClick={() => setLanguage('hi')}
              aria-pressed={language === 'hi'}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                language === 'hi'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Font Size Selector */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700" role="group" aria-label="Text size options">
            <span className="text-xs text-slate-400 px-2 select-none" id="text-size-label">{t('text_size_label')}</span>
            <button
              type="button"
              onClick={() => setFontSize('normal')}
              aria-pressed={fontSize === 'normal'}
              className={`px-2 py-1 text-xs font-semibold rounded ${
                fontSize === 'normal' 
                  ? 'bg-indigo-600 text-white font-bold shadow' 
                  : 'text-slate-200 hover:bg-slate-700'
              }`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize('large')}
              aria-pressed={fontSize === 'large'}
              className={`px-2 py-1 text-sm font-semibold rounded ${
                fontSize === 'large' 
                  ? 'bg-indigo-600 text-white font-bold shadow' 
                  : 'text-slate-200 hover:bg-slate-700'
              }`}
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => setFontSize('x-large')}
              aria-pressed={fontSize === 'x-large'}
              className={`px-2 py-1 text-base font-semibold rounded ${
                fontSize === 'x-large' 
                  ? 'bg-indigo-600 text-white font-bold shadow' 
                  : 'text-slate-200 hover:bg-slate-700'
              }`}
            >
              A++
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            type="button"
            onClick={toggleHighContrast}
            aria-pressed={highContrast}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              highContrast 
                ? 'bg-yellow-400 text-black border-yellow-300 font-bold' 
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span>{highContrast ? t('contrast_on') : t('contrast_toggle')}</span>
            <span className={`w-2 h-2 rounded-full ${highContrast ? 'bg-black' : 'bg-slate-400'}`} />
          </button>

          {/* Read Page Aloud (TTS) */}
          <button
            type="button"
            onClick={handleReadPage}
            aria-label={isSpeaking ? "Stop reading page aloud" : "Read this page aloud with voice guidance"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isSpeaking
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('stop_reading')}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
                <span>{t('read_page')}</span>
              </>
            )}
          </button>

          {/* More Settings Link */}
          <Link
            to="/accessibility-settings"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800"
            title="Open comfort and accessibility settings"
          >
            <Settings className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden md:inline">{t('settings_link')}</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default AccessibilityBar;
