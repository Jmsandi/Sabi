interface ProgressBarProps {
  reviewed: number;
  total: number;
  percentage: number;
}

/** Slim progress strip beneath the top bar: "X of Y studies reviewed (Z%)". */
export function ProgressBar({ reviewed, total, percentage }: ProgressBarProps) {
  return (
    <div className="bg-surface border-b border-outline-variant px-lg py-md shrink-0">
      <div className="max-w-container-max mx-auto flex items-center gap-lg">
        <div className="flex-1">
          <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
        <div className="font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
          {reviewed} of {total} studies reviewed ({percentage}%)
        </div>
      </div>
    </div>
  );
}
