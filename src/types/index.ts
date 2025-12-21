export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "inProgress" | "done";
export type TaskType = "assignment" | "practice" | "study" | "free";

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  createdAt: string; // ISO Date string
}

export interface TaskSettings {
  // Common settings
  duration?: number; // in minutes

  // Study task specific
  targetDuration?: number; // Target time by test day
  startDuration?: number; // Starting time
  growthFactor?: number; // How much to increase per session/week
  testDate?: string; // ISO Date string

  // Practice specific
  repetitions?: number;
}

export interface Task {
  id: string;
  classId: string;
  type: TaskType;
  settings: TaskSettings;
  kanbanTask: KanbanTask;
}

export interface ClassItem {
  id: string;
  name: string;
  color: string;
  defaultTasks?: {
    name: string;
    duration: number;
    type: TaskType;
    settings?: TaskSettings;
  }[]; // Templates
}

export interface TimeBlock {
  id: string;
  name: string;
  startTime: string; // "09:00"
  duration: number; // minutes
  dayOfWeek: number; // 0-6
  type: "class" | "generic" | "break";
}

export interface ScheduledTask {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  type: TaskType;
  settings?: TaskSettings;
}

export interface CalendarEvent {
  id: string;
  // The 'event' is formerly the Class Instance in a Slot
  classId: string;
  blockId?: string; // Link to the block instance (optional now)
  startTime: string; // "09:00" - Independent start time
  date: Date; // Specific date
  tasks: ScheduledTask[];
}
