import React, { useRef, useEffect } from "react";

export interface CalendarGridProps {
  hourLabels: string[];
  weekDays: { label: string; date: Date }[];
  dateKey: (date: Date) => string;
  sameDay: (a: Date, b: Date) => boolean;
  selectedDate: Date;
  calendarSegments: any[];
  onDragTaskStart: (taskId: number) => void;
  setDraggingTaskId: (id: number | null) => void;
  setDropCellKey: (key: string | null) => void;
  draggingTaskId: number | null;
  dropCellKey: string | null;
  onDropTaskToCell: (date: Date, hourIndex: number) => void;
  resizingTaskId: number | null;
  onResizeStart: (taskId: number, e: React.MouseEvent<HTMLDivElement>) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  hourLabels,
  weekDays,
  dateKey,
  calendarSegments,
  onDragTaskStart,
  setDraggingTaskId,
  setDropCellKey,
  draggingTaskId,
  dropCellKey,
  onDropTaskToCell,
  resizingTaskId,
  onResizeStart,
}) => {
  const didResizeOrDragRef = useRef(false);

  // Reset flag on any mouseup so it never gets stuck as true
  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(() => { didResizeOrDragRef.current = false; }, 50);
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
  <div className="relative">
    <div className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))]">
      {hourLabels.map((hour, hourIndex) => (
        <div key={hour} className="contents">
          <div className="h-14 border-b border-[#e8eaed] pr-2 pt-1 text-right text-[11px] text-[#70757a]">{hour}</div>
          {weekDays.map((day) => {
            const cellKey = `${dateKey(day.date)}-${hourIndex}`;
            const isDropTarget = draggingTaskId !== null && dropCellKey === cellKey;
            return (
              <div
                key={`${dateKey(day.date)}-${hour}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (draggingTaskId !== null) {
                    setDropCellKey(cellKey);
                  }
                }}
                onDragLeave={() => {
                  if (dropCellKey === cellKey) {
                    setDropCellKey(null);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  onDropTaskToCell(day.date, hourIndex);
                }}
                className={`h-14 border-b border-l border-[#e8eaed] transition-colors ${isDropTarget ? "bg-[#e8f0fe]" : "bg-transparent"}`}
              />
            );
          })}
        </div>
      ))}
    </div>
    <div className="absolute inset-0 grid grid-cols-[44px_repeat(7,minmax(0,1fr))] pointer-events-none">
      <div />
      {weekDays.map((day, dayIndex) => (
        <div key={dateKey(day.date)} className="relative border-l border-transparent">
          {calendarSegments
            .filter((segment) => segment.dayIndex === dayIndex)
            .map((segment) => {
              const isResizing = resizingTaskId === segment.taskId;
              return (
                <div
                  key={`${segment.taskId}-${segment.dayIndex}-${segment.top}`}
                  draggable
                  onDragStart={() => {
                    didResizeOrDragRef.current = true;
                    onDragTaskStart(segment.taskId);
                  }}
                  onDragEnd={() => {
                    setDraggingTaskId(null);
                    setDropCellKey(null);
                    setTimeout(() => { didResizeOrDragRef.current = false; }, 100);
                  }}
                  onClick={(e) => {
                    if (didResizeOrDragRef.current) return;
                    const event = new CustomEvent('openEditTaskFromCalendar', { detail: segment.taskId });
                    window.dispatchEvent(event);
                  }}
                  style={{ top: segment.top, height: segment.height, zIndex: isResizing ? 20 : 10 }}
                  className={`pointer-events-auto absolute inset-x-1 cursor-grab overflow-hidden rounded-md border px-1 py-0.5 text-[11px] ${segment.done
                    ? "border-[#c4c7c5] bg-[#eceff1] text-[#5f6368]"
                    : "border-[#8ab4f8] bg-[#d2e3fc] text-[#174ea6]"
                    } ${isResizing ? "ring-2 ring-[#1a73e8]" : ""}`}
                >
                  <p className="truncate font-semibold">{segment.title}</p>
                  <p className="truncate">{segment.startTimeText} - {segment.endTimeText}</p>
                  <p className="truncate">{segment.description}</p>
                  <div
                    onMouseDown={(e) => {
                      didResizeOrDragRef.current = true;
                      onResizeStart(segment.taskId, e);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-1/2 bottom-0 z-30 h-2 w-8 -translate-x-1/2 cursor-ns-resize rounded-b bg-[#1a73e8] opacity-70 hover:opacity-100"
                    title="Keo de thay doi han chot"
                    style={{ userSelect: "none" }}
                  />
                </div>
              );
            })}
        </div>
      ))}
    </div>
    <div className="pointer-events-none absolute left-[calc(44px+2*calc((100%-44px)/7))] top-112 h-0.5 w-[calc((100%-44px)/7)] bg-[#d93025]" />
    <div className="pointer-events-none absolute left-[calc(44px+2*calc((100%-44px)/7)-4px)] top-[calc(8*3.5rem-4px)] h-2 w-2 rounded-full bg-[#d93025]" />
  </div>
  );
};

export default CalendarGrid;
