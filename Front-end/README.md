# ◆ Clipper Studio — AI Video Editor

A modern, web-based video editing application built with Next.js 16, featuring AI-powered tools and a professional timeline interface. Part of the **Clipper Studio** suite with a separate Node.js/Express backend.

Users can edit videos **without login or creating a project** — authentication is only required for saving and downloading. The application provides intuitive video editing capabilities with a cyberpunk-inspired design.

## 🚀 Features

### Core Video Editing ✅

- **Video Upload & Preview** — Support for MP4, MOV, AVI formats via local blob URLs
- **Audio Upload & Playback** — Upload audio files with volume and mute controls
- **Multi-Track Timeline** — Group-based track system with Video, Overlay, and Audio groups
- **Dynamic Track Management** — Add/remove tracks per group with visual indicators
- **Resizable Timeline** — Drag the top edge to adjust timeline height (200-800px)
- **Professional Timeline** — Drag-and-drop timeline with clip management
- **Real-time Playback** — Synchronized video/audio playback with time sync
- **Clip Trimming** — Non-destructive soft trim (start/end) with visual feedback
- **Clip Splitting** — Split clips at the playhead into two clips
- **Clip Duplication** — Duplicate any clip and append to timeline
- **Clip Repositioning** — Drag clips to new positions with snap-to-edge
- **Snap-to-Edge** — Intelligent snapping to clip edges when dragging
- **Zoom Controls** — Adjustable timeline zoom (0.25 step) for precision editing
- **Playhead Scrubbing** — Click or drag the playhead to seek through the timeline
- **Gap Detection** — Visual feedback when playhead is in an empty segment
- **Frame Extraction** — FFmpeg-based frame thumbnails from backend (2 FPS)
- **Undo/Redo** — Full history support with Ctrl+Z / Ctrl+Y keyboard shortcuts

### Professional Interface ✅

- **Modern UI** — Clean, professional interface with cyberpunk aesthetics
- **Tool Panel** — Organized sidebar with Video, Audio, Image, and Text tool categories
- **Audio Waveform** — Visual waveform display using WaveSurfer.js
- **Volume Controls** — Per-clip volume sliders and mute toggles for audio tracks
- **Track Labels** — Clear visual indicators (V1, V2, O1, A1, etc.) for each track
- **Navbar** — Export dialog with resolution presets (720p / 1080p / 4K / Custom)
- **Undo/Redo UI** — Visual indicators with keyboard shortcut support (Ctrl+Z/Y)
- **Responsive Design** — Works seamlessly across different screen sizes
- **Real-time Updates** — Live preview of changes as you edit

### Planned / In Progress 🚧

