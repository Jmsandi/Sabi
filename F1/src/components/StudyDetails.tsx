import type { Study } from '../types';

interface StudyDetailsProps {
  study: Study;
}

/** Left panel (30%): structured metadata for the study under review. */
export function StudyDetails({ study }: StudyDetailsProps) {
  return (
    <aside className="w-full md:w-[30%] bg-surface rounded-xl shadow-level-1 border border-outline-variant flex flex-col overflow-hidden h-full">
      <div className="p-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center shrink-0">
        <h3 className="font-headline-md text-headline-md text-on-surface">Study ID: {study.id}</h3>
        <span className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-sm text-label-sm border border-outline-variant">
          {study.status}
        </span>
      </div>

      <div className="p-md flex-1 overflow-y-auto scrollbar-thin">
        <div className="mb-lg">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm leading-tight">
            {study.title}
          </h2>
          <div className="flex flex-wrap gap-2 mb-md">
            <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant rounded-md font-mono text-mono-sm">
              {study.shortAuthors}
            </span>
            <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant rounded-md font-mono text-mono-sm">
              {study.year}
            </span>
            <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant rounded-md font-mono text-mono-sm">
              {study.source}
            </span>
          </div>
        </div>

        <div className="space-y-md">
          <div>
            <h4 className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-xs">
              Authors
            </h4>
            <p className="font-body-md text-body-md text-on-surface">{study.authors}</p>
          </div>
          <div>
            <h4 className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-xs">
              Journal / Source
            </h4>
            <p className="font-body-md text-body-md text-on-surface">{study.journal}</p>
          </div>
          <div>
            <h4 className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-xs">
              Tags / Keywords
            </h4>
            <div className="flex flex-wrap gap-xs mt-1">
              {study.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-primary-container text-on-primary-container rounded text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
}
