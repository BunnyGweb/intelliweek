import { useState } from "react";
import { useCalendar } from "../store/CalendarContext";
import { cn } from "../lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Settings,
} from "lucide-react";
import { format, addWeeks, subWeeks } from "date-fns";

interface HeaderProps {
  onEditSchedule: () => void;
}

export function Header({ onEditSchedule }: HeaderProps) {
  const { currentDate, setCurrentDate, timeFormat, setTimeFormat } =
    useCalendar();

  const handlePrev = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNext = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center px-4 justify-between flex-shrink-0 z-20 relative">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <CalendarIcon className="w-6 h-6" />
          <span>IntelliWeek</span>
        </div>

        <div className="flex items-center gap-2 ml-8 border rounded-md p-1 bg-gray-50">
          <button
            onClick={handlePrev}
            className="p-1 hover:bg-gray-200 rounded text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1 text-sm font-medium hover:bg-gray-200 rounded text-gray-700"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="p-1 hover:bg-gray-200 rounded text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 ml-4">
          {format(currentDate, "MMMM yyyy")}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center bg-gray-100 rounded-md p-0.5 mr-2">
          <button
            onClick={() => setTimeFormat("12h")}
            className={cn(
              "px-2 py-1 text-[10px] font-bold rounded transition-all",
              timeFormat === "12h"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            12H
          </button>
          <button
            onClick={() => setTimeFormat("24h")}
            className={cn(
              "px-2 py-1 text-[10px] font-bold rounded transition-all",
              timeFormat === "24h"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            24H
          </button>
        </div>
        <button
          onClick={onEditSchedule}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Edit Schedule
        </button>
      </div>
    </header>
  );
}
