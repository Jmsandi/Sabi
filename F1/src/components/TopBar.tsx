interface TopBarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

/** Top app bar: brand, primary navigation, search, and theme toggle. */
export function TopBar({ theme, onToggleTheme }: TopBarProps) {
  return (
    <header className="bg-surface border-b border-outline-variant shrink-0 z-10">
      <div className="flex justify-between items-center w-full px-lg h-16 max-w-container-max mx-auto">
        <div className="flex items-center gap-md">
          <h1 className="font-headline-lg text-headline-lg font-black text-primary">Sabi Core</h1>
          <div className="w-px h-6 bg-outline-variant mx-sm" />
          <h2 className="font-headline-md text-headline-md text-on-surface">Study Screening</h2>
        </div>

        <div className="flex items-center gap-lg">
          <nav className="hidden md:flex gap-sm">
            <a
              className="px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md"
              href="#/dashboard"
            >
              Dashboard
            </a>
            <a
              className="px-md py-sm rounded-lg text-primary font-bold border-b-2 border-primary hover:bg-surface-container-low transition-colors font-label-md text-label-md"
              href="#/"
              aria-current="page"
            >
              Review
            </a>
            <a
              className="px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-md text-label-md"
              href="#/library"
            >
              Library
            </a>
          </nav>

          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-48 transition-all"
              placeholder="Search..."
              type="text"
              aria-label="Search studies"
            />
          </div>

          <div className="flex items-center gap-sm">
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="material-symbols-outlined">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <div className="w-8 h-8 rounded-full bg-secondary-container overflow-hidden border border-outline-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary-container text-[20px]">
                person
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
