import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { ClassItem } from "../types";

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cls: ClassItem) => void;
  initialData?: ClassItem;
}

const COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
];

export function ClassModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ClassModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[10]); // Default blue

  // Template Management
  const [templates, setTemplates] = useState<
    { id: string; name: string; duration: number }[]
  >([]);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDuration, setNewTemplateDuration] = useState(30);

  // Load initial data for editing
  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name);
      setColor(initialData.color);
      setTemplates(
        initialData.defaultTasks?.map((t) => ({
          ...t,
          id: crypto.randomUUID(),
        })) || []
      );
    } else if (isOpen) {
      // Reset for new class
      setName("");
      setColor(COLORS[10]);
      setTemplates([]);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAddTemplate = () => {
    if (!newTemplateName) return;
    setTemplates((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newTemplateName,
        duration: newTemplateDuration,
      },
    ]);
    setNewTemplateName("");
    setNewTemplateDuration(30);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onSave({
      id: initialData?.id || crypto.randomUUID(),
      name,
      color,
      defaultTasks: templates.map(({ name, duration }) => ({ name, duration })),
    });

    // Clean up
    setName("");
    setTemplates([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {initialData ? "Edit Class" : "Create New Class"}
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Class Name
              </label>
              <input
                autoFocus={!initialData}
                type="text"
                placeholder="e.g. Calculus"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Color Tag
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full ${c} ${
                      color === c ? "ring-2 ring-offset-1 ring-gray-400" : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-2 text-gray-700">Tasks</h4>
            <p className="text-xs text-gray-500 mb-3">
              Pre-defined tasks you can quickly add to your schedule.
            </p>

            {/* Template List */}
            <div className="space-y-2 mb-3">
              {templates.length === 0 && (
                <div className="text-xs text-center text-gray-400 italic">
                  No tasks yet
                </div>
              )}
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100"
                >
                  <span className="flex-1 text-sm">{t.name}</span>
                  <span className="text-xs text-gray-500">{t.duration}m</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(t.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Template Form */}
            <div className="flex gap-2 items-end bg-gray-50 p-2 rounded">
              <div className="flex-1">
                <label className="block text-[10px] font-medium text-gray-500 mb-1">
                  Task Name
                </label>
                <input
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full text-sm p-1 border rounded"
                  placeholder="e.g. Homework"
                />
              </div>
              <div className="w-20">
                <label className="block text-[10px] font-medium text-gray-500 mb-1">
                  Min
                </label>
                <input
                  type="number"
                  value={newTemplateDuration}
                  onChange={(e) =>
                    setNewTemplateDuration(Number(e.target.value))
                  }
                  className="w-full text-sm p-1 border rounded"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTemplate}
                disabled={!newTemplateName}
                className="bg-blue-100 text-blue-700 p-1.5 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            {initialData ? "Save Changes" : "Create Class"}
          </button>
        </form>
      </div>
    </div>
  );
}
