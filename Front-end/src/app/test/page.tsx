"use client";

import { useState } from "react";

// Test imports from each folder
import { TimelineClip, TimelineSegment } from "@/editor/types";
import { 
  formatTime, 
  formatTimeWithMs,
  clampTime,
  getEffectiveDuration,
  getClipPlayRange,
  buildTimelineWithGaps,
  getTotalDuration,
} from "@/editor/engine";
import { 
  useActiveClip, 
  useSortedClips, 
  useClipCount,
  useTotalDuration,
  useTimelineSegments,
  useActiveSegment,
  useIsTimelineEmpty,
} from "@/editor/selectors";
import { useClipActions, usePlaybackActions } from "@/editor/actions";

export default function TestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  // Add test result
  const addResult = (test: string, passed: boolean, details?: string) => {
    const status = passed ? "✅ PASS" : "❌ FAIL";
    const message = `${status}: ${test}${details ? ` - ${details}` : ""}`;
    setTestResults(prev => [...prev, message]);
  };

  // Clear results
  const clearResults = () => setTestResults([]);

  // ========================================
  // TEST 1: Engine - Pure Functions
  // ========================================
  const testEngineFunctions = () => {
    clearResults();
    addResult("=== ENGINE TESTS ===", true);

    // Test formatTime
    try {
      const result1 = formatTime(65);
      addResult("formatTime(65)", result1 === "1:05", `Expected "1:05", got "${result1}"`);
      
      const result2 = formatTime(3665);
      addResult("formatTime(3665)", result2 === "1:01:05", `Expected "1:01:05", got "${result2}"`);
      
      const result3 = formatTime(0);
      addResult("formatTime(0)", result3 === "0:00", `Expected "0:00", got "${result3}"`);
    } catch (e) {
      addResult("formatTime", false, String(e));
    }

    // Test formatTimeWithMs
    try {
      const result = formatTimeWithMs(65.5);
      addResult("formatTimeWithMs(65.5)", result === "1:05.50", `Expected "1:05.50", got "${result}"`);
    } catch (e) {
      addResult("formatTimeWithMs", false, String(e));
    }

    // Test clampTime
    try {
      const result1 = clampTime(15, 0, 10);
      addResult("clampTime(15, 0, 10)", result1 === 10, `Expected 10, got ${result1}`);
      
      const result2 = clampTime(-5, 0, 10);
      addResult("clampTime(-5, 0, 10)", result2 === 0, `Expected 0, got ${result2}`);
      
      const result3 = clampTime(5, 0, 10);
      addResult("clampTime(5, 0, 10)", result3 === 5, `Expected 5, got ${result3}`);
    } catch (e) {
      addResult("clampTime", false, String(e));
    }

    // Test getEffectiveDuration
    try {
      const testClip: TimelineClip = {
        id: "test-1",
        name: "Test Clip",
        src: "test.mp4",
        startTime: 0,
        duration: 10,
        trimStart: 2,
        trimEnd: 1,
      };
      const result = getEffectiveDuration(testClip);
      addResult("getEffectiveDuration", result === 7, `Expected 7, got ${result}`);
    } catch (e) {
      addResult("getEffectiveDuration", false, String(e));
    }

    // Test getClipPlayRange
    try {
      const testClip: TimelineClip = {
        id: "test-1",
        name: "Test Clip",
        src: "test.mp4",
        startTime: 5,
        duration: 10,
        trimStart: 2,
        trimEnd: 1,
      };
      const result = getClipPlayRange(testClip);
      addResult(
        "getClipPlayRange", 
        result.start === 7 && result.end === 14, 
        `Expected {start: 7, end: 14}, got {start: ${result.start}, end: ${result.end}}`
      );
    } catch (e) {
      addResult("getClipPlayRange", false, String(e));
    }

    // Test getTotalDuration
    try {
      const clips: TimelineClip[] = [
        { id: "1", name: "Clip 1", src: "a.mp4", startTime: 0, duration: 5, trimStart: 0, trimEnd: 0 },
        { id: "2", name: "Clip 2", src: "b.mp4", startTime: 5, duration: 10, trimStart: 0, trimEnd: 0 },
      ];
      const result = getTotalDuration(clips);
      addResult("getTotalDuration", result === 15, `Expected 15, got ${result}`);
    } catch (e) {
      addResult("getTotalDuration", false, String(e));
    }

    // Test buildTimelineWithGaps
    try {
      const clips: TimelineClip[] = [
        { id: "1", name: "Clip 1", src: "a.mp4", startTime: 0, duration: 5, trimStart: 0, trimEnd: 0 },
        { id: "2", name: "Clip 2", src: "b.mp4", startTime: 8, duration: 5, trimStart: 0, trimEnd: 0 },
      ];
      const result = buildTimelineWithGaps(clips);
      addResult(
        "buildTimelineWithGaps", 
        result.length === 3 && result[1].type === "gap",
        `Expected 3 segments with gap in middle, got ${result.length} segments`
      );
    } catch (e) {
      addResult("buildTimelineWithGaps", false, String(e));
    }
  };

  // ========================================
  // TEST 2: Selectors - Store Connection
  // ========================================
  const SelectorsTest = () => {
    // These will use real store data
    const activeClip = useActiveClip();
    const sortedClips = useSortedClips();
    const clipCount = useClipCount();
    const totalDuration = useTotalDuration();
    const segments = useTimelineSegments();
    const activeSegment = useActiveSegment();
    const isEmpty = useIsTimelineEmpty();

    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Selectors Test (Live Data)</h3>
        <div className="space-y-1 text-sm font-mono">
          <p>activeClip: {activeClip ? activeClip.name : "null"}</p>
          <p>sortedClips: {sortedClips.length} clips</p>
          <p>clipCount: {clipCount}</p>
          <p>totalDuration: {formatTime(totalDuration)}</p>
          <p>segments: {segments.length} segments</p>
          <p>activeSegment: {activeSegment ? activeSegment.type : "null"}</p>
          <p>isEmpty: {isEmpty ? "true" : "false"}</p>
        </div>
      </div>
    );
  };

  // ========================================
  // TEST 3: Actions - User Operations
  // ========================================
  const ActionsTest = () => {
    const { 
      addClip, 
      selectClip, 
      clearSelection, 
      duplicateClip,
      clearClips,
    } = useClipActions();

    const { 
      play, 
      pause, 
      togglePlay, 
      seekTo, 
      seekForward, 
      seekBackward,
      goToStart,
      goToEnd,
      isPlaying,
      currentTime,
    } = usePlaybackActions();

    const totalDuration = useTotalDuration();

    // Add a test clip
    const handleAddTestClip = () => {
      addClip({
        id: crypto.randomUUID(),
        name: `Test Clip ${Date.now()}`,
        src: "https://example.com/test.mp4",
        startTime: totalDuration, // Add at end
        duration: 10,
        trimStart: 0,
        trimEnd: 0,
      });
    };

    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Actions Test</h3>
        
        <div className="mb-4">
          <p className="text-sm">Current Time: {formatTime(currentTime)}</p>
          <p className="text-sm">Is Playing: {isPlaying ? "Yes" : "No"}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={handleAddTestClip}
            className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Add Clip
          </button>
          
          <button 
            onClick={clearClips}
            className="px-3 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            Clear All
          </button>
          
          <button 
            onClick={() => togglePlay()}
            className="px-3 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          
          <button 
            onClick={goToStart}
            className="px-3 py-2 bg-gray-600 rounded hover:bg-gray-700"
          >
            ⏮ Start
          </button>
          
          <button 
            onClick={() => seekBackward(5)}
            className="px-3 py-2 bg-gray-600 rounded hover:bg-gray-700"
          >
            ⏪ -5s
          </button>
          
          <button 
            onClick={() => seekForward(5)}
            className="px-3 py-2 bg-gray-600 rounded hover:bg-gray-700"
          >
            ⏩ +5s
          </button>
          
          <button 
            onClick={goToEnd}
            className="px-3 py-2 bg-gray-600 rounded hover:bg-gray-700"
          >
            ⏭ End
          </button>
          
          <button 
            onClick={() => seekTo(5)}
            className="px-3 py-2 bg-gray-600 rounded hover:bg-gray-700"
          >
            Seek 5s
          </button>
          
          <button 
            onClick={clearSelection}
            className="px-3 py-2 bg-gray-600 rounded hover:bg-gray-700"
          >
            Clear Select
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">🧪 Clipper Studio - Test Page</h1>

      {/* Engine Tests */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1️⃣ Engine Tests (Pure Functions)</h2>
        <button
          onClick={testEngineFunctions}
          className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 mb-4"
        >
          Run Engine Tests
        </button>
        
        {testResults.length > 0 && (
          <div className="p-4 bg-gray-800 rounded-lg font-mono text-sm">
            {testResults.map((result, i) => (
              <p key={i} className={result.includes("FAIL") ? "text-red-400" : "text-green-400"}>
                {result}
              </p>
            ))}
          </div>
        )}
      </section>

      {/* Selectors Tests */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2️⃣ Selectors Tests (Derived State)</h2>
        <SelectorsTest />
      </section>

      {/* Actions Tests */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3️⃣ Actions Tests (User Operations)</h2>
        <ActionsTest />
      </section>

      {/* Import Verification */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4️⃣ Import Verification</h2>
        <div className="p-4 bg-gray-800 rounded-lg">
          <p className="text-green-400">✅ Types imported successfully</p>
          <p className="text-green-400">✅ Engine imported successfully</p>
          <p className="text-green-400">✅ Selectors imported successfully</p>
          <p className="text-green-400">✅ Actions imported successfully</p>
        </div>
      </section>
    </div>
  );
}