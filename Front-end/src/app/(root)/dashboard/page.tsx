"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  LogOut,
  LayoutGrid,
  List,
  Plus,
  Clock,
  HardDrive,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react"

/* ── Demo data ── */
const INITIAL_PROJECTS = [
  { id: "1",  name: "Product Launch Ad",       duration: "0:32",  sizeMb: 48,  color: "from-violet-600 to-indigo-600" },
  { id: "2",  name: "Tutorial Episode 1",      duration: "5:14",  sizeMb: 320, color: "from-cyan-600 to-blue-600" },
  { id: "3",  name: "Instagram Reel",          duration: "0:15",  sizeMb: 12,  color: "from-pink-600 to-rose-600" },
  { id: "4",  name: "Company Intro",           duration: "1:45",  sizeMb: 156, color: "from-emerald-600 to-teal-600" },
  { id: "5",  name: "Wedding Highlights",      duration: "3:22",  sizeMb: 245, color: "from-amber-600 to-orange-600" },
  { id: "6",  name: "Music Video Draft",       duration: "4:01",  sizeMb: 410, color: "from-fuchsia-600 to-purple-600" },
  { id: "7",  name: "Podcast Clip #12",        duration: "1:08",  sizeMb: 65,  color: "from-sky-600 to-cyan-600" },
  { id: "8",  name: "Travel Vlog - Paris",     duration: "8:42",  sizeMb: 580, color: "from-rose-600 to-pink-600" },
  { id: "9",  name: "Fitness Montage",         duration: "2:17",  sizeMb: 190, color: "from-lime-600 to-green-600" },
  { id: "10", name: "Real Estate Walkthrough", duration: "6:33",  sizeMb: 475, color: "from-indigo-600 to-violet-600" },
  { id: "11", name: "YouTube Shorts #5",       duration: "0:58",  sizeMb: 34,  color: "from-red-600 to-orange-600" },
  { id: "12", name: "Birthday Recap",          duration: "2:45",  sizeMb: 210, color: "from-teal-600 to-emerald-600" },
  { id: "13", name: "Client Testimonial",      duration: "1:22",  sizeMb: 88,  color: "from-blue-600 to-indigo-600" },
  { id: "14", name: "Cooking Tutorial",        duration: "7:10",  sizeMb: 520, color: "from-orange-600 to-amber-600" },
  { id: "15", name: "Gaming Highlights",       duration: "3:55",  sizeMb: 310, color: "from-purple-600 to-fuchsia-600" },
  { id: "16", name: "TikTok Compilation",      duration: "0:47",  sizeMb: 28,  color: "from-cyan-600 to-sky-600" },
  { id: "17", name: "Conference Talk Edit",    duration: "12:30", sizeMb: 680, color: "from-slate-600 to-zinc-600" },
  { id: "18", name: "Drone Footage - Beach",   duration: "4:18",  sizeMb: 390, color: "from-sky-600 to-blue-600" },
]

const TOTAL_MEMORY_MB = 5120 // 5 GB quota
const ITEMS_PER_PAGE = 8

/* ── Helpers ── */
const GRADIENTS = [
  "from-violet-500 to-indigo-500",
  "from-cyan-500 to-blue-500",
  "from-pink-500 to-rose-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-fuchsia-500 to-purple-500",
]

