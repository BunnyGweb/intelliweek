import React, { createContext, useContext, useState, useEffect } from "react";
import type { ClassItem, CalendarEvent, Task, TimeBlock } from "../types";

interface CalendarContextType {
  classes: ClassItem[];
  events: CalendarEvent[];
  tasks: Task[];
  blocks: TimeBlock[];
  timeFormat: "12h" | "24h";
  addClass: (cls: ClassItem) => void;
  updateClass: (cls: ClassItem) => void;
  deleteClass: (classId: string) => void;
  addEvent: (evt: CalendarEvent) => void;
  updateEvent: (evt: CalendarEvent) => void;
  addTask: (task: Task) => void;
  addBlock: (block: TimeBlock) => void;
  updateBlock: (block: TimeBlock) => void;
  deleteBlock: (blockId: string) => void;
  deleteEvent: (eventId: string) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  setTimeFormat: (format: "12h" | "24h") => void;
  confirm: (params: { title: string; message: string }) => Promise<boolean>;
  modalState: {
    isOpen: boolean;
    title: string;
    message: string;
    resolve: (value: boolean) => void;
  } | null;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
);

// Helper to load from storage
function loadFromStorage<T>(key: string, _default: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      // Basic check for array if default is array
      if (Array.isArray(_default)) {
        return (Array.isArray(parsed) ? parsed : _default) as unknown as T;
      }
      return parsed as T;
    }
  } catch (e) {
    console.error(`Failed to load ${key} from storage`, e);
  }
  return _default;
}

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from LocalStorage, default to empty arrays
  const [classes, setClasses] = useState<ClassItem[]>(() =>
    loadFromStorage("calendar_classes", [])
  );
  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    loadFromStorage("calendar_events", [])
  );
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadFromStorage("calendar_tasks", [])
  );
  const [blocks, setBlocks] = useState<TimeBlock[]>(() =>
    loadFromStorage("calendar_blocks", [])
  );
  const [currentDate, setCurrentDate] = useState(new Date());

  const [timeFormat, setTimeFormatState] = useState<"12h" | "24h">(() =>
    loadFromStorage("calendar_time_format", "24h")
  );

  const [modalState, setModalState] =
    useState<CalendarContextType["modalState"]>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem("calendar_classes", JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem("calendar_events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("calendar_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("calendar_blocks", JSON.stringify(blocks));
  }, [blocks]);

  useEffect(() => {
    localStorage.setItem("calendar_time_format", JSON.stringify(timeFormat));
  }, [timeFormat]);

  const addClass = (cls: ClassItem) => {
    setClasses((prev) => [...prev, cls]);
  };

  const updateClass = (updatedCls: ClassItem) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === updatedCls.id ? updatedCls : c))
    );
  };

  const deleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    // Optionally delete associated events?
    // Keeping events might be safer, or maybe mark them as orphaned.
    // For now, let's remove associated events to exact a clean delete.
    setEvents((prev) => prev.filter((e) => e.classId !== classId));
  };

  const addEvent = (evt: CalendarEvent) => {
    setEvents((prev) => [...prev, evt]);
  };

  const updateEvent = (updatedEvt: CalendarEvent) => {
    setEvents((prev) =>
      prev.map((evt) => (evt.id === updatedEvt.id ? updatedEvt : evt))
    );
  };

  const addTask = (task: Task) => {
    setTasks((prev) => [...prev, task]);
  };

  const addBlock = (block: TimeBlock) => {
    setBlocks((prev) => [...prev, block]);
  };

  const updateBlock = (block: TimeBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === block.id ? block : b)));
  };

  const deleteBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  const deleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const setTimeFormat = (format: "12h" | "24h") => {
    setTimeFormatState(format);
  };

  const confirm = ({
    title,
    message,
  }: {
    title: string;
    message: string;
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        resolve: (value: boolean) => {
          setModalState(null);
          resolve(value);
        },
      });
    });
  };

  return (
    <CalendarContext.Provider
      value={{
        classes,
        events,
        tasks,
        blocks,
        timeFormat,
        addClass,
        updateClass,
        deleteClass,
        addEvent,
        updateEvent,
        addTask,
        addBlock,
        updateBlock,
        deleteBlock,
        deleteEvent,
        currentDate,
        setCurrentDate,
        setTimeFormat,
        confirm,
        modalState,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider");
  }
  return context;
}
