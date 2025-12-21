import { useState } from "react";
import { useCalendar } from "../store/CalendarContext";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "../lib/utils";
import {
  Plus,
  Settings,
  Trash2,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  Repeat,
  Target,
} from "lucide-react";
import type { ClassItem, TaskType, TaskSettings } from "../types";
import { ClassModal } from "./ClassModal";
import { TaskTemplateModal } from "./TaskTemplateModal";
import { ConfirmModal } from "./ConfirmModal";

export function ClassSidebar() {
  const { classes, addClass, updateClass, deleteClass, confirm, modalState } =
    useCalendar();

  // Modal States
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | undefined>(
    undefined
  );

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedClassForTask, setSelectedClassForTask] = useState<
    ClassItem | undefined
  >(undefined);

  // Expanded/Collapsed state for classes
  const [expandedClasses, setExpandedClasses] = useState<
    Record<string, boolean>
  >({});

  const toggleExpand = (id: string) => {
    setExpandedClasses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenNewClass = () => {
    setEditingClass(undefined);
    setIsClassModalOpen(true);
  };

  const handleEditClass = (cls: ClassItem) => {
    setEditingClass(cls);
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (cls: ClassItem) => {
    if (editingClass) {
      updateClass(cls);
    } else {
      addClass(cls);
      // Auto expand new class
      setExpandedClasses((prev) => ({ ...prev, [cls.id]: true }));
    }
  };

  const handleOpenAddTask = (cls: ClassItem) => {
    setSelectedClassForTask(cls);
    setIsTaskModalOpen(true);
  };

  const handleSaveTaskTemplate = (task: {
    name: string;
    duration: number;
    type: TaskType;
    settings?: TaskSettings;
  }) => {
    if (!selectedClassForTask) return;

    const updatedClass = {
      ...selectedClassForTask,
      defaultTasks: [...(selectedClassForTask.defaultTasks || []), { ...task }],
    };

    updateClass(updatedClass);
    setExpandedClasses((prev) => ({
      ...prev,
      [selectedClassForTask.id]: true,
    }));
  };

  return (
    <>
      <div className="w-64 border-l border-gray-200 bg-gray-50 flex-shrink-0 flex flex-col h-full z-10 transition-all duration-300">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">My Classes</h3>
          <button
            onClick={handleOpenNewClass}
            className="p-1 hover:bg-gray-200 rounded text-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-2 overflow-y-auto">
          {classes.length === 0 && (
            <div className="text-center text-sm text-gray-400 py-4">
              Click + to create your first class.
            </div>
          )}
          {classes.map((cls: ClassItem) => (
            <div key={cls.id} className="flex flex-col">
              <DraggableClassItem
                classItem={cls}
                onEdit={() => handleEditClass(cls)}
                onDelete={async () => {
                  const ok = await confirm({
                    title: "Delete Class",
                    message: `Are you sure you want to delete "${cls.name}"? This will remove all associated events and blocks.`,
                  });
                  if (ok) {
                    deleteClass(cls.id);
                  }
                }}
                onAddTask={() => handleOpenAddTask(cls)}
                isExpanded={!!expandedClasses[cls.id]}
                onToggleExpand={() => toggleExpand(cls.id)}
              />

              {/* Sub-Tasks */}
              {expandedClasses[cls.id] && (
                <div className="ml-6 border-l-2 border-gray-200 pl-3 mt-1 space-y-1">
                  {(!cls.defaultTasks || cls.defaultTasks.length === 0) && (
                    <div className="text-[10px] text-gray-400 py-1">
                      No tasks
                    </div>
                  )}
                  {cls.defaultTasks?.map((task, i) => {
                    const Icon =
                      task.type === "practice"
                        ? Repeat
                        : task.type === "study"
                        ? Target
                        : GraduationCap;
                    const iconColor =
                      task.type === "practice"
                        ? "text-green-500"
                        : task.type === "study"
                        ? "text-purple-500"
                        : "text-blue-500";

                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-gray-600 py-1"
                      >
                        <Icon className={cn("w-3 h-3", iconColor)} />
                        <span className="truncate">{task.name}</span>
                        <span className="ml-auto text-gray-400 text-[10px]">
                          {task.duration}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSave={handleSaveClass}
        initialData={editingClass}
      />

      <TaskTemplateModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTaskTemplate}
        classItem={selectedClassForTask}
      />

      {modalState && (
        <ConfirmModal
          isOpen={modalState.isOpen}
          title={modalState.title}
          message={modalState.message}
          onConfirm={() => modalState.resolve(true)}
          onCancel={() => modalState.resolve(false)}
        />
      )}
    </>
  );
}

interface DraggableClassItemProps {
  classItem: ClassItem;
  onEdit: () => void;
  onDelete: () => void;
  onAddTask: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function DraggableClassItem({
  classItem,
  onEdit,
  onDelete,
  onAddTask,
  isExpanded,
  onToggleExpand,
}: DraggableClassItemProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `class-${classItem.id}`,
    data: {
      type: "CLASS",
      classItem,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-2 rounded-lg shadow-sm bg-white border border-gray-200 flex items-center gap-2 hover:shadow-md transition-all group select-none",
        "active:cursor-grabbing active:shadow-lg active:z-50"
      )}
    >
      <button
        onClick={onToggleExpand}
        className="text-gray-400 hover:text-gray-600 -ml-1"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      <div
        {...attributes}
        {...listeners}
        className="cursor-move flex items-center gap-2 flex-1 min-w-0"
      >
        <div
          className={cn(
            "w-2.5 h-2.5 rounded-full flex-shrink-0",
            classItem.color
          )}
        />
        <span className="font-medium text-gray-700 text-sm truncate">
          {classItem.name}
        </span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddTask();
          }}
          className="p-1 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded"
          title="Add Task"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded"
          title="Edit Class"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded"
          title="Delete Class"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
