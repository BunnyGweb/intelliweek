import { CalendarProvider, useCalendar } from "./store/CalendarContext";
import { CalendarGrid } from "./components/CalendarGrid";
import { Header } from "./components/Header";
import { ClassSidebar } from "./components/ClassSidebar";
import { ScheduleBuilder } from "./components/ScheduleBuilder";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { createPortal } from "react-dom";
import { useState } from "react";
import { getTimeFromPosition } from "./lib/timeUtils";

function AppContent() {
  const { addEvent, updateEvent, updateBlock, classes } = useCalendar();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Builder Modal State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeType = active.data.current?.type;
    const dropType = over.data.current?.type;

    // 1. Dragging a CLASS (creating new event)
    if (activeType === "CLASS") {
      const classItem = active.data.current?.classItem;

      if (dropType === "BLOCK_DROP_ZONE") {
        const { date, block } = over.data.current || {};
        addEvent({
          id: crypto.randomUUID(),
          classId: classItem.id,
          blockId: block.id,
          startTime: block.startTime,
          date: new Date(date),
          tasks: [],
        });
      } else if (dropType === "DAY_COLUMN") {
        const { date } = over.data.current || {};
        const activeTop = active.rect.current.translated?.top || 0;
        const overTop = over.rect.top;
        const relativeY = activeTop - overTop;
        const startTime = getTimeFromPosition(relativeY);

        addEvent({
          id: crypto.randomUUID(),
          classId: classItem.id,
          startTime,
          date: new Date(date),
          tasks: [],
        });
      }
    }

    // 2. Dragging an EVENT (Moving existing event)
    else if (activeType === "EVENT") {
      const eventData = active.data.current?.event;

      if (dropType === "BLOCK_DROP_ZONE") {
        const { date, block } = over.data.current || {};
        // Move to block
        updateEvent({
          ...eventData,
          date: new Date(date),
          startTime: block.startTime,
          blockId: block.id,
        });
      } else if (dropType === "DAY_COLUMN") {
        const { date } = over.data.current || {};
        const activeTop = active.rect.current.translated?.top || 0;
        const overTop = over.rect.top;
        const relativeY = activeTop - overTop;
        const startTime = getTimeFromPosition(relativeY);

        updateEvent({
          ...eventData,
          date: new Date(date),
          startTime,
          blockId: undefined, // Detach from block
        });
      }
    }

    // 3. Dragging a BLOCK (Moving existing block)
    else if (activeType === "BLOCK") {
      const blockData = active.data.current?.block;

      if (dropType === "DAY_COLUMN") {
        const { date } = over.data.current || {};
        const activeTop = active.rect.current.translated?.top || 0;
        const overTop = over.rect.top;
        const relativeY = activeTop - overTop;
        const startTime = getTimeFromPosition(relativeY);

        // Update Block
        updateBlock({
          ...blockData,
          dayOfWeek: date.getDay(),
          startTime,
        });
      }
    }
  };

  const activeClass = activeId
    ? classes.find((c) => `class-${c.id}` === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-white text-gray-900 font-sans overflow-hidden">
        <Header onEditSchedule={() => setIsBuilderOpen(true)} />

        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <CalendarGrid />
          </div>
          <ClassSidebar />
        </div>

        <ScheduleBuilder
          isOpen={isBuilderOpen}
          onClose={() => setIsBuilderOpen(false)}
        />

        {createPortal(
          <DragOverlay>
            {activeClass ? (
              <div className="p-3 rounded-lg shadow-lg bg-blue-50 border border-blue-200 w-48 opacity-80 z-50">
                <span className="font-medium">{activeClass.name}</span>
              </div>
            ) : activeId?.startsWith("event-") ? (
              <div className="p-2 rounded bg-white shadow-lg border border-gray-200 w-32 rotate-3 cursor-grabbing opacity-90 z-50">
                <span className="text-xs font-bold text-gray-700">
                  Moving Event...
                </span>
              </div>
            ) : activeId?.startsWith("block-") ? (
              <div className="p-2 rounded bg-gray-50 border border-dashed border-gray-300 w-32 rotate-3 cursor-grabbing opacity-90 z-50">
                <span className="text-xs font-bold text-gray-500">
                  Moving Block...
                </span>
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </div>
    </DndContext>
  );
}

function App() {
  return (
    <CalendarProvider>
      <AppContent />
    </CalendarProvider>
  );
}

export default App;
