import React, { useRef, useEffect, useState } from "react";

const HOUR_START = 5;
const ROW_HEIGHT = 56;


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
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Reset flag on any mouseup so it never gets stuck as true
  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(() => { didResizeOrDragRef.current = false; }, 50);
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

    // Đặt chiều cao cố định cho grid, cho phép cuộn dọc
    // Xác định hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>, taskId: number) => {
      onDragTaskStart(taskId);
      setDraggingTaskId(taskId);
    };

    const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>, cellKey: string) => {
      event.preventDefault();
      setDropCellKey(cellKey);
    };

    const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>, day: Date, hourIndex: number) => {
      event.preventDefault();
      if (draggingTaskId !== null) {
        onDropTaskToCell(day, hourIndex);
        setDraggingTaskId(null);
        setDropCellKey(null);
      }
    };

    const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleLongPressStart = (event: React.TouchEvent<HTMLDivElement>, taskId: number) => {
      longPressTimeout.current = setTimeout(() => {
        onDragTaskStart(taskId);
        setDraggingTaskId(taskId);
      }, 500); // 500ms long-press duration
    };

    const handleLongPressEnd = () => {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }
    };

    return (
      <div className="relative h-336 overflow-y-auto"> {/* 24 giờ x 56px = 1344px */}
        <div className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))]">
          {hourLabels.map((hour, hourIndex) => (
            <div key={hour} className="contents">
              <div className="h-14 border-b border-[#e8eaed] pr-2 pt-1 text-right text-[11px] text-[#70757a]">{hour}</div>
              {weekDays.map((day, dayIdx) => {
                const cellKey = `${dateKey(day.date)}-${hourIndex}`;
                const isDropTarget = draggingTaskId !== null && dropCellKey === cellKey;
                const isToday = day.date.getFullYear() === today.getFullYear() && day.date.getMonth() === today.getMonth() && day.date.getDate() === today.getDate();
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
                    onTouchStart={(event) => handleTouchStart(event, draggingTaskId || 0)}
                    onTouchMove={(event) => handleTouchMove(event, cellKey)}
                    onTouchEnd={(event) => handleTouchEnd(event, day.date, hourIndex)}
                    className={`h-14 border-b border-l border-[#e8eaed] transition-colors ${isDropTarget ? "bg-[#e8f0fe]" : "bg-transparent"}`}
                  >
                    {/* Chỉ render chữ đỏ ở hàng đầu tiên của cột hôm nay */}
                    {hourIndex === 0 && isToday && (
                      <span className="absolute left-1/2 -translate-x-1/2 text-red-600 font-bold text-xs -mt-4.5">Hôm nay</span>
                    )}
                  </div>
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
                  onTouchStart={(event) => handleLongPressStart(event, segment.taskId)}
                  onTouchEnd={handleLongPressEnd}
                  onTouchCancel={handleLongPressEnd}
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
    {(() => {
      const todayIndex = weekDays.findIndex((d) =>
        d.date.getFullYear() === now.getFullYear() &&
        d.date.getMonth() === now.getMonth() &&
        d.date.getDate() === now.getDate()
      );
      if (todayIndex === -1) return null;
      const topPx = (now.getHours() + now.getMinutes() / 60 - HOUR_START) * ROW_HEIGHT;
      if (topPx < 0) return null;
      return (
        <>
          <div
            className="pointer-events-none absolute h-0.5 bg-[#d93025]"
            style={{
              top: topPx,
              left: `calc(44px + ${todayIndex} * (100% - 44px) / 7)`,
              width: `calc((100% - 44px) / 7)`,
            }}
          />
          <div
            className="pointer-events-none absolute h-2 w-2 rounded-full bg-[#d93025]"
            style={{
              top: topPx - 4,
              left: `calc(44px + ${todayIndex} * (100% - 44px) / 7 - 4px)`,
            }}
          />
        </>
      );
    })()}
  </div>
  );
};

export default CalendarGrid;
