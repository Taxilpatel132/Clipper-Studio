# ◆ Clipper Studio — AI Video Editor

A modern, web-based video editing application built with Next.js 16, featuring AI-powered tools and a professional timeline interface. Part of the **Clipper Studio** suite with a separate Node.js/Express backend.

Users can edit videos **without login or creating a project** — authentication is only required for saving and downloading. The application provides intuitive video editing capabilities with a cyberpunk-inspired design.

## 🚀 Features

### Core Video Editing ✅

- **Video Upload & Preview** — Support for MP4, MOV, AVI formats via local blob URLs
- **Professional Timeline** — Drag-and-drop timeline with clip management
- **Real-time Playback** — `requestAnimationFrame`-based playback with time sync
- **Multi-clip Support** — Sequence multiple video clips on a single track
- **Clip Trimming** — Non-destructive soft trim (start/end) with visual feedback
- **Clip Splitting** — Split clips at the playhead into two clips
- **Clip Duplication** — Duplicate any clip and append to timeline
- **Snap-to-Edge** — Intelligent snapping to clip edges when dragging
- **Zoom Controls** — Adjustable timeline zoom (0.25 step) for precision editing
- **Playhead Scrubbing** — Click or drag the playhead to seek through the timeline
- **Gap Detection** — Visual feedback when playhead is in an empty segment

### Professional Interface ✅

- **Modern UI** — Clean, professional interface with cyberpunk aesthetics
- **Tool Panel** — Organized sidebar with Video, Audio, Image, and Text tool categories
- **Navbar** — Export dialog with resolution presets (720p / 1080p / 4K / Custom)
- **Responsive Design** — Works seamlessly across different screen sizes
- **Real-time Updates** — Live preview of changes as you edit

### Planned / In Progress 🚧