- **AI Generation** — Generate video content using AI (UI placeholder exists)
- **AI Avatars** — AI avatar selection (placeholder cards in ToolPanel)
- **Image Tools** — Image upload and overlay support (UI stub exists)
- **Text Tools** — Text overlay and captions (UI stub exists)
- **Render & Export** — Server-side rendering via backend (route exists, action stub)
- **Timeline Actions** — Timeline-specific actions hook (empty file, planned)
- **Advanced Effects** — Video filters, transitions, and effects library
- **Collaboration** — Real-time multi-user editing capabilities

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with React 19
- **Language**: TypeScript for type-safe development
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) with custom cyber theme
- **UI Components**: [Radix UI](https://radix-ui.com) primitives with custom styling (53+ components)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) for efficient state handling
- **Icons**: [Lucide React](https://lucide.dev) for consistent iconography
- **Form Handling**: React Hook Form with Zod validation
- **Audio Visualization**: [WaveSurfer.js](https://wavesurfer.xyz/) for audio waveforms
- **Animations**: Embla Carousel and React Resizable Panels
- **Notifications**: Sonner for toast notifications

## 📁 Project Structure

```
src/
├── app/                          # Next.js app router
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Main editor interface
│   └── globals.css              # Global styles and cyber theme
│
├── components/                   # UI components
│   ├── Navbar.tsx               # Top navigation with export features & undo/redo
│   ├── Sidebar.tsx              # Tool selection sidebar
│   ├── VideoPreview.tsx         # Main video preview area with sync
│   ├── Timeline.tsx             # Re-export for backward compatibility
│   ├── ToolPanel.tsx            # Right panel for tool options
│   │
│   ├── Audio/                   # Audio components
│   │   └── AudiowaveForm.tsx    # WaveSurfer.js waveform visualization
│   │
│   ├── timeline/                # 🆕 Modular Timeline Components
│   │   ├── index.ts             # Export all timeline components
│   │   ├── Timeline.tsx         # Main timeline with multi-track groups & resize
│   │   ├── PlaybackControls.tsx # Play/pause/navigation buttons
│   │   ├── TimelineRuler.tsx    # Time ruler with playhead
│   │   ├── TimelineClipBlock.tsx# Individual clip rendering
│   │   └── hooks/
│   │       └── useTimelineControls.ts  # All timeline logic (~496 lines)
│   │
│   └── ui/                      # Reusable UI components (53+)
│
├── editor/                       # 🆕 Core Editor Architecture
│   ├── store/                   # Zustand state management
│   │   └── editor.store.ts      # Main editor store (~507 lines)
│   │
│   ├── types/                   # TypeScript definitions
│   │   ├── index.ts             # Export all types
│   │   ├── clip.types.ts        # Clip-related types (with group & trackIndex)
│   │   └── timeline.types.ts    # Timeline-related types
│   │
│   ├── engine/                  # Pure utility functions
│   │   ├── index.ts             # Export all engine functions
│   │   ├── time.ts              # Time formatting utilities
│   │   ├── clip.ts              # Clip calculations
│   │   └── timeline.ts          # Timeline calculations & segments
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
│   ├── utils/                   # Editor utilities
│   │   └── timeline.utils.ts    # Track grouping & filtering utilities
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

  // Multi-track support
  group: "video" | "overlay" | "audio";
  trackIndex: number;

  // Frame preview (video only)
  previewSessionId?: string;
  framesBaseUrl?: string;
  fps?: number;

  // Audio properties
  volume?: number;
  muted?: boolean;
}

interface EditorSnapshot {
  clips: TimelineClip[];
  currentTime: number;
  duration: number;
  zoom: number;
  activeClipId: string | null;
}

interface ClipPlayRange {
  start: number;
  end: number;
  duration: number;
}

// timeline.types.ts
type EditorMode = "idle" | "dragging" | "trimming" | "selecting";

interface SnapPoint {
  time: number;
  type: "clip-start" | "clip-end" | "playhead" | "marker";
  clipId?: string;
}

interface DragState {
  clipId: string | null;
  startX: number;
  startTime: number;
  offset: number;
}

interface TrimState {
  clipId: string | null;
  type: "start" | "end" | null;
  initialTrimStart: number;
  initialTrimEnd: number;
}

// Timeline segments
type TimelineSegment =
  | {
      type: "clip";
      start: number;
      end: number;
      clip: TimelineClip;
    }
  | {
      type: "gap";
      start: number;
      end: number;
    };
```

> **Note:** The store maintains undo/redo history using `EditorSnapshot` objects (max 50 past states).

### Engine (`src/editor/engine/`)

Pure utility functions with no side effects:

| Function                            | File        | Description                               |
| ----------------------------------- | ----------- | ----------------------------------------- |
| `formatTime(seconds)`               | time.ts     | Format to MM:SS                           |
| `formatTimePrecise(seconds)`        | time.ts     | Format to MM:SS.ms                        |
| `parseTime(timeStr)`                | time.ts     | Parse time string to seconds              |
| `clampTime(time, min, max)`         | time.ts     | Clamp time between bounds                 |
| `getEffectiveDuration(clip)`        | clip.ts     | Get duration after trim                   |
| `getClipPlayRange(clip)`            | clip.ts     | Get playable range after trim             |
| `isTimeInClip(clip, time)`          | clip.ts     | Check if time is in clip                  |
| `globalToClipTime(clip, time)`      | clip.ts     | Convert timeline time to clip-local time  |
| `clipToGlobalTime(clip, localTime)` | clip.ts     | Convert clip-local time to timeline time  |
| `buildTimelineWithGaps(clips)`      | timeline.ts | Build ordered segment array (clip or gap) |
| `getActiveSegment(segments, time)`  | timeline.ts | Get the segment at a given time           |
| `getTotalDuration(clips)`           | timeline.ts | Total duration from clips                 |

**Utility Functions** (`editor/utils/timeline.utils.ts`):

| Function                                | Description                            |
| --------------------------------------- | -------------------------------------- |
| `groupTracks(clips, group)`             | Groups clips by group type into tracks |
| `getTrackIndices(clips, group)`         | Get unique track indices for a group   |
| `getClipsForTrack(clips, group, index)` | Get clips for specific group and track |

### Selectors (`src/editor/selectors/`)

React hooks for derived/computed state:

| Hook                    | File                  | Description                      |
| ----------------------- | --------------------- | -------------------------------- |
| `useSortedClips()`      | clip.selectors.ts     | Clips sorted by start time       |
| `useActiveClip()`       | clip.selectors.ts     | Currently selected clip          |
| `useClipCount()`        | clip.selectors.ts     | Number of clips in timeline      |
| `useIsClipSelected(id)` | clip.selectors.ts     | Check if clip is selected        |
| `useHasActiveClip()`    | clip.selectors.ts     | Check if any clip is selected    |
| `useTimelineSegments()` | timeline.selectors.ts | Build timeline with gaps         |
| `useActiveSegment()`    | timeline.selectors.ts | Get segment at playhead          |
| `useTotalDuration()`    | timeline.selectors.ts | Total timeline duration          |
| `useIsInGap()`          | timeline.selectors.ts | Check if playhead is in gap      |
| `useIsTimelineEmpty()`  | timeline.selectors.ts | Check if timeline has no clips   |
| `usePlaybackState()`    | timeline.selectors.ts | isPlaying, currentTime, duration |

### Actions (`src/editor/actions/`)

React hooks for state mutations:

| Hook                   | File                | Actions                                                                                                                                          | Status |
| ---------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| `useClipActions()`     | clip.actions.ts     | selectClip, addClip, clearClips, setTrimStart, setTrimEnd, applyTrim, repositionClip, reorderClips, duplicateClip, clearSelection, getActiveClip | ✅     |
| `usePlaybackActions()` | playback.actions.ts | play, pause, togglePlay, seekTo, seekForward, seekBackward, goToStart, goToEnd                                                                   | ✅     |
| `useTimelineActions()` | timeline.actions.ts | _(empty stub — planned)_                                                                                                                         | 🚧     |
| `useRenderActions()`   | render.actions.ts   | _(empty stub — planned)_                                                                                                                         | 🚧     |

**Store Methods** (accessed via `useEditorStore`):

| Method                          | Description                                   |
| ------------------------------- | --------------------------------------------- |
| `uploadVideo(file)`             | Upload video file and create clip with frames |
| `uploadAudio(file)`             | Upload audio file and create clip             |
| `setClipVolume(clipId, volume)` | Set volume for audio clip (0-1)               |
| `toggleClipMute(clipId)`        | Toggle mute state for audio clip              |
| `addTrack(group)`               | Add new track to group                        |
| `getNextAvailableTrack(group)`  | Get next available track index                |
| `undo()`                        | Undo last action                              |
| `redo()`                        | Redo previously undone action                 |
| `pushToHistory()`               | Save current state to history                 |

### Timeline Components (`src/components/timeline/`)

| Component                | Lines | Purpose                                                                 |
| ------------------------ | ----- | ----------------------------------------------------------------------- |
| `Timeline.tsx`           | ~266  | Main orchestrator with multi-track groups, resizable height             |
| `PlaybackControls.tsx`   | ~50   | Prev / Play-Pause / Split / Next / Start + time display & zoom          |
| `TimelineRuler.tsx`      | ~70   | Second marks, drop indicator, red playhead with drag                    |
| `TimelineClipBlock.tsx`  | ~90   | Clip block with trim overlays, drag styling, name label, frame preview  |
| `useTimelineControls.ts` | ~496  | All timeline interaction logic (drag, trim, snap, split, playback loop) |

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

### Keyboard Shortcuts

| Key       | Action               | Status |
| --------- | -------------------- | ------ |
| `Ctrl+Z`  | Undo                 | ✅     |
| `Ctrl+Y`  | Redo                 | ✅     |
| `Space`   | Play/Pause           | 🚧     |
| `S`       | Split at playhead    | 🚧     |
| `Delete`  | Delete selected clip | 🚧     |
| `+` / `-` | Zoom in/out          | 🚧     |

## 🎨 Design System

The application features a custom cyberpunk-inspired design with:

- **Primary Colors**: Cyan (#5adaff) and Magenta (#ff5af1)
- **Dark Theme**: Deep space background (#0a0f24)
- **Timeline Background**: #0f1629 with #0a0f24 for clips area
- **Typography**: Geist font family for modern aesthetics
- **Responsive Grid**: Flexible layout adapting to screen sizes

### Timeline Visual Design

```
┌─────────────────────────────────────────────────────────────────────┐
│ ⬆ Resize Handle                                        [Grip Icon]  │  ← Resizable edge
├─────────────────────────────────────────────────────────────────────┤
│ ⏮ Prev │ Play │ ✂ Split │ Next ⏭ │ ⏮ Start │ 0:05/1:30            │  ← Controls
│ − │ Zoom: 1.00x │ +                                                 │  ← Zoom
├──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──────┤
│0s│1s│2s│3s│4s│5s│6s│7s│8s│9s│10s│...                                │  ← Ruler
├──┴──┴──┴──────────────────────────────────────────────────────────┬┤
│ VIDEO TRACKS                                            [+ Track]  ││  ← Group header
├────────────────────────────────────────────────────────────────────┤│
│V1│     │████ Clip 1 █████│      │███ Clip 2 ███│                   ││  ← Video track
│  │     │ [trim]  [trim]  │      │ [trim] [trim]│                   ││
├────────────────────────────────────────────────────────────────────┤│
│V2│     │                 │      │               │                   ││  ← Video track 2
├────────────────────────────────────────────────────────────────────┤│
│ OVERLAY TRACKS                                          [+ Track]  ││  ← Group header
├────────────────────────────────────────────────────────────────────┤│
│O1│     │████ Overlay ████│      │               │                   ││  ← Overlay track
├────────────────────────────────────────────────────────────────────┤│
│ AUDIO TRACKS                                            [+ Track]  ││  ← Group header
├────────────────────────────────────────────────────────────────────┤│
│A1│     │▁▃▅█▅▃▁ Audio ▁▃▅│      │               │                   ││  ← Audio track
│  │     │ [vol] [mute]    │      │               │                   ││
└────────────────────────────────────────────────────────────────────┴┘
              ▼ (red playhead)
```

**Features:**

- **Resizable Height**: Drag top edge to adjust timeline from 200px to 800px
- **Group-based Tracks**: Video, Overlay, and Audio groups with independent track management
- **Dynamic Track Addition**: Click "+ Track" button to add tracks per group
- **Track Labels**: V1, V2 (video), O1 (overlay), A1, A2 (audio)
- **Frame Thumbnails**: Video clips show extracted frames (2 FPS from backend)
- **Audio Waveforms**: Audio tracks display waveform visualization
- **Volume Controls**: Per-clip volume sliders and mute toggles

## 📦 Key Dependencies

**Core Framework:**

- **Next.js**: 16.0.7 (App Router with React 19)
- **React**: 19.2.0 with React DOM 19.2.0
- **TypeScript**: 5.x for type safety

**State & Data:**

- **Zustand**: 5.0.9 - Efficient global state management
- **Zod**: 4.1.13 - Schema validation
- **React Hook Form**: 7.68.0 - Form handling with validation

**UI Components (Radix UI - 27+ primitives):**

- Dialog, Dropdown, Popover, Tooltip, Select, Accordion
- Tabs, Slider, Switch, Checkbox, Radio Group
- Navigation Menu, Context Menu, Hover Card
- Alert Dialog, Collapsible, Progress, Separator
- And 10+ more accessible components

**Media & Visualization:**

- **WaveSurfer.js**: 7.12.1 - Audio waveform visualization
- **Recharts**: 2.15.4 - Data visualization charts
- **Embla Carousel**: 8.6.0 - Carousel interactions
- **React Resizable Panels**: 3.0.6 - Resizable layout panels

**Styling & Icons:**

- **Tailwind CSS**: 4.x with @tailwindcss/postcss
- **Lucide React**: 0.556.0 - Icon library (1000+ icons)
- **Tailwind Merge**: 3.4.0 - Class merging utility
- **Class Variance Authority**: 0.7.1 - Component variants
- **tw-animate-css**: 1.4.0 - Animation utilities

**Utilities:**

- **date-fns**: 4.1.0 - Date manipulation
- **Sonner**: 2.0.7 - Toast notifications
- **cmdk**: 1.1.1 - Command palette
- **next-themes**: 0.4.6 - Theme management
- **clsx**: 2.1.1 - Conditional classNames

## 🔮 Future Enhancements

**Completed:**

- [x] Timeline frame thumbnails (FFmpeg backend extraction at 2 FPS)
- [x] Undo/Redo history (50 state limit with Ctrl+Z/Y shortcuts)
- [x] Multi-track timeline (Video, Overlay, Audio groups)
- [x] Audio upload and playback
- [x] Volume controls and mute toggles
- [x] Resizable timeline panel (200-800px height)
- [x] Audio waveform visualization

**In Progress:**

- [ ] Timeline actions hook (`timeline.actions.ts` - empty stub)
- [ ] Render/export actions hook (`render.actions.ts` - empty stub)
- [ ] Backend API services (`editor/services/` - directory planned)
- [ ] Remaining keyboard shortcuts (Space, S, Delete, +/-)

**Planned:**

- [ ] Multi-track audio mixing
- [ ] Video effects and transitions
- [ ] Text overlays and captions with fonts
- [ ] Image upload and overlay support
- [ ] Extended format support (WebM, MKV)
- [ ] Advanced AI video generation
- [ ] Cloud-based rendering
- [ ] Real-time collaboration
- [ ] Mobile application
- [ ] Plugin system for custom effects

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
  EditorSnapshot,
  ClipPlayRange,
  EditorMode,
  SnapPoint,
  DragState,
  TrimState,
  TimelineSegment,
} from "@/editor/types";

// Engine utilities (pure functions)
import {
  formatTime,
  formatTimePrecise,
  parseTime,
  clampTime,
  getEffectiveDuration,
  getClipPlayRange,
  isTimeInClip,
  globalToClipTime,
  clipToGlobalTime,
  buildTimelineWithGaps,
  getActiveSegment,
  getTotalDuration,
} from "@/editor/engine";

// Utility functions
import {
  groupTracks,
  getTrackIndices,
  getClipsForTrack,
} from "@/editor/utils/timeline.utils";

// Selectors (read-only hooks)
import {
  useSortedClips,
  useActiveClip,
  useClipCount,
  useIsClipSelected,
  useHasActiveClip,
} from "@/editor/selectors";

import {
  useTimelineSegments,
  useActiveSegment,
  useTotalDuration,
  useIsInGap,
  useIsTimelineEmpty,
  usePlaybackState,
} from "@/editor/selectors";

// Actions (mutation hooks)
import { useClipActions, usePlaybackActions } from "@/editor/actions";

// Store (direct access)
import { useEditorStore } from "@/editor/store/editor.store";

// Components
import {
  Timeline,
  PlaybackControls,
  TimelineRuler,
  TimelineClipBlock,
} from "@/components/timeline";

import { AudioWaveform } from "@/components/Audio/AudiowaveForm";

// Re-export shortcut
import { useEditorStore } from "@/hooks/useEditor";
```

### File Responsibilities

| Layer          | Responsibility    | Side Effects     | Examples                           |
| -------------- | ----------------- | ---------------- | ---------------------------------- |
| **Types**      | Define shapes     | ❌ None          | TimelineClip, EditorSnapshot       |
| **Engine**     | Pure calculations | ❌ None          | formatTime, getClipPlayRange       |
| **Utils**      | Helper functions  | ❌ None          | groupTracks, getClipsForTrack      |
| **Selectors**  | Read state        | ❌ None          | useSortedClips, useActiveSegment   |
| **Actions**    | Write state       | ✅ Mutates store | useClipActions, usePlaybackActions |
| **Components** | Render UI         | ✅ DOM updates   | Timeline, VideoPreview             |
| **Store**      | Hold state        | ✅ State storage | useEditorStore (Zustand)           |
| **Hooks**      | Custom logic      | ⚠️ Varies        | useTimelineControls, useEditor     |

**Architecture Principles:**

- **Separation of Concerns**: Clear boundaries between data, logic, and UI
- **Pure Functions**: Engine and utils are testable without side effects
- **Single Responsibility**: Each module has one clear purpose
- **Layered Dependencies**: Components → Actions/Selectors → Store → Types
- **Type Safety**: Full TypeScript coverage with strict mode
