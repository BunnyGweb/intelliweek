import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  PlusCircle,
  Target,
  Repeat,
  GraduationCap,
  Clock,
  Trash2,
  GripHorizontal,
  RotateCcw,
} from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";
import {
  startOfWeek,
  addDays,
  format,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { useCalendar } from "../store/CalendarContext";
import { cn } from "../lib/utils";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import {
  DAY_HEIGHT,
  getPositionFromTime,
  getHeightFromDuration,
  START_HOUR,
  END_HOUR,
  PIXELS_PER_MINUTE,
  getTimeFromPosition,
} from "../lib/timeUtils";
import type {
  TimeBlock,
  CalendarEvent,
  TaskType,
  TaskSettings,
  ScheduledTask,
} from "../types";

export function CalendarGrid() {
  const { currentDate, timeFormat } = useCalendar();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
  const weekEnd = addDays(weekStart, 6);

  const days = eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  });

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header Row */}
      <div className="flex border-b border-gray-200 flex-shrink-0">
        <div className="w-12 border-r border-gray-100 bg-gray-50/50" />{" "}
        {/* Time labels column */}
        <div className="flex-1 grid grid-cols-7 ">
          {days.map((day) => (
            <div
              key={day.toString()}
              className="text-center py-2 border-r border-gray-100 last:border-r-0"
            >
              <div className="text-xs font-medium text-gray-500 uppercase">
                {format(day, "EEE")}
              </div>
              <div
                className={cn(
                  "text-xl font-semibold mt-1 w-8 h-8 flex items-center justify-center mx-auto rounded-full",
                  isSameDay(day, new Date())
                    ? "bg-blue-600 text-white"
                    : "text-gray-900"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Timeline Grid */}
      <div className="flex-1 overflow-y-auto flex relative">
        {/* Time Labels */}
        <div
          className="w-12 flex-shrink-0 border-r border-gray-100 bg-gray-50/30 text-[10px] text-gray-400 font-mono relative"
          style={{ height: DAY_HEIGHT }}
        >
          {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => {
            const hour = START_HOUR + i;
            const displayHour =
              timeFormat === "12h"
                ? `${hour % 12 || 12}${hour >= 12 ? "pm" : "am"}`
                : `${hour}:00`;

            return (
              <div
                key={i}
                className="absolute w-full text-right pr-2 -mt-2"
                style={{ top: i * 60 * PIXELS_PER_MINUTE }}
              >
                {displayHour}
              </div>
            );
          })}
        </div>

        {/* Days Columns */}
        <div
          className="flex-1 grid grid-cols-7 relative"
          style={{ height: DAY_HEIGHT }}
        >
          {/* Horizontal Grid Lines */}
          {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
            <div
              key={`line-${i}`}
              className="absolute left-0 right-0 border-t border-gray-50 pointer-events-none"
              style={{ top: i * 60 * PIXELS_PER_MINUTE }}
            />
          ))}

          {days.map((day) => (
            <DayColumn key={day.toString()} date={day} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayColumn({ date }: { date: Date }) {
  const { blocks, events, addBlock, timeFormat } = useCalendar();
  const dayOfWeek = date.getDay(); // 0-6
  const [hoverTime, setHoverTime] = useState<string | null>(null);

  // Drag to Create State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [dragCurrentY, setDragCurrentY] = useState<number | null>(null);

  // Get blocks for this day template
  const dayBlocks = blocks.filter((b) => b.dayOfWeek === dayOfWeek);

  // Get events for this day
  // Get events for this day
  const dayEvents = events.filter((e) => isSameDay(e.date, date));

  // Current Time State
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const isToday = isSameDay(date, new Date());
  const currentTimePosition = getPositionFromTime(format(now, "HH:mm"));

  const { setNodeRef, isOver } = useDroppable({
    id: `day-${format(date, "yyyy-MM-dd")}`,
    data: {
      type: "DAY_COLUMN",
      date,
    },
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start if clicking directly on the column, not on a child block
    if (e.target !== e.currentTarget) return;

    setIsDragging(true);
    setDragStartY(e.nativeEvent.offsetY);
    setDragCurrentY(e.nativeEvent.offsetY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Red Line Logic
    if (!isDragging && isOver) {
      const relativeY = e.nativeEvent.offsetY;
      setHoverTime(getTimeFromPosition(relativeY));
    }

    // Drag Logic
    if (isDragging) {
      setDragCurrentY(e.nativeEvent.offsetY);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStartY !== null && dragCurrentY !== null) {
      const start = Math.min(dragStartY, dragCurrentY);
      const end = Math.max(dragStartY, dragCurrentY);
      const height = end - start;

      // Minimum threshold to avoid accidental clicks
      if (height > 10) {
        const startTime = getTimeFromPosition(start);
        const duration = Math.round(height / PIXELS_PER_MINUTE / 15) * 15; // Snap dur to 15m

        addBlock({
          id: crypto.randomUUID(),
          name: "New Block",
          startTime,
          duration: Math.max(duration, 15), // Min 15m
          dayOfWeek: date.getDay(),
          type: "class",
        });
      }
    }
    setIsDragging(false);
    setDragStartY(null);
    setDragCurrentY(null);
  };

  // Drag Preview Calculation
  let previewStyle = {};
  let previewStartTime = "";
  let previewDuration = 0;

  if (isDragging && dragStartY !== null && dragCurrentY !== null) {
    const start = Math.min(dragStartY, dragCurrentY);
    const end = Math.max(dragStartY, dragCurrentY);
    const height = end - start;

    previewStyle = {
      top: start,
      height: height,
    };
    previewStartTime = getTimeFromPosition(start);
    previewDuration = Math.round(height / PIXELS_PER_MINUTE);
  }

  return (
    <div
      ref={setNodeRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setHoverTime(null);
        if (isDragging) {
          setIsDragging(false);
          setDragStartY(null);
          setDragCurrentY(null);
        }
      }}
      className={cn(
        "border-r border-gray-100 last:border-r-0 relative h-full transition-colors select-none",
        isOver ? "bg-blue-50/30" : ""
      )}
    >
      {/* Layer 1: Time Blocks (Background) */}
      {dayBlocks.map((block) => (
        <BlockSlot key={block.id} date={date} block={block} />
      ))}

      {/* Layer 2: Independent Events (Foreground) */}
      {(() => {
        // Simple overlap detection
        const sortedEvents = [...dayEvents].sort(
          (a, b) =>
            getPositionFromTime(a.startTime) - getPositionFromTime(b.startTime)
        );
        const columns: CalendarEvent[][] = [];

        sortedEvents.forEach((evt) => {
          let placed = false;
          const evtTop = getPositionFromTime(evt.startTime);

          for (let col = 0; col < columns.length; col++) {
            const lastInCol = columns[col][columns[col].length - 1];
            const lastInColTop = getPositionFromTime(lastInCol.startTime);
            const lastInColDur =
              lastInCol.tasks.reduce((a, b) => a + b.duration, 0) || 60;
            const lastInColBottom =
              lastInColTop + lastInColDur * PIXELS_PER_MINUTE;

            if (evtTop >= lastInColBottom) {
              columns[col].push(evt);
              placed = true;
              break;
            }
          }

          if (!placed) {
            columns.push([evt]);
          }
        });

        const colWidth = 100 / columns.length;

        return columns.flatMap((col, colIdx) =>
          col.map((evt) => (
            <div
              key={evt.id}
              className="absolute z-10 p-0.5"
              style={{
                top: getPositionFromTime(evt.startTime),
                left: `${colIdx * colWidth}%`,
                width: `${colWidth}%`,
              }}
            >
              <ClassInstance event={evt} />
            </div>
          ))
        );
      })()}

      {/* Drag Prevention Layer - Red Line */}
      {!isDragging && isOver && hoverTime && (
        <div
          className="absolute left-0 right-0 border-t-2 border-red-500 z-50 pointer-events-none flex items-center"
          style={{ top: getPositionFromTime(hoverTime) }}
        >
          <div className="bg-red-500 text-white text-[10px] px-1 rounded-r font-mono -mt-3 ml-0">
            {hoverTime}
          </div>
        </div>
      )}

      {/* Current Time Indicator */}
      {isToday && (
        <div
          className="absolute left-0 right-0 z-40 pointer-events-none flex items-center"
          style={{ top: currentTimePosition }}
        >
          <div className="absolute -left-1 w-2 h-2 bg-red-500 rounded-full" />
          <div className="w-full border-t border-red-500/50" />
          <div className="absolute -left-10 bg-red-500 text-white text-[9px] font-bold px-1 rounded-sm shadow-sm">
            {timeFormat === "12h"
              ? format(now, "h:mm a")
              : format(now, "HH:mm")}
          </div>
        </div>
      )}

      {/* Drag Preview */}
      {isDragging && (
        <div
          className="absolute left-1 right-1 bg-blue-500/20 border border-blue-500 rounded z-40 flex flex-col justify-center items-center pointer-events-none"
          style={previewStyle}
        >
          <span className="text-xs font-bold text-blue-700">
            {previewStartTime}
          </span>
          <span className="text-[10px] text-blue-600 font-medium">
            {previewDuration}m
          </span>
        </div>
      )}
    </div>
  );
}

function BlockSlot({ date, block }: { date: Date; block: TimeBlock }) {
  const { deleteBlock, updateBlock, confirm, modalState } = useCalendar();
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `${format(date, "yyyy-MM-dd")}-block-${block.id}`,
    data: {
      type: "BLOCK_DROP_ZONE", // Distinct from "BLOCK" which is the draggable item
      date,
      block,
    },
    disabled: block.type === "break",
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `block-${block.id}`,
    data: {
      type: "BLOCK", // This identifies it as a moving block
      block,
    },
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(block.name);

  const top = getPositionFromTime(block.startTime);
  const height = getHeightFromDuration(block.duration);

  // Combine refs (function ref pattern)
  const setNodeRef = (node: HTMLElement | null) => {
    setDroppableRef(node);
    setDraggableRef(node);
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
      }
    : undefined;

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    updateBlock({ ...block, name: editName });
    setIsEditing(false);
  };

  if (block.type === "break") {
    // Break blocks are not draggable (for now) but exist on grid
    return (
      <div
        className="absolute left-1 right-1 p-2 text-center text-xs font-semibold text-gray-400 bg-gray-100/50 rounded border border-dashed border-gray-200 flex items-center justify-center"
        style={{ top, height }}
      >
        {block.name}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ top, height, ...style }}
      className={cn(
        "absolute left-1 right-1 border border-dashed rounded-md p-1 flex flex-col transition-colors select-none",
        isOver
          ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200 z-10"
          : "bg-gray-50/20 border-gray-200 z-0",
        isDragging ? "opacity-50" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...listeners}
      {...attributes}
    >
      <div className="flex justify-between items-center px-1 flex-shrink-0 mb-1">
        {isEditing ? (
          <form onSubmit={handleRename} className="flex-1 mr-2">
            <input
              autoFocus
              className="w-full text-[10px] font-bold text-gray-600 uppercase tracking-wider bg-white border border-blue-300 rounded px-1"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsEditing(false);
                e.stopPropagation(); // Prevent drag interference? Use pointer events?
                // Input naturally captures keys, but draggable might interfere with click-drag.
                // We rely on pointer sensors.
              }}
              onPointerDown={(e) => e.stopPropagation()} // Allow selecting text
            />
          </form>
        ) : (
          <span
            className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate flex-1 cursor-text"
            onDoubleClick={() => setIsEditing(true)}
          >
            {block.name}
          </span>
        )}

        <div className="flex items-center gap-1">
          {!isHovered && (
            <div className="flex flex-row gap-1 items-end leading-none">
              <span className="text-[8px] text-gray-400 font-medium">
                {block.duration}m
              </span>
            </div>
          )}
          {isHovered && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={async () => {
                const ok = await confirm({
                  title: "Delete Block",
                  message: `Are you sure you want to delete "${block.name}"?`,
                });
                if (ok) {
                  deleteBlock(block.id);
                }
              }}
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {modalState && (
        <ConfirmModal
          isOpen={modalState.isOpen}
          title={modalState.title}
          message={modalState.message}
          onConfirm={() => modalState.resolve(true)}
          onCancel={() => modalState.resolve(false)}
        />
      )}
    </div>
  );
}

function ClassInstance({ event }: { event: CalendarEvent }) {
  const { classes, updateEvent, deleteEvent, confirm, modalState } =
    useCalendar();
  const classInfo = classes.find((c) => c.id === event.classId);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Resize State
  const [isResizing, setIsResizing] = useState(false);
  const initialResizeState = useRef<{
    startY: number;
    startDuration: number;
  } | null>(null);

  // Draggable State
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `event-${event.id}`,
      data: {
        type: "EVENT",
        event,
      },
      disabled: isResizing, // Disable drag when resizing
    });

  // Popover State
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  // Custom Task State
  const [taskName, setTaskName] = useState("");
  const [taskDuration, setTaskDuration] = useState(30);
  const [taskType, setTaskType] = useState<TaskType>("assignment");
  const [repetitions, setRepetitions] = useState(5);

  // Resize Effect
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!initialResizeState.current) return;
      const { startY, startDuration } = initialResizeState.current;
      const deltaY = e.clientY - startY;
      const deltaMinutes = deltaY / PIXELS_PER_MINUTE;

      // Snap to 15m
      const snappedDelta = Math.round(deltaMinutes / 15) * 15;
      const newDuration = Math.max(15, startDuration + snappedDelta);

      if (event.tasks.length === 0) return;

      const currentTotal = event.tasks.reduce((a, b) => a + b.duration, 0);
      const diff = newDuration - currentTotal;
      if (diff === 0) return;

      let newTasks = [...event.tasks];

      if (diff > 0) {
        // EXPANDING
        const lastTaskIdx = newTasks.length - 1;
        if (newTasks[lastTaskIdx].type === "free") {
          newTasks[lastTaskIdx] = {
            ...newTasks[lastTaskIdx],
            duration: newTasks[lastTaskIdx].duration + diff,
          };
        } else {
          // Create new free task
          newTasks.push({
            id: crypto.randomUUID(),
            title: "Free",
            duration: diff,
            completed: false,
            type: "free",
            settings: { duration: diff },
          });
        }
      } else {
        // SHRINKING (diff is negative)
        let remainingDiff = Math.abs(diff);

        // 1. Reduce Free Time first (loop backwards)
        for (let i = newTasks.length - 1; i >= 0; i--) {
          if (remainingDiff <= 0) break;
          if (newTasks[i].type === "free") {
            const available = newTasks[i].duration;
            const reduceBy = Math.min(available, remainingDiff);
            newTasks[i] = { ...newTasks[i], duration: available - reduceBy };
            remainingDiff -= reduceBy;
          }
        }

        // Clean up zero duration tasks
        newTasks = newTasks.filter((t) => t.duration > 0);

        // 2. Proportionally reduce other tasks if still need to shrink
        if (remainingDiff > 0) {
          const otherTasksTotal = newTasks.reduce(
            (acc, t) => acc + t.duration,
            0
          );

          if (otherTasksTotal > 0) {
            const targetTotal = Math.max(15, otherTasksTotal - remainingDiff);
            const ratio = targetTotal / otherTasksTotal;

            newTasks = newTasks.map((t) => {
              let newSize = Math.floor(t.duration * ratio);
              newSize = Math.max(5, newSize); // Min 5m
              return { ...t, duration: newSize };
            });

            // Fix rounding errors
            const newTotal = newTasks.reduce((a, b) => a + b.duration, 0);
            if (newTotal < targetTotal && newTasks.length > 0) {
              newTasks[newTasks.length - 1].duration += targetTotal - newTotal;
            }
          }
        }
      }

      updateEvent({ ...event, tasks: newTasks });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      initialResizeState.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, event, updateEvent]);

  if (!classInfo) return null;

  const totalTaskDuration = event.tasks.reduce((acc, t) => acc + t.duration, 0);
  const displayDuration = totalTaskDuration === 0 ? 60 : totalTaskDuration;

  const isSmall = displayDuration < 45; // Threshold for "Small"

  // If resizing, don't auto-expand on hover
  const showExpanded = isHovered && isSmall && !isResizing && !isDragging;

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    initialResizeState.current = {
      startY: e.clientY,
      startDuration: displayDuration,
    };

    if (event.tasks.length === 0) {
      const newTask: ScheduledTask = {
        id: crypto.randomUUID(),
        title: "Free",
        duration: 60,
        completed: false,
        type: "free",
        settings: {},
      };
      updateEvent({ ...event, tasks: [newTask] });
    }
  };

  const handleAddTemplateTask = (template: {
    name: string;
    duration: number;
    type: TaskType;
    settings?: TaskSettings;
  }) => {
    const newTask: ScheduledTask = {
      id: crypto.randomUUID(),
      title: template.name,
      duration: template.duration,
      completed: false,
      type: template.type,
      settings: template.settings,
    };
    const updatedTasks = [...event.tasks, newTask];
    updateEvent({ ...event, tasks: updatedTasks });
    setIsPopoverOpen(false);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName) return;

    const newTask: ScheduledTask = {
      id: crypto.randomUUID(),
      title: taskName,
      duration: taskDuration,
      completed: false,
      type: taskType,
      settings: {
        duration: taskDuration,
        ...(taskType === "practice" ? { repetitions } : {}),
      },
    };
    const updatedTasks = [...event.tasks, newTask];
    updateEvent({ ...event, tasks: updatedTasks });
    setTaskName("");
    setIsPopoverOpen(false);
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = event.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    updateEvent({ ...event, tasks: updatedTasks });
  };

  const removeTask = (taskId: string) => {
    const updatedTasks = event.tasks.filter((t) => t.id !== taskId);
    updateEvent({ ...event, tasks: updatedTasks });
  };

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderLeftColor: classInfo.color
          .replace("bg-", "var(--color-")
          .replace("-500", ")"), // Assuming CSS variables or just hardcode if needed
        height: showExpanded ? "auto" : getHeightFromDuration(displayDuration),
      }}
      className={cn(
        "rounded text-xs border-l-4 shadow-sm relative group/class bg-white transition-all overflow-hidden flex flex-col",
        classInfo.color.replace("500", "50"),
        classInfo.color.replace("bg-", "border-"),
        showExpanded ? "z-50 shadow-xl min-h-max" : "",
        isDragging ? "opacity-50 ring-2 ring-blue-500 z-[999]" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...listeners}
      {...attributes}
    >
      <div className="flex justify-between items-center px-1.5 py-1 bg-gray-50/50 border-b border-gray-100 flex-shrink-0 cursor-grab active:cursor-grabbing">
        <span className="font-bold text-gray-700 truncate">
          {classInfo.name}
        </span>
        <div className="flex items-center gap-1">
          {!isHovered && !isPopoverOpen && (
            <span className="text-[9px] text-gray-400 font-medium">
              {displayDuration}m
            </span>
          )}
          {(isHovered || isPopoverOpen) && (
            <div className="flex items-center gap-1">
              <button
                ref={buttonRef}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = buttonRef.current?.getBoundingClientRect();
                  if (rect) {
                    setPopoverPos({ top: rect.bottom + 5, left: rect.left });
                    setIsPopoverOpen(!isPopoverOpen);
                  }
                }}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="Add Task"
              >
                <PlusCircle className="w-3.5 h-3.5" />
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={async (e) => {
                  e.stopPropagation();
                  const ok = await confirm({
                    title: "Delete Event",
                    message:
                      "Are you sure you want to delete this event and all its tasks?",
                  });
                  if (ok) {
                    deleteEvent(event.id);
                  }
                }}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Delete Event"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex-1 flex flex-col relative no-scrollbar",
          isSmall && !showExpanded ? "overflow-hidden" : "overflow-y-auto"
        )}
      >
        {event.tasks.map((task) => {
          const TaskIcon =
            task.type === "practice"
              ? Repeat
              : task.type === "study"
              ? Target
              : task.type === "free"
              ? Clock
              : GraduationCap;
          const iconColor =
            task.type === "practice"
              ? "text-green-500"
              : task.type === "study"
              ? "text-purple-500"
              : task.type === "free"
              ? "text-gray-400"
              : "text-blue-500";

          // Snap to Normal Logic
          const handleSnapToNormal = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!classInfo) return;

            // Find default duration if it exists in templates
            const template = classInfo.defaultTasks?.find(
              (t) => t.name === task.title
            );
            const defaultDuration = template ? template.duration : 30; // 30 is fallback

            const diff = defaultDuration - task.duration;
            if (diff === 0) return;

            // We behave like resizing: Adjust THIS task and add/remove from FREE time
            const updatedTasks = [...event.tasks];
            const taskIdx = updatedTasks.findIndex((t) => t.id === task.id);
            if (taskIdx === -1) return;

            updatedTasks[taskIdx] = {
              ...updatedTasks[taskIdx],
              duration: defaultDuration,
            };

            // Adjust Free time to compensate
            let freeTaskIdx = -1;
            for (let i = updatedTasks.length - 1; i >= 0; i--) {
              if (updatedTasks[i].type === "free") {
                freeTaskIdx = i;
                break;
              }
            }
            if (freeTaskIdx !== -1 && freeTaskIdx !== taskIdx) {
              // Adjust existing free task
              const newFreeDur = updatedTasks[freeTaskIdx].duration - diff;
              if (newFreeDur <= 0) {
                updatedTasks.splice(freeTaskIdx, 1);
              } else {
                updatedTasks[freeTaskIdx] = {
                  ...updatedTasks[freeTaskIdx],
                  duration: newFreeDur,
                };
              }
            } else if (diff < 0) {
              // Task shrank, add free time
              updatedTasks.push({
                id: crypto.randomUUID(),
                title: "Free",
                duration: Math.abs(diff),
                completed: false,
                type: "free",
              });
            }

            updateEvent({ ...event, tasks: updatedTasks });
          };

          return (
            <div
              key={task.id}
              style={{ height: getHeightFromDuration(task.duration) }}
              className="flex items-center gap-1.5 px-1.5 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors group/task overflow-hidden flex-shrink-0"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="rounded text-blue-600 w-2.5 h-2.5 flex-shrink-0"
              />
              <TaskIcon
                className={cn("w-2.5 h-2.5 flex-shrink-0", iconColor)}
              />
              <div className="min-w-0 flex-1 flex items-center justify-between gap-1 group/text">
                <span
                  className={cn(
                    "truncate font-medium",
                    task.completed
                      ? "line-through text-gray-300"
                      : "text-gray-600"
                  )}
                >
                  {task.title}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-gray-300 flex-shrink-0 group-hover/task:hidden">
                    {task.duration}m
                  </span>
                  <div className="hidden group-hover/task:flex items-center gap-0.5">
                    <button
                      onClick={handleSnapToNormal}
                      title="Snap to default duration"
                      className="text-gray-300 hover:text-blue-500 transition-colors"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => removeTask(task.id)}
                      className="text-red-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isPopoverOpen &&
        createPortal(
          <>
            {/* Backdrop to close */}
            <div
              className="fixed inset-0 z-[99]"
              onClick={(e) => {
                e.stopPropagation();
                setIsPopoverOpen(false);
              }}
            />

            <div
              className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 z-[100] p-3 animate-in fade-in zoom-in duration-200 w-56"
              style={{
                top: popoverPos.top,
                left: popoverPos.left,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
                  Tasks
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1 thin-scrollbar">
                  {classInfo.defaultTasks?.map((t, i) => {
                    const Icon =
                      t.type === "practice"
                        ? Repeat
                        : t.type === "study"
                        ? Target
                        : t.type === "free"
                        ? Clock
                        : GraduationCap;
                    return (
                      <div
                        key={i}
                        onClick={() => handleAddTemplateTask(t)}
                        className="cursor-pointer text-xs p-1.5 hover:bg-blue-50 rounded flex items-center gap-2 transition-colors border border-transparent hover:border-blue-100"
                      >
                        <Icon className="w-3 h-3 text-blue-500" />
                        <span className="truncate flex-1">{t.name}</span>
                      </div>
                    );
                  })}
                  {(!classInfo.defaultTasks ||
                    classInfo.defaultTasks.length === 0) && (
                    <div className="text-[10px] text-gray-400 italic px-1">
                      No tasks
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  Custom Task
                </h4>
                <form onSubmit={handleAddTask} className="space-y-2">
                  <div className="flex gap-1 bg-gray-50 p-1 rounded-md">
                    {[
                      { id: "assignment", icon: GraduationCap },
                      { id: "practice", icon: Repeat },
                      { id: "study", icon: Target },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTaskType(t.id as TaskType)}
                        className={cn(
                          "flex-1 p-1 rounded transition-all",
                          taskType === t.id
                            ? "bg-white shadow-sm text-blue-600 ring-1 ring-gray-200"
                            : "text-gray-400 hover:text-gray-600"
                        )}
                      >
                        <t.icon className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    ))}
                  </div>

                  <input
                    id={`task-name-${event.id}`}
                    name="taskName"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className="w-full text-xs border border-gray-200 p-1.5 rounded focus:border-blue-500 outline-none transition-colors"
                    placeholder="Task name"
                    aria-label="Task name"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <input
                        id={`task-duration-${event.id}`}
                        name="taskDuration"
                        type="number"
                        value={taskDuration}
                        onChange={(e) =>
                          setTaskDuration(Number(e.target.value))
                        }
                        className="w-full text-xs border border-gray-200 p-1.5 pl-7 rounded focus:border-blue-500 outline-none"
                        aria-label="Task duration in minutes"
                      />
                      <Clock className="w-3 h-3 text-gray-400 absolute left-2 top-2" />
                    </div>
                    {taskType === "practice" && (
                      <div className="relative">
                        <input
                          id={`task-repetitions-${event.id}`}
                          name="repetitions"
                          type="number"
                          value={repetitions}
                          onChange={(e) =>
                            setRepetitions(Number(e.target.value))
                          }
                          className="w-full text-xs border border-gray-200 p-1.5 pl-7 rounded focus:border-blue-500 outline-none"
                          aria-label="Number of repetitions"
                        />
                        <Repeat className="w-3 h-3 text-gray-400 absolute left-2 top-2" />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsPopoverOpen(false)}
                      className="text-xs text-gray-500 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md font-bold shadow-sm shadow-blue-200"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>,
          document.body
        )}

      {/* Resize Handle */}
      <div
        onMouseDown={handleResizeStart}
        onPointerDown={(e) => e.stopPropagation()}
        className="h-2 w-full cursor-ns-resize flex items-center justify-center opacity-0 group-hover/class:opacity-100 transition-opacity bg-gray-50 border-t border-transparent hover:border-gray-200"
      >
        <GripHorizontal className="w-3 h-3 text-gray-300 transform" />
      </div>

      {modalState && (
        <ConfirmModal
          isOpen={modalState.isOpen}
          title={modalState.title}
          message={modalState.message}
          onConfirm={() => modalState.resolve(true)}
          onCancel={() => modalState.resolve(false)}
        />
      )}
    </div>
  );
}
