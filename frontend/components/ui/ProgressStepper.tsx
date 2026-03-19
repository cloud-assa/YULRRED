'use client';
import { motion } from 'framer-motion';
import { Check, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
}

export default function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, i) => {
        const completed = i < currentStep;
        const active = i === currentStep;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <motion.div
                initial={false}
                animate={active ? { boxShadow: '0 0 20px rgba(124,58,237,0.4)' } : {}}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center ring-2 transition-all duration-300',
                  completed
                    ? 'ring-brand-500 bg-gradient-brand'
                    : active
                    ? 'ring-brand-400 bg-brand-500/20'
                    : 'ring-white/10 bg-white/[0.04]'
                )}
              >
                {completed ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Icon className={cn('w-4 h-4', active ? 'text-brand-300' : 'text-gray-600')} />
                )}
              </motion.div>
              <span className={cn(
                'text-xs font-medium whitespace-nowrap',
                active ? 'text-brand-300' : completed ? 'text-gray-400' : 'text-gray-600'
              )}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-3 mt-[-18px] overflow-hidden bg-white/[0.06]">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: i < currentStep ? '100%' : '0%' }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="h-full bg-gradient-to-r from-brand-500 to-indigo-500"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
