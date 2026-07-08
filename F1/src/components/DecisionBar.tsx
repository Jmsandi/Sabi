import type { Decision } from '../types';

interface DecisionBarProps {
  currentDecision: Decision | undefined;
  isFirst: boolean;
  isLast: boolean;
  onDecision: (decision: Decision) => void;
  onPrevious: () => void;
  onNext: () => void;
}

interface DecisionAction {
  value: Decision;
  label: string;
  shortcut: string;
  icon: string;
  base: string;
  selected: string;
}

/**
 * Colours are intentionally hard-coded here rather than pulled from the design
 * tokens: include/exclude/flag carry fixed semantic meaning (green/red/amber)
 * that must stay constant in both light and dark themes.
 */
const actions: DecisionAction[] = [
  {
    value: 'include',
    label: 'Include',
    shortcut: 'I',
    icon: 'check',
    base: 'bg-[#16a34a] hover:bg-[#15803d] text-white border-[#14532d]',
    selected: 'bg-[#15803d] text-white border-[#14532d] ring-2 ring-offset-2 ring-[#16a34a]',
  },
  {
    value: 'exclude',
    label: 'Exclude',
    shortcut: 'E',
    icon: 'close',
    base: 'bg-[#dc2626] hover:bg-[#b91c1c] text-white border-[#7f1d1d]',
    selected: 'bg-[#b91c1c] text-white border-[#7f1d1d] ring-2 ring-offset-2 ring-[#dc2626]',
  },
  {
    value: 'flag',
    label: 'Flag',
    shortcut: 'F',
    icon: 'flag',
    base: 'bg-[#d97706] hover:bg-[#b45309] text-white border-[#78350f]',
    selected: 'bg-[#b45309] text-white border-[#78350f] ring-2 ring-offset-2 ring-[#d97706]',
  },
];

/** Fixed bottom action bar: include / exclude / flag plus prev / next. */
export function DecisionBar({
  currentDecision,
  isFirst,
  isLast,
  onDecision,
  onPrevious,
  onNext,
}: DecisionBarProps) {
  return (
    <footer className="bg-surface-container-highest border-t border-outline-variant w-full z-50 flex justify-between items-center px-lg md:px-xl py-md h-20 shadow-level-2 shrink-0">
      <div className="font-mono text-mono-sm text-on-surface-variant hidden md:block">
        Sabi Core Research Tool v2.1
      </div>

      <div className="flex items-center gap-md mx-auto md:mx-0">
        {actions.map((action) => {
          const isSelected = currentDecision === action.value;
          return (
            <button
              key={action.value}
              type="button"
              onClick={() => onDecision(action.value)}
              aria-pressed={isSelected}
              className={`h-11 px-6 rounded-lg shadow-sm flex items-center gap-3 transition-transform active:scale-95 border font-label-md text-label-md ${
                isSelected ? action.selected : action.base
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{action.icon}</span>
              {action.label}
              <span className="bg-black/20 px-1.5 py-0.5 rounded font-mono text-[11px] ml-1">
                [ {action.shortcut} ]
              </span>
            </button>
          );
        })}

        <div className="w-px h-8 bg-outline-variant mx-sm hidden sm:block" />

        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirst}
          className="h-11 px-4 bg-surface hover:bg-surface-container-low text-on-surface-variant border border-outline-variant rounded-lg flex items-center gap-2 transition-colors font-label-md text-label-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Prev
          <span className="bg-surface-container-highest px-1.5 py-0.5 rounded font-mono text-[11px] ml-1">
            [ ← ]
          </span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={isLast}
          className="h-11 px-4 bg-surface hover:bg-surface-container-low text-on-surface-variant border border-outline-variant rounded-lg flex items-center gap-2 transition-colors font-label-md text-label-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          <span className="bg-surface-container-highest px-1.5 py-0.5 rounded font-mono text-[11px] ml-1">
            [ → ]
          </span>
        </button>
      </div>
    </footer>
  );
}
