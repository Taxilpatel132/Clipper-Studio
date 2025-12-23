# ◆ AI Video Editor

A modern, web-based video editing application built with Next.js 16, featuring AI-powered tools and a professional timeline interface. This application provides intuitive video editing capabilities with a cyberpunk-inspired design.

## 🚀 Features

### Core Video Editing

- **Video Upload & Preview** - Support for MP4, MOV, AVI formats
- **Professional Timeline** - Drag-and-drop timeline with clip management
- **Real-time Playback** - Smooth video playback with time controls
- **Multi-clip Support** - Layer and sequence multiple video clips

### AI-Powered Tools

- **AI Generation** - Generate video content using artificial intelligence
- **Smart Editing** - Intelligent editing suggestions and automation

### Professional Interface

- **Modern UI** - Clean, professional interface with cyberpunk aesthetics
- **Tool Panel** - Organized sidebar with video, audio, image, and text tools
- **Responsive Design** - Works seamlessly across different screen sizes
- **Real-time Updates** - Live preview of changes as you edit

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
├── app/                    # Next.js app router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main editor interface
│   └── globals.css        # Global styles and cyber theme
├── components/            # UI components
│   ├── Navbar.tsx         # Top navigation with export features
│   ├── Sidebar.tsx        # Tool selection sidebar
│   ├── VideoPreview.tsx   # Main video preview area
│   ├── Timeline.tsx       # Professional timeline editor
│   ├── ToolPanel.tsx      # Right panel for tool options
│   └── ui/               # Reusable UI components (40+ components)
├── editor/               # Core editor functionality
│   ├── store/           # Zustand state management
│   ├── actions/         # Editor actions and operations
│   ├── engine/          # Video processing engine
│   └── types/           # TypeScript type definitions
├── hooks/               # Custom React hooks
└── lib/                # Utility functions and configurations
```

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

1. **Upload Video**: Click the upload button in the Video tool panel
2. **Timeline Editing**: Drag clips on the timeline to arrange them
3. **Playback Controls**: Use the play/pause controls to preview your work
4. **AI Features**: Access AI-powered generation and editing tools
5. **Export**: Use the export dialog to render your final video

## 🎨 Design System

The application features a custom cyberpunk-inspired design with:

- **Primary Colors**: Cyan (#5adaff) and Magenta (#ff5af1)
- **Dark Theme**: Deep space background (#0a0f24)
- **Typography**: Geist font family for modern aesthetics
- **Responsive Grid**: Flexible layout adapting to screen sizes

## 📦 Key Dependencies

- **UI Framework**: Radix UI components for accessibility
- **Animation**: Embla Carousel for smooth interactions
- **Date Handling**: date-fns for time-based operations
- **Charts**: Recharts for data visualization
- **Notifications**: Sonner for user feedback

## 🔮 Future Enhancements

- Real-time collaboration features
- Advanced AI video generation
- Cloud-based rendering
- Extended format support
- Mobile application

## 🚀 Deployment

The application is optimized for deployment on:

- [Vercel](https://vercel.com) (recommended)
- [Netlify](https://netlify.com)
- Any Node.js hosting platform

For detailed deployment instructions, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## 📄 License

This project is part of the Clipper Studio suite - a comprehensive video editing platform.
