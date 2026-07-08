# F1 — Study Screener Interface

This solution implements the F1 frontend track: a **React + TypeScript + Vite** study screener built on the Sabi Core design system. Reviewers move through a queue of research studies, read the metadata and a section-labelled abstract, and mark each study as `include`, `exclude`, or `flag`.

## Run

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal. To type-check and produce a production build:

```bash
npm run build      # tsc --noEmit && vite build
npm run typecheck  # types only
```

## Features

- **React + TypeScript** with a small, single-responsibility component split
  (`TopBar`, `ProgressBar`, `StudyDetails`, `AbstractReader`, `DecisionBar`).
- **Sabi Core design system** implemented in Tailwind — Material-style surface /
  on-surface tokens, driven by CSS custom properties, with a full light/dark theme.
- Structured, section-labelled abstracts (Background / Methods / Results / …).
- Persistent decisions **and** theme via `localStorage` — both survive a refresh.
- Keyboard shortcuts: `I` include, `E` exclude, `F` flag, `←` / `→` navigate,
  with auto-advance after a decision (suppressed while typing in inputs).
- Progress tracking (`X of Y studies reviewed`) and disabled edge navigation.
- Responsive 30 / 70 metadata / abstract layout that stacks on narrow viewports.

## Architecture

```
src/
  main.tsx                 App entry, mounts <StudyScreenerApp/>
  StudyScreenerApp.tsx     Owns session state (index, decisions, theme)
  types.ts                 Study / Decision domain model
  components/              Presentational panels (props in, callbacks out)
  hooks/
    useLocalStorageState   Typed persisted useState
    useKeyboardShortcuts   Global I/E/F + arrow handling
  data/mockStudies.ts      Seed corpus (swap for a real API call)
```

State flows one way: `StudyScreenerApp` holds state and passes data + callbacks
down to stateless panels. `mockStudies.ts` is the only data source, so wiring the
screener to a real backend (or the B2/OpenAlex module) means changing one file.

## With More Time

I would connect the screener to the B2/OpenAlex module or a real screening
workflow API, then add reviewer assignment and conflict-resolution states.
