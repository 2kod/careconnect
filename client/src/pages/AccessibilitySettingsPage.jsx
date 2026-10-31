import React, { useState } from 'react';
import { 
  Eye, 
  Volume2, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  ShieldCheck, 
  Keyboard, 
  Save 
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AccessibleButton from '../components/common/AccessibleButton';

export const AccessibilitySettingsPage = () => {
  const {
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast,
    voiceGuidance,
    toggleVoiceGuidance,
    colorTheme,
    setColorTheme,
    speak,
    announce
  } = useAccessibility();

  const { isAuthenticated } = useAuth();
  const [saveStatus, setSaveStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const handleTestSpeech = () => {
    speak('This is a demonstration of CareConnect voice guidance. You can listen to doctor summaries, slot details, and booking confirmations.');
  };

  const handleSaveToProfile = async () => {
    if (!isAuthenticated) {
      announce('Settings are saved in your current browser session.');
      setSaveStatus('Preferences saved to your local browser session.');
      return;
    }

    setSaving(true);
    try {
      await api.updatePreferences({
        fontSize,
        highContrast,
        voiceGuidance
      });
      setSaveStatus('Your accessibility preferences have been saved to your account!');
      announce('Accessibility preferences saved successfully.');
    } catch (err) {
      setSaveStatus('Failed to save to cloud, saved locally.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 focus:outline-none">
      
      {/* Title */}
      <div className="mb-8">
        <span className="text-xs uppercase tracking-wider font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md">
          Comfort & Ease
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-1">
          Making CareConnect Comfortable For You
        </h1>
        <p className="text-slate-600 text-lg mt-1">
          Adjust text size, turn on gentle voice reading, or enable high-contrast colors so reading and booking feels completely effortless.
        </p>
      </div>

      {/* Save Notification */}
      {saveStatus && (
        <div role="status" className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{saveStatus}</span>
          </div>
          <button onClick={() => setSaveStatus('')} className="text-xs underline text-emerald-800">Dismiss</button>
        </div>
      )}

      <div className="space-y-8">
        
        {/* 1. Visual Typography Sizing */}
        <section aria-labelledby="font-size-heading" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg">
              A
            </div>
            <div>
              <h2 id="font-size-heading" className="text-xl font-bold text-slate-900">
                Text Size
              </h2>
              <p className="text-sm text-slate-600">
                Choose the text size that feels most comfortable and easy on your eyes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setFontSize('normal')}
              aria-pressed={fontSize === 'normal'}
              className={`p-4 rounded-2xl border-2 text-center transition-all ${
                fontSize === 'normal'
                  ? 'border-indigo-600 bg-indigo-50/60 font-bold text-slate-950 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="block text-base font-normal mb-1">Standard (100%)</span>
              <span className="text-xs text-slate-500">Default clean size</span>
            </button>

            <button
              type="button"
              onClick={() => setFontSize('large')}
              aria-pressed={fontSize === 'large'}
              className={`p-4 rounded-2xl border-2 text-center transition-all ${
                fontSize === 'large'
                  ? 'border-indigo-600 bg-indigo-50/60 font-bold text-slate-950 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="block text-lg font-bold mb-1">Large (115%)</span>
              <span className="text-xs text-slate-500">Enhanced readability</span>
            </button>

            <button
              type="button"
              onClick={() => setFontSize('x-large')}
              aria-pressed={fontSize === 'x-large'}
              className={`p-4 rounded-2xl border-2 text-center transition-all ${
                fontSize === 'x-large'
                  ? 'border-indigo-600 bg-indigo-50/60 font-bold text-slate-950 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="block text-xl font-black mb-1">Extra Large (130%)</span>
              <span className="text-xs text-slate-500">Maximum legibility</span>
            </button>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Live Text Sample:</span>
            <p className="text-slate-800 leading-relaxed">
              "CareConnect enables easy appointments with verified doctors in calm, stress-free steps."
            </p>
          </div>
        </section>

        {/* 2. Visual Contrast & Themes */}
        <section aria-labelledby="contrast-heading" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h2 id="contrast-heading" className="text-xl font-bold text-slate-900">
                  High-Contrast Mode
                </h2>
                <p className="text-sm text-slate-600">
                  Crisp black-and-gold styling with sharp borders to make every word and button pop out clearly.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={highContrast}
              onClick={toggleHighContrast}
              className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 ${
                highContrast ? 'bg-yellow-400' : 'bg-slate-300'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  highContrast ? 'translate-x-6 bg-black' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* 3. Audio & Voice Guidance */}
        <section aria-labelledby="voice-heading" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h2 id="voice-heading" className="text-xl font-bold text-slate-900">
                  Gentle Voice Reading
                </h2>
                <p className="text-sm text-slate-600">
                  Listen to doctor bios, visit times, and booking instructions read aloud to you clearly whenever you need.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={voiceGuidance}
              onClick={toggleVoiceGuidance}
              className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500 ${
                voiceGuidance ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  voiceGuidance ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Test how the voice assistance sounds:</span>
            <AccessibleButton
              variant="outline"
              size="sm"
              icon={Volume2}
              onClick={handleTestSpeech}
            >
              Test Voice Readout
            </AccessibleButton>
          </div>
        </section>

        {/* Save button */}
        <div className="flex justify-end">
          <AccessibleButton
            size="lg"
            loading={saving}
            icon={Save}
            onClick={handleSaveToProfile}
          >
            {isAuthenticated ? 'Save Preferences to Profile' : 'Apply Settings to Browser'}
          </AccessibleButton>
        </div>

        {/* 4. Our Promise to You and Your Family */}
        <section aria-labelledby="promise-heading" className="bg-slate-900 text-white p-8 rounded-3xl mt-12 border border-slate-800">
          <span className="text-xs uppercase tracking-wider font-bold text-indigo-300 bg-slate-800 px-3 py-1 rounded-md">
            Our Care Promise
          </span>
          <h2 id="promise-heading" className="text-2xl font-black mt-2 mb-4">
            Why we made CareConnect gentle and simple
          </h2>
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
              <strong className="text-white block mb-1">Clear guidance every step of the way:</strong>
              We show you exactly where you are in the booking process. You never have to guess what happens next.
            </div>
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
              <strong className="text-white block mb-1">Total protection from mistakes:</strong>
              If you click the wrong button or change your mind, don't worry. You can always go back, review your summary, or cancel with zero penalty.
            </div>
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
              <strong className="text-white block mb-1">No memorizing required:</strong>
              We keep your doctor's name, clinic address, and appointment time clearly displayed on screen so you never feel rushed.
            </div>
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
              <strong className="text-white block mb-1">Designed for all eyes and hands:</strong>
              Buttons are large and easy to tap, words are crisp and clear, and voice reading is always one click away.
            </div>
          </div>
        </section>

      </div>

    </main>
  );
};

export default AccessibilitySettingsPage;

