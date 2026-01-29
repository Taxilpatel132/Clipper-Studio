# ◆ AI Video Editor

A modern, web-based video editing application built with Next.js 16, featuring AI-powered tools and a professional timeline interface. This application provides intuitive video editing capabilities with a cyberpunk-inspired design.

## 🚀 Features

### Core Video Editing

- **Video Upload & Preview** - Support for MP4, MOV, AVI formats
- **Professional Timeline** - Drag-and-drop timeline with clip management
- **Real-time Playback** - Smooth video playback with time controls
- **Multi-clip Support** - Layer and sequence multiple video clips
- **Clip Trimming** - Soft trim with visual feedback
- **Clip Splitting** - Split clips at any point on the timeline
- **Snap-to-Grid** - Intelligent snapping for precise editing

### AI-Powered Tools

- **AI Generation** - Generate video content using artificial intelligence
- **Smart Editing** - Intelligent editing suggestions and automation

### Professional Interface

- **Modern UI** - Clean, professional interface with cyberpunk aesthetics
- **Tool Panel** - Organized sidebar with video, audio, image, and text tools
- **Responsive Design** - Works seamlessly across different screen sizes
- **Real-time Updates** - Live preview of changes as you edit
- **Zoom Controls** - Adjustable timeline zoom for precision editing

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
│   │   ├── index.ts             # Export all actions
│   │   ├── clip.actions.ts      # Clip CRUD operations
│   │   ├── playback.actions.ts  # Play/pause/seek actions
│   │   ├── timeline.actions.ts  # Timeline drag/zoom actions
│   │   └── render.actions.ts    # Export/render actions
│   │
│   └── timeline/                # Timeline utilities
│       └── timelineSegments.ts  # Segment calculations
│
├── hooks/                       # Custom React hooks
└── lib/                         # Utility functions
    └── utils.ts                 # cn() helper and utilities
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
│                     │ isPlaying   │                         │
│                     │ zoom        │                         │
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

// timeline.types.ts
type EditorMode = "idle" | "dragging" | "trimming" | "selecting";

interface SnapPoint {
  time: number;
  type: "clip-start" | "clip-end" | "playhead" | "marker";
  clipId?: string;
}
```

### Engine (`src/editor/engine/`)

Pure utility functions with no side effects:

| Function                             | File        | Description                   |
| ------------------------------------ | ----------- | ----------------------------- |
| `formatTime(seconds)`                | time.ts     | Format to MM:SS               |
| `formatTimePrecise(seconds)`         | time.ts     | Format to MM:SS.ms            |
| `parseTime(timeStr)`                 | time.ts     | Parse time string to seconds  |
| `clampTime(time, min, max)`          | time.ts     | Clamp time between bounds     |
| `getClipPlayRange(clip)`             | clip.ts     | Get playable range after trim |
| `getEffectiveDuration(clip)`         | clip.ts     | Get duration after trim       |
| `isTimeInClip(clip, time)`           | clip.ts     | Check if time is in clip      |
| `calculateTimelineDuration(clips)`   | timeline.ts | Total timeline duration       |
| `xToTime(x, rect, scroll, scale)`    | timeline.ts | Convert pixels to time        |
| `timeToX(time, scale)`               | timeline.ts | Convert time to pixels        |
| `generateSnapPoints(clips)`          | timeline.ts | Generate snap positions       |
| `findNearestSnapPoint(time, points)` | timeline.ts | Find closest snap             |

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

| Hook                   | File                | Actions                                                         |
| ---------------------- | ------------------- | --------------------------------------------------------------- |
| `useClipActions()`     | clip.actions.ts     | selectClip, deleteClip, duplicateClip, splitClipAtTime          |
| `usePlaybackActions()` | playback.actions.ts | play, pause, togglePlay, seekTo, goToNextClip, goToPreviousClip |
| `useTimelineActions()` | timeline.actions.ts | setZoom, zoomIn, zoomOut, repositionClip, startDrag, endDrag    |

### Timeline Components (`src/components/timeline/`)

| Component                | Lines | Purpose                                |
| ------------------------ | ----- | -------------------------------------- |
| `Timeline.tsx`           | ~60   | Main orchestrator component            |
| `PlaybackControls.tsx`   | ~50   | Play, pause, split, navigation buttons |
| `TimelineRuler.tsx`      | ~70   | Time ruler with playhead and markers   |
| `TimelineClipBlock.tsx`  | ~80   | Individual clip with trim handles      |
| `ZoomControls.tsx`       | ~30   | Zoom in/out controls                   |
| `useTimelineControls.ts` | ~300  | All timeline interaction logic         |

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

- [ ] Real-time collaboration features
- [ ] Advanced AI video generation
- [ ] Cloud-based rendering
- [ ] Extended format support (WebM, MKV)
- [ ] Mobile application
- [ ] Keyboard shortcuts
- [ ] Undo/Redo history
- [ ] Multi-track audio
- [ ] Video effects and transitions
- [ ] Text overlays and captions

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
import type { TimelineClip, EditorMode } from "@/editor/types";

// Engine utilities
import { formatTime, clampTime, xToTime } from "@/editor/engine";

// Selectors (hooks)
import { useSortedClips, useActiveClip } from "@/editor/selectors";

// Actions (hooks)
import { useClipActions, usePlaybackActions } from "@/editor/actions";

// Store
import { useEditorStore } from "@/editor/store/editor.store";

// Components
import { Timeline, PlaybackControls } from "@/components/timeline";
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
