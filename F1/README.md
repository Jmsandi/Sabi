# F1 - Study Screener Interface

This is my answer to the F1 frontend question. It is a React + Vite study
screening interface for a reviewer working through 50 research studies.

The reviewer can move through the queue, read the study metadata and abstract,
and mark each study as `include`, `exclude`, or `flag`. Decisions are saved in
`localStorage`, so a page refresh does not clear the review progress.

## How to run

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
```

## What is included

- A 50-study mock dataset, generated from realistic study templates.
- Include, exclude, and flag decisions.
- Keyboard controls:
  - `I` for include
  - `E` for exclude
  - `F` for flag
  - left and right arrows for previous and next study
- Saved decisions through `localStorage`.
- Progress tracking across the full screening queue.
- A completion view once every study has a decision.
- A light/dark theme toggle, also saved locally.
- Responsive layout for desktop and smaller screens.

## File structure

```text
F1/
├── src/
│   ├── components/
│   │   ├── AbstractReader.tsx     Displays the study abstract sections
│   │   ├── CompletedView.tsx      Summary screen after all studies are reviewed
│   │   ├── DecisionBar.tsx        Include/exclude/flag and navigation controls
│   │   ├── ProgressBar.tsx        Review progress display
│   │   ├── StudyDetails.tsx       Metadata panel for the current study
│   │   └── TopBar.tsx             Header and theme toggle
│   ├── data/
│   │   └── mockStudies.ts         Mock 50-study review queue
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useLocalStorageState.ts
│   ├── utils/
│   │   └── exportCsv.ts           Exports recorded decisions
│   ├── StudyScreenerApp.tsx       Main screen state and workflow
│   ├── index.css                  Tailwind and theme variables
│   ├── main.tsx                   React entry point
│   └── types.ts                   Study and decision types
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Design choices

The app keeps the main workflow state in `StudyScreenerApp.tsx`: the current
study index, the saved decisions, and the selected theme. The child components
are mostly presentational. That keeps the button and keyboard paths using the
same decision handler, which avoids slightly different behavior between mouse
and keyboard use.

I used `localStorage` because the prompt asks for persistence across page
refreshes, but does not require a backend. If this were connected to a real
screening workflow, the `mockStudies.ts` file is the obvious replacement point
for an API call.

## With more time

I would add reviewer notes, conflict-resolution states, and a real API-backed
study queue. I would also add component tests around the keyboard shortcuts and
completion view.
