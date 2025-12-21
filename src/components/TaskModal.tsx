import { useState, useEffect } from "react";
import type { Task, TaskType, ClassItem, Priority } from "../types";
import { X } from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, "id" | "createdAt">) => void;
  classItem?: ClassItem;
}

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  classItem,
}: TaskModalProps) {
  const [type, setType] = useState<TaskType>("study");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  // Settings
  const [duration, setDuration] = useState<number>(60);
  const [targetDuration, setTargetDuration] = useState<number>(120);
  const [startDuration, setStartDuration] = useState<number>(30);
  const [testDate, setTestDate] = useState<string>("");

  useEffect(() => {
    if (isOpen && classItem) {
      setTitle(
        `${classItem.name} ${type.charAt(0).toUpperCase() + type.slice(1)}`
      );
      setDuration(classItem.defaultDuration);
    }
  }, [isOpen, classItem, type]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      classId: classItem?.id || "",
      type,
      settings: {
        duration: type === "assignment" ? undefined : duration, // Assignment duration might be diff
        startDuration: type === "study" ? startDuration : undefined,
        targetDuration: type === "study" ? targetDuration : undefined,
        testDate: type === "study" ? testDate : undefined,
      },
      kanbanTask: {
        id: crypto.randomUUID(),
        title: title,
        description: "",
        priority,
        status: "todo",
        createdAt: new Date().toISOString(),
      },
    });
    // Reset or handled by parent unmounting
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Configure {classItem?.name} Task
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Task Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TaskType)}
              className="w-full border border-gray-300 rounded p-2"
            >
              <option value="study">Study</option>
              <option value="assignment">Assignment</option>
              <option value="practice">Practice</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full border border-gray-300 rounded p-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {type === "study" && (
            <div className="space-y-3 p-3 bg-gray-50 rounded border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700">
                Study Plan
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Start Duration (min)
                  </label>
                  <input
                    type="number"
                    value={startDuration}
                    onChange={(e) => setStartDuration(Number(e.target.value))}
                    className="w-full border rounded p-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Target Duration (min)
                  </label>
                  <input
                    type="number"
                    value={targetDuration}
                    onChange={(e) => setTargetDuration(Number(e.target.value))}
                    className="w-full border rounded p-1 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Test Date
                </label>
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full border rounded p-1 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Duration for this session (min)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
