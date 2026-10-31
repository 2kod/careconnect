import React from 'react';
import { Check, Calendar, Clock, UserCheck, ShieldCheck } from 'lucide-react';

const steps = [
  { id: 1, name: 'Select Doctor', icon: UserCheck },
  { id: 2, name: 'Day & Time', icon: Calendar },
  { id: 3, name: 'Review Details', icon: Clock },
  { id: 4, name: "You're All Set!", icon: ShieldCheck },
];

export const BookingStepper = ({ currentStep = 1 }) => {
  return (
    <nav aria-label="Appointment booking progress" className="mb-8">
      {/* Visual step items */}
      <ol className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const StepIcon = step.icon;

          return (
            <li
              key={step.id}
              aria-current={isCurrent ? 'step' : undefined}
              className={`
                flex items-center gap-3 p-3.5 rounded-2xl border transition-all
                ${isCurrent 
                  ? 'bg-indigo-50 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20' 
                  : isCompleted 
                    ? 'bg-emerald-50/60 border-emerald-300 text-slate-800' 
                    : 'bg-white border-slate-200 text-slate-400'
                }
              `}
            >
              {/* Badge Circle */}
              <div
                className={`
                  w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors
                  ${isCurrent
                    ? 'bg-indigo-600 text-white'
                    : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              {/* Text label */}
              <div className="overflow-hidden">
                <p className={`text-xs uppercase tracking-wider font-bold ${isCurrent ? 'text-indigo-700' : 'text-slate-500'}`}>
                  Step {step.id}
                </p>
                <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-slate-900 font-bold' : isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                  {step.name}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default BookingStepper;

