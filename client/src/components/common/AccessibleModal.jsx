import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import AccessibleButton from './AccessibleButton';

export const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  role = 'dialog',
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      
      // Focus the modal container
      if (modalRef.current) {
        modalRef.current.focus();
      }

      // Handle Escape key
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role={role}
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
        tabIndex="-1"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 md:p-8 focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 id="modal-title" className="text-xl md:text-2xl font-bold text-slate-900">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="mt-1 text-slate-600 text-base">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AccessibleModal;