function getAvatarGradient(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [page, setPage] = useState(1)
  const [projects, setProjects] = useState(INITIAL_PROJECTS)

  const firstLetter = user?.name?.charAt(0)?.toUpperCase() || "U"
  const avatarGradient = useMemo(() => getAvatarGradient(user?.name || "User"), [user?.name])

  const filteredProjects = useMemo(
    () => projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [search, projects]
  )

  // Reset to page 1 when search changes
  const safeePage = Math.min(page, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE) || 1)
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE) || 1
  const paginatedProjects = filteredProjects.slice(
    (safeePage - 1) * ITEMS_PER_PAGE,
    safeePage * ITEMS_PER_PAGE
  )

  const usedMemoryMb = projects.reduce((sum, p) => sum + p.sizeMb, 0)
  const memoryPercent = Math.round((usedMemoryMb / TOTAL_MEMORY_MB) * 100)
  const remainingMb = TOTAL_MEMORY_MB - usedMemoryMb

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    // If deleting leaves current page empty, go back one page
    const newTotal = projects.length - 1
    const newTotalPages = Math.ceil(newTotal / ITEMS_PER_PAGE) || 1
    if (page > newTotalPages) setPage(newTotalPages)
  }

  return (
    <div className="min-h-screen bg-[#0a0f24] text-white">
      {/* ── Top Navbar ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-[#5adaff]/10 bg-[#0f1629]/90 backdrop-blur-md px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-linear-to-br from-[#5adaff] to-[#3b82f6] flex items-center justify-center">
            <span className="text-sm font-black text-[#0a0f24]">CS</span>
          </div>
          <span className="text-lg font-bold text-[#5adaff] hidden sm:inline">Clipper Studio</span>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-md mx-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#5adaff]/40" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-[#5adaff]/20 bg-[#0a0f24] text-white placeholder:text-[#5adaff]/30 focus-visible:border-[#5adaff]/50 focus-visible:ring-[#5adaff]/20"
          />
        </div>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`size-9 rounded-full bg-linear-to-br ${avatarGradient} flex items-center justify-center text-sm font-bold text-white cursor-pointer ring-2 ring-[#5adaff]/20 hover:ring-[#5adaff]/50 transition-all`}>
              {firstLetter}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-[#5adaff]/20 bg-[#0f1629] text-white"
          >
            <DropdownMenuItem
              onClick={logout}
              className="gap-2 focus:bg-[#5adaff]/10 focus:text-[#5adaff] cursor-pointer"
            >
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* ── Stats Bar ── */}
      <div className="border-b border-[#5adaff]/10 bg-[#0f1629]/50 px-6 py-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left – View toggles & New */}
          <div className="flex items-center gap-2">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => setView("grid")}
              className={view === "grid"
                ? "bg-[#5adaff] text-[#0a0f24] hover:bg-[#5adaff]/80"
                : "text-[#5adaff]/50 hover:text-[#5adaff] hover:bg-[#5adaff]/10"}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="icon-sm"
              onClick={() => setView("list")}
              className={view === "list"
                ? "bg-[#5adaff] text-[#0a0f24] hover:bg-[#5adaff]/80"
                : "text-[#5adaff]/50 hover:text-[#5adaff] hover:bg-[#5adaff]/10"}
            >
              <List className="size-4" />
            </Button>

            <div className="h-6 w-px bg-[#5adaff]/10 mx-1" />

            <Button
              size="sm"
              className="bg-[#5adaff] text-[#0a0f24] font-semibold hover:bg-[#5adaff]/80 hover:shadow-[0_0_15px_rgba(90,218,255,0.25)] gap-1.5"
            >
              <Plus className="size-4" />
              New Project
            </Button>
          </div>

          {/* Right – Stats */}
          <div className="flex items-center gap-6 flex-wrap">
            {/* Project count */}
            <div className="flex items-center gap-2 text-sm">
              <FolderOpen className="size-4 text-[#5adaff]/60" />
              <span className="text-[#5adaff]/60">Projects:</span>
              <span className="font-semibold text-[#5adaff]">{projects.length}</span>
            </div>

            {/* Memory */}
            <div className="flex items-center gap-3 min-w-[260px]">
              <HardDrive className="size-4 text-[#5adaff]/60 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#5adaff]/60">
                    {(usedMemoryMb / 1024).toFixed(1)} GB / {(TOTAL_MEMORY_MB / 1024).toFixed(1)} GB
                  </span>
                  <span className="text-[#5adaff]/60">{memoryPercent}%</span>
                </div>
                {/* Custom progress bar with visible fill */}
                <div className="h-2 w-full rounded-full bg-[#5adaff]/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#5adaff] transition-all duration-500"
                    style={{ width: `${memoryPercent}%` }}
                  />
                </div>
                <p className="text-xs text-[#5adaff]/40 mt-1">
                  {(remainingMb / 1024).toFixed(2)} GB remaining
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Project Cards ── */}
      <main className="p-6">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#5adaff]/40">
            <FolderOpen className="size-16 mb-4" />
            <p className="text-lg">No projects found</p>
          </div>
        ) : view === "grid" ? (
          /* Grid view */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {paginatedProjects.map((project) => (
              <div
                key={project.id}
                className="group rounded-xl border border-[#5adaff]/10 bg-[#0f1629] overflow-hidden hover:border-[#5adaff]/30 hover:shadow-[0_0_25px_rgba(90,218,255,0.06)] transition-all cursor-pointer"
              >
                {/* Thumbnail */}
                <div className={`relative aspect-video bg-linear-to-br ${project.color} flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <span className="relative text-white/90 font-bold text-xl tracking-widest">
                    ▶
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white truncate">{project.name}</h3>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => { e.stopPropagation(); handleDelete(project.id) }}
                      className="text-red-400/50 hover:text-red-400 hover:bg-red-400/10 shrink-0 ml-2"
                      aria-label="Delete project"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#5adaff]/50">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {project.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="size-3" />
                      {project.sizeMb} MB
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="flex flex-col gap-2">
            {paginatedProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-4 rounded-lg border border-[#5adaff]/10 bg-[#0f1629] p-3 hover:border-[#5adaff]/30 hover:shadow-[0_0_25px_rgba(90,218,255,0.06)] transition-all cursor-pointer"
              >
                {/* Mini thumbnail */}
                <div className={`size-12 rounded-lg bg-linear-to-br ${project.color} flex items-center justify-center shrink-0`}>
                  <span className="text-white/90 text-xs font-bold">▶</span>
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{project.name}</h3>
                </div>

                {/* Duration */}
                <span className="flex items-center gap-1 text-xs text-[#5adaff]/50 shrink-0">
                  <Clock className="size-3" />
                  {project.duration}
                </span>

                {/* Size */}
                <span className="flex items-center gap-1 text-xs text-[#5adaff]/50 shrink-0 w-20 justify-end">
                  <HardDrive className="size-3" />
                  {project.sizeMb} MB
                </span>

                {/* Delete */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => { e.stopPropagation(); handleDelete(project.id) }}
                  className="text-red-400/50 hover:text-red-400 hover:bg-red-400/10 shrink-0"
                  aria-label="Delete project"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={safeePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-[#5adaff]/50 hover:text-[#5adaff] hover:bg-[#5adaff]/10 disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <Button
                key={num}
                variant={num === safeePage ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => setPage(num)}
                className={
                  num === safeePage
                    ? "bg-[#5adaff] text-[#0a0f24] hover:bg-[#5adaff]/80"
                    : "text-[#5adaff]/50 hover:text-[#5adaff] hover:bg-[#5adaff]/10"
                }
              >
                {num}
              </Button>
            ))}

            <Button
              variant="ghost"
              size="icon-sm"
              disabled={safeePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="text-[#5adaff]/50 hover:text-[#5adaff] hover:bg-[#5adaff]/10 disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </Button>

            <span className="text-xs text-[#5adaff]/40 ml-3">
              Showing {(safeePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safeePage * ITEMS_PER_PAGE, filteredProjects.length)} of {filteredProjects.length}
            </span>
          </div>
        )}
      </main>
    </div>
  )
}
