import { useState } from "react";
import { useCalendar } from "../store/CalendarContext";
import type { TimeBlock } from "../types";
import { Plus, Trash2, X } from "lucide-react";

interface ScheduleBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function ScheduleBuilder({ isOpen, onClose }: ScheduleBuilderProps) {
  const { blocks, addBlock, deleteBlock } = useCalendar();
  const [selectedDay, setSelectedDay] = useState(1); // Monday default

  // Form state
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const [type, setType] = useState<TimeBlock["type"]>("class");

  if (!isOpen) return null;

  const dayBlocks = blocks
    .filter((b) => b.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addBlock({
      id: crypto.randomUUID(),
      name,
      startTime,
      duration,
      dayOfWeek: selectedDay,
      type,
    });

    // Reset form slightly for convenience
    setName("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex overflow-hidden shadow-xl">
        {/* Sidebar: Day Selection */}
        <div className="w-48 bg-gray-50 border-r border-gray-200 p-4">
          <h3 className="font-bold text-gray-700 mb-4">Select Day</h3>
          <div className="flex flex-col gap-2">
            {DAYS.map((day, idx) => (
              <button
                key={day}
                onClick={() => setSelectedDay(idx)}
                className={`text-left px-3 py-2 rounded text-sm ${
                  selectedDay === idx
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Blocks List & Form */}
        <div className="flex-1 flex flex-col p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{DAYS[selectedDay]} Schedule</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto mb-6 pr-2">
            <div className="space-y-3">
              {dayBlocks.length === 0 && (
                <p className="text-gray-400 text-center italic">
                  No blocks defined for this day.
                </p>
              )}
              {dayBlocks.map((block: TimeBlock) => (
                <div
                  key={block.id}
                  className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="w-20 font-mono text-sm text-gray-600">
                    {block.startTime}
                  </div>
                  <div className="w-16 text-sm text-gray-500">
                    {block.duration}m
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded text-xs uppercase font-semibold ${
                      block.type === "break"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {block.type}
                  </div>
                  <div className="flex-1 font-medium">{block.name}</div>
                  <button
                    onClick={() => deleteBlock(block.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Block Form */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold mb-3">Add New Block</h3>
            <form onSubmit={handleAddBlock} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">
                  Block Name
                </label>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g Physics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium mb-1">
                  Duration (m)
                </label>
                <input
                  type="number"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full border rounded p-2 text-sm"
                >
                  <option value="class">Class</option>
                  <option value="break">Break</option>
                  <option value="generic">Generic</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 shrink-0"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
