import type { Study } from '../types';

interface AbstractReaderProps {
  study: Study;
}

/** Right panel (70%): scrollable, section-labelled abstract of the study. */
export function AbstractReader({ study }: AbstractReaderProps) {
  return (
    <section className="w-full md:w-[70%] bg-surface rounded-xl shadow-level-1 border border-outline-variant flex flex-col h-full overflow-hidden relative">
      <div className="p-md border-b border-outline-variant flex justify-between items-center shrink-0 bg-surface-bright z-10">
        <div className="flex items-center gap-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">article</span>
          <h3 className="font-label-md text-label-md uppercase tracking-wide">Abstract &amp; Full Text</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-lg scrollbar-thin">
        <div className="max-w-3xl mx-auto">
          {study.abstract.map((section) => (
            <p
              key={section.label}
              className="font-body-lg text-body-lg text-on-surface leading-[1.7] mb-md"
            >
              <strong className="font-bold">{section.label}:</strong> {section.text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
