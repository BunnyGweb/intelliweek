import { useState } from "react";
import {
  X,
  Plus,
  Clock,
  Target,
  Repeat,
  GraduationCap,
  Calendar as CalendarIcon,
} from "lucide-react";
import type { ClassItem, TaskType, TaskSettings } from "../types";

interface TaskTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: {
    name: string;
    duration: number;
    type: TaskType;
    settings?: TaskSettings;
  }) => void;
  classItem?: ClassItem;
}

export function TaskTemplateModal({
  isOpen,
  onClose,
  onSave,
  classItem,
}: TaskTemplateModalProps) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [type, setType] = useState<TaskType>("assignment");

  // Type-specific settings
  const [repetitions, setRepetitions] = useState(5);
  const [testDate, setTestDate] = useState("");
  const [targetDuration, setTargetDuration] = useState(120);
  const [startDuration, setStartDuration] = useState(20);
  const [growthFactor, setGrowthFactor] = useState(1.1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    let settings: TaskSettings = { duration };
    if (type === "practice") {
      settings.repetitions = repetitions;
    } else if (type === "study") {
      settings.targetDuration = targetDuration;
      settings.startDuration = startDuration;
      settings.growthFactor = growthFactor;
      settings.testDate = testDate;
    } else if (type === "assignment") {
      settings.testDate = testDate;
    }

    onSave({ name, duration, type, settings });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName("");
    setDuration(30);
    setType("assignment");
    setRepetitions(5);
    setTestDate("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">New Task</h3>
            {classItem && (
              <p className="text-sm text-blue-600 font-medium">
                for {classItem.name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Selection */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                id: "assignment",
                label: "Assignment",
                icon: GraduationCap,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                id: "practice",
                label: "Practice",
                icon: Repeat,
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                id: "study",
                label: "Study",
                icon: Target,
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id as TaskType)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                  type === t.id
                    ? `border-blue-600 ${t.bg} ring-2 ring-blue-100`
                    : "border-gray-100 hover:border-gray-200"
                )}
              >
                <t.icon className={cn("w-5 h-5", t.color)} />
                <span className="text-xs font-semibold">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Task Name
              </label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Read Chapter 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-lg p-2.5 focus:border-blue-600 outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Duration (min)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full border-2 border-gray-100 rounded-lg p-2.5 pl-10 focus:border-blue-600 outline-none transition-colors"
                  />
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {(type === "assignment" || type === "study") && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    {type === "study" ? "Test Date" : "Due Date"}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                      className="w-full border-2 border-gray-100 rounded-lg p-2.5 pl-10 focus:border-blue-600 outline-none transition-colors"
                    />
                    <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>
              )}

              {type === "practice" && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Repetitions
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={repetitions}
                      onChange={(e) => setRepetitions(Number(e.target.value))}
                      className="w-full border-2 border-gray-100 rounded-lg p-2.5 pl-10 focus:border-blue-600 outline-none transition-colors"
                    />
                    <Repeat className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>
              )}
            </div>

            {type === "study" && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-purple-50 rounded-lg border border-purple-100 animate-in slide-in-from-top-2 duration-300">
                <div className="col-span-2 text-[10px] font-bold text-purple-600 uppercase mb-1">
                  Study Parameters
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-purple-700">
                    Daily Target (min)
                  </label>
                  <input
                    type="number"
                    value={targetDuration}
                    onChange={(e) => setTargetDuration(Number(e.target.value))}
                    className="w-full bg-white border border-purple-200 rounded p-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-purple-700">
                    Start (min)
                  </label>
                  <input
                    type="number"
                    value={startDuration}
                    onChange={(e) => setStartDuration(Number(e.target.value))}
                    className="w-full bg-white border border-purple-200 rounded p-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-purple-700">
                    Growth Factor
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={growthFactor}
                    onChange={(e) => setGrowthFactor(Number(e.target.value))}
                    className="w-full bg-white border border-purple-200 rounded p-1.5 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Plus className="w-5 h-5" /> Add Task
          </button>
        </form>
      </div>
    </div>
  );
}

// Simple internal cn if needed, but App usually has it
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
