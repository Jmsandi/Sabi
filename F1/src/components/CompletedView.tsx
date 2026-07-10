interface DecisionCounts {
  included: number;
  excluded: number;
  flagged: number;
}

interface CompletedViewProps {
  counts: DecisionCounts;
  onExport: () => void;
  onReviewAgain: () => void;
}

interface StatCard {
  key: keyof DecisionCounts;
  label: string;
  icon: string;
  color: string;
}

const statCards: StatCard[] = [
  { key: 'included', label: 'Included', icon: 'check_circle', color: 'text-[#16a34a]' },
  { key: 'excluded', label: 'Excluded', icon: 'do_not_disturb_on', color: 'text-[#dc2626]' },
  { key: 'flagged', label: 'Flagged', icon: 'flag', color: 'text-[#d97706]' },
];

// The "you're done" screen — turns up once every study has a call on it.
export function CompletedView({ counts, onExport, onReviewAgain }: CompletedViewProps) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-2xl mx-auto px-lg py-xl flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center mb-lg">
          <span className="material-symbols-outlined text-primary text-[56px]">task_alt</span>
        </div>

        <h2 className="font-display text-display text-on-surface mb-sm">All studies reviewed</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-xl">
          That's the whole queue screened. Every decision is saved and ready to hand off to the next
          stage of the review.
        </p>

        <div className="w-full mb-xl">
          <div className="flex justify-between items-center mb-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Screening progress
            </span>
            <span className="font-label-md text-label-md text-primary font-bold">100%</span>
          </div>
          <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full w-full bg-primary rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md w-full mb-xl">
          {statCards.map((card) => (
            <div
              key={card.key}
              className="bg-surface border border-outline-variant rounded-xl shadow-level-1 p-lg flex flex-col items-center"
            >
              <span className={`material-symbols-outlined text-[32px] mb-sm ${card.color}`}>
                {card.icon}
              </span>
              <span className="font-display text-display text-on-surface leading-none mb-xs">
                {counts[card.key]}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                {card.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-md">
          <button
            type="button"
            onClick={onExport}
            className="h-11 px-6 bg-primary hover:bg-surface-tint text-on-primary rounded-lg shadow-sm flex items-center gap-2 transition-colors font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export Decisions
          </button>
          <button
            type="button"
            onClick={onReviewAgain}
            className="h-11 px-6 bg-surface hover:bg-surface-container-low text-on-surface-variant border border-outline-variant rounded-lg flex items-center gap-2 transition-colors font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to review
          </button>
        </div>
      </div>
    </div>
  );
}