- **AI Generation** — Generate video content using AI (UI placeholder exists)
- **AI Avatars** — AI avatar selection (placeholder cards in ToolPanel)
- **Audio / Image / Text Tools** — Coming soon (UI stubs exist)
- **Backend Frame Extraction** — FFmpeg-based frame thumbnails for timeline
- **Render & Export** — Server-side rendering via backend (route exists, action stub)
- **No-Auth Editing** — Users can edit without login; auth only for save/download

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with React 19
- **Language**: TypeScript for type-safe development
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) with custom cyber theme
- **UI Components**: [Radix UI](https://radix-ui.com) primitives with custom styling
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) for efficient state handling
- **Icons**: [Lucide React](https://lucide.dev) for consistent iconography
- **Form Handling**: React Hook Form with Zod validation

## 📁 Project Structure

```
src/
├── app/                          # Next.js app router
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Main editor interface
│   └── globals.css              # Global styles and cyber theme
│
├── components/                   # UI components
│   ├── Navbar.tsx               # Top navigation with export features
│   ├── Sidebar.tsx              # Tool selection sidebar
│   ├── VideoPreview.tsx         # Main video preview area
│   ├── Timeline.tsx             # Re-export for backward compatibility
│   ├── ToolPanel.tsx            # Right panel for tool options
│   │
│   ├── timeline/                # 🆕 Modular Timeline Components
│   │   ├── index.ts             # Export all timeline components
│   │   ├── Timeline.tsx         # Main timeline orchestrator
│   │   ├── PlaybackControls.tsx # Play/pause/navigation buttons
│   │   ├── TimelineRuler.tsx    # Time ruler with playhead
│   │   ├── TimelineClipBlock.tsx# Individual clip rendering
│   │   ├── ZoomControls.tsx     # Timeline zoom controls
│   │   └── hooks/
│   │       └── useTimelineControls.ts  # All timeline logic
│   │
│   └── ui/                      # Reusable UI components (40+)
│
├── editor/                       # 🆕 Core Editor Architecture
│   ├── store/                   # Zustand state management
│   │   └── editor.store.ts      # Main editor store
│   │
│   ├── types/                   # TypeScript definitions
│   │   ├── index.ts             # Export all types
│   │   ├── clip.types.ts        # Clip-related types
│   │   └── timeline.types.ts    # Timeline-related types
│   │
│   ├── engine/                  # Pure utility functions
│   │   ├── index.ts             # Export all engine functions
│   │   ├── time.ts              # Time formatting utilities
│   │   ├── clip.ts              # Clip calculations
│   │   └── timeline.ts          # Timeline calculations
│   │
│   ├── selectors/               # Derived state (React hooks)
│   │   ├── index.ts             # Export all selectors
│   │   ├── clip.selectors.ts    # Clip-related selectors
│   │   └── timeline.selectors.ts# Timeline-related selectors
│   │
│   ├── actions/                 # State mutations (React hooks)
│   │   ├── index.ts             # Export clip & playback actions
│   │   ├── clip.actions.ts      # Clip CRUD operations
│   │   ├── playback.actions.ts  # Play/pause/seek actions
│   │   ├── timeline.actions.ts  # 🚧 Empty stub (planned)
│   │   └── render.actions.ts    # 🚧 Empty stub (planned)
│   │
│   ├── services/                # 🚧 Empty (planned: API services)
│   │
│   └── timeline/                # Timeline utilities
│       └── timelineSegments.ts  # Segment type & calculations
│
├── hooks/                       # Custom React hooks
│   └── useEditor.ts            # Re-exports useEditorStore
└── lib/                         # Utility functions
    └── utils.ts                 # cn() helper (clsx + twMerge)
```

## 🏗️ Architecture Overview

### Component Architecture

The timeline component follows a **modular architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Timeline.tsx                           │
│                    (Main Orchestrator)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ PlaybackControls│  │  ZoomControls   │                  │
│  │  (Play/Pause)   │  │   (Zoom +/-)    │                  │
│  └─────────────────┘  └─────────────────┘                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │              TimelineRuler.tsx                       │   │
│  │         (Time marks + Playhead + Drop indicator)     │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Clip 1  │  │  Clip 2  │  │  Clip 3  │  ...             │
│  │ (Block)  │  │ (Block)  │  │ (Block)  │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│            TimelineClipBlock.tsx (per clip)                 │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      COMPONENTS                             │
│         (Timeline, PlaybackControls, ClipBlock)             │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  SELECTORS  │    │   ACTIONS   │    │   ENGINE    │     │
│  │  (read)     │    │   (write)   │    │   (utils)   │     │
│  │             │    │             │    │             │     │
│  │ useSortedClips│  │ useClipActions│  │ formatTime  │     │
│  │ useActiveClip │  │ usePlayback │  │ clampTime   │     │
│  │ useTimelineScale│ │ useTimeline │  │ xToTime     │     │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
│                     ┌──────▼──────┐                         │
│                     │    STORE    │                         │
│                     │  (Zustand)  │                         │
│                     │             │                         │
│                     │ clips[]     │                         │
│                     │ currentTime │                         │
│                     │ duration    │                         │
│                     │ isPlaying   │                         │
│                     │ zoom        │                         │
│                     │ activeClipId│                         │
│                     │ editorMode  │                         │
│                     │ previewUrl  │                         │
│                     └─────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Module Documentation

### Types (`src/editor/types/`)

Type definitions used throughout the application:

```typescript
// clip.types.ts
interface TimelineClip {
  id: string;
  name: string;
  src: string;
  startTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  type: "video" | "audio" | "image";
}

interface ClipPlayRange {
  start: number;
  end: number;
  duration: number;
}

// timeline.types.ts
type EditorMode = "idle" | "dragging" | "trimming" | "selecting";
type TrimSide = "start" | "end";

interface SnapPoint {
  time: number;
  type: "clip-start" | "clip-end" | "playhead" | "marker";
  clipId?: string;
}

interface DragState {
  clipId: string;
  startX: number;
  originalStartTime: number;
}
```

> **Note:** `TimelineClip` is also defined in `editor.store.ts`. Both must stay in sync (the store version must include the `type` field).

### Engine (`src/editor/engine/`)

Pure utility functions with no side effects:

| Function                                  | File        | Description                               |
| ----------------------------------------- | ----------- | ----------------------------------------- |
| `formatTime(seconds)`                     | time.ts     | Format to MM:SS                           |
| `formatTimePrecise(seconds)`              | time.ts     | Format to MM:SS.ms                        |
| `parseTime(timeStr)`                      | time.ts     | Parse time string to seconds              |
| `clampTime(time, min, max)`               | time.ts     | Clamp time between bounds                 |
| `getClipPlayRange(clip)`                  | clip.ts     | Get playable range after trim             |
| `getEffectiveDuration(clip)`              | clip.ts     | Get duration after trim                   |
| `isTimeInClip(clip, time)`                | clip.ts     | Check if time is in clip                  |
| `timelineTimeToClipTime(clip, time)`      | clip.ts     | Convert timeline time to clip-local time  |
| `clipTimeToTimelineTime(clip, localTime)` | clip.ts     | Convert clip-local time to timeline time  |
| `buildTimelineSegments(clips)`            | timeline.ts | Build ordered segment array (clip or gap) |
| `getSegmentAtTime(segments, time)`        | timeline.ts | Get the segment at a given time           |
| `getTotalTimelineDuration(segments)`      | timeline.ts | Total duration from segments              |

> **Note:** `timelineSegments.ts` in `editor/timeline/` has a parallel implementation of `buildTimelineSegments` and `getSegmentAtTime` using a discriminated union `TimelineSegment` type.

### Selectors (`src/editor/selectors/`)

React hooks for derived/computed state:

| Hook                    | File                  | Description                      |
| ----------------------- | --------------------- | -------------------------------- |
| `useSortedClips()`      | clip.selectors.ts     | Clips sorted by start time       |
| `useActiveClip()`       | clip.selectors.ts     | Currently selected clip          |
| `useClipAtTime(time)`   | clip.selectors.ts     | Get clip at specific time        |
| `useClipById(id)`       | clip.selectors.ts     | Get clip by ID                   |
| `useIsClipSelected(id)` | clip.selectors.ts     | Check if clip is selected        |
| `useTimelineScale()`    | timeline.selectors.ts | Pixels per second                |
| `useTotalDuration()`    | timeline.selectors.ts | Total timeline duration          |
| `useTimelineWidth()`    | timeline.selectors.ts | Timeline width in pixels         |
| `usePlaybackState()`    | timeline.selectors.ts | isPlaying, currentTime, duration |
| `useDragState()`        | timeline.selectors.ts | Drag/drop state                  |
| `useEditorMode()`       | timeline.selectors.ts | Current editor mode              |

### Actions (`src/editor/actions/`)

React hooks for state mutations:

| Hook                   | File                | Actions                                                                                    | Status |
| ---------------------- | ------------------- | ------------------------------------------------------------------------------------------ | ------ |
| `useClipActions()`     | clip.actions.ts     | selectClip, deleteClip, duplicateClip, splitClipAtTime, addClip                            | ✅     |
| `usePlaybackActions()` | playback.actions.ts | play, pause, togglePlay, seekTo, skipForward, skipBackward, goToNextClip, goToPreviousClip | ✅     |
| `useTimelineActions()` | timeline.actions.ts | _(empty stub — planned)_                                                                   | 🚧     |
| `useRenderActions()`   | render.actions.ts   | _(empty stub — planned)_                                                                   | 🚧     |

### Timeline Components (`src/components/timeline/`)

| Component                | Lines | Purpose                                                                 |
| ------------------------ | ----- | ----------------------------------------------------------------------- |
| `Timeline.tsx`           | ~100  | Main orchestrator — wires controls, ruler, and clips                    |
| `PlaybackControls.tsx`   | ~50   | Prev / Play-Pause / Split / Next / Start + time display                 |
| `TimelineRuler.tsx`      | ~70   | Second marks, drop indicator, zoom controls, red playhead               |
| `TimelineClipBlock.tsx`  | ~90   | Clip block with trim overlays, drag styling, name label                 |
| `ZoomControls.tsx`       | ~30   | Zoom ± buttons (0.25 step) with current level display                   |
| `useTimelineControls.ts` | ~440  | All timeline interaction logic (drag, trim, snap, split, playback loop) |

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or later
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
npm run build
npm start
```

## 🎯 Usage

### Basic Editing

1. **Upload Video**: Click the upload button in the Video tool panel
2. **Timeline Editing**: Drag clips on the timeline to arrange them
3. **Playback Controls**: Use the play/pause controls to preview your work
4. **Trimming**: Drag the yellow handles on clip edges to trim
5. **Splitting**: Position playhead and click "✂ Split" button
6. **Navigation**: Use ⏮ Prev / Next ⏭ to jump between clips

### Keyboard Shortcuts (Planned)

| Key       | Action               |
| --------- | -------------------- |
| `Space`   | Play/Pause           |
| `S`       | Split at playhead    |
| `Delete`  | Delete selected clip |
| `Ctrl+Z`  | Undo                 |
| `Ctrl+Y`  | Redo                 |
| `+` / `-` | Zoom in/out          |

## 🎨 Design System

The application features a custom cyberpunk-inspired design with:

- **Primary Colors**: Cyan (#5adaff) and Magenta (#ff5af1)
- **Dark Theme**: Deep space background (#0a0f24)
- **Timeline Background**: #0f1629 with #0a0f24 for clips area
- **Typography**: Geist font family for modern aesthetics
- **Responsive Grid**: Flexible layout adapting to screen sizes

### Timeline Visual Design

```
┌────────────────────────────────────────────────────────────┐
│ ⏮ Prev │ Play │ ✂ Split │ Next ⏭ │ ⏮ Start │ 0:05/1:30 │  ← Controls
├────────────────────────────────────────────────────────────┤
│ − │ Zoom: 1.00x │ + │                                      │  ← Zoom
├──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┤
│0s│1s│2s│3s│4s│5s│6s│7s│8s│9s│10s│                         │  ← Ruler
├──┴──┴──┼──────────────────┼──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┤
│        │████ Clip 1 █████│      │███ Clip 2 ███│          │  ← Clips
│        │  [trim]  [trim] │      │ [trim] [trim]│          │
└────────┴──────────────────┴──────┴──────────────┴──────────┘
              ▼ (red playhead)
```

## 📦 Key Dependencies

- **UI Framework**: Radix UI components for accessibility
- **Animation**: Embla Carousel for smooth interactions
- **Date Handling**: date-fns for time-based operations
- **Charts**: Recharts for data visualization
- **Notifications**: Sonner for user feedback

## 🔮 Future Enhancements

- [ ] Timeline frame thumbnails (FFmpeg backend extraction)
- [ ] Timeline actions hook (`timeline.actions.ts`)
- [ ] Render/export actions hook (`render.actions.ts`)
- [ ] Backend API services (`editor/services/`)
- [ ] Keyboard shortcuts
- [ ] Undo/Redo history
- [ ] Multi-track timeline (audio, text, image layers)
- [ ] Video effects and transitions
- [ ] Text overlays and captions
- [ ] Extended format support (WebM, MKV)
- [ ] Advanced AI video generation
- [ ] Cloud-based rendering
- [ ] Real-time collaboration
- [ ] Mobile application

## 🧪 Testing

The modular architecture enables easy testing:

```typescript
// Example: Testing clip.ts engine functions
import { getClipPlayRange, isTimeInClip } from "@/editor/engine";

test("getClipPlayRange returns correct range", () => {
  const clip = { startTime: 0, duration: 10, trimStart: 2, trimEnd: 3 };
  const range = getClipPlayRange(clip);
  expect(range.start).toBe(2);
  expect(range.end).toBe(7);
});
```

## 🚀 Deployment

The application is optimized for deployment on:

- [Vercel](https://vercel.com) (recommended)
- [Netlify](https://netlify.com)
- Any Node.js hosting platform

For detailed deployment instructions, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## 📄 License

This project is part of the Clipper Studio suite - a comprehensive video editing platform.

---

## 📚 Quick Reference

### Import Patterns

```typescript
// Types
import type {
  TimelineClip,
  ClipPlayRange,
  EditorMode,
  SnapPoint,
} from "@/editor/types";

// Engine utilities (pure functions)
import {
  formatTime,
  formatTimePrecise,
  clampTime,
  getClipPlayRange,
  getEffectiveDuration,
  isTimeInClip,
  buildTimelineSegments,
  getSegmentAtTime,
} from "@/editor/engine";

// Selectors (read-only hooks)
import {
  useSortedClips,
  useActiveClip,
  useClipAtTime,
} from "@/editor/selectors";
import {
  useTimelineScale,
  usePlaybackState,
  useDragState,
} from "@/editor/selectors";

// Actions (mutation hooks)
import { useClipActions, usePlaybackActions } from "@/editor/actions";

// Store (direct access)
import { useEditorStore } from "@/editor/store/editor.store";

// Components
import {
  Timeline,
  PlaybackControls,
  TimelineClipBlock,
} from "@/components/timeline";

// Re-export shortcut
import { useEditorStore } from "@/hooks/useEditor";
```

### File Responsibilities

| Layer          | Responsibility    | Side Effects     |
| -------------- | ----------------- | ---------------- |
| **Types**      | Define shapes     | ❌ None          |
| **Engine**     | Pure calculations | ❌ None          |
| **Selectors**  | Read state        | ❌ None          |
| **Actions**    | Write state       | ✅ Mutates store |
| **Components** | Render UI         | ✅ DOM updates   |
| **Store**      | Hold state        | ✅ State storage |
