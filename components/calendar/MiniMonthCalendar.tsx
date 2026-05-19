import React from "react";

export interface MiniMonthCalendarProps {
  MINI_DAY_NAMES: string[];
  miniMonthDays: Date[];
  sameDay: (a: Date, b: Date) => boolean;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  setWeekStart: (date: Date) => void;
  dateKey: (date: Date) => string;
  getStartOfWeek: (date: Date) => Date;
}

const MiniMonthCalendar: React.FC<MiniMonthCalendarProps> = ({
  MINI_DAY_NAMES,
  miniMonthDays,
  sameDay,
  selectedDate,
  setSelectedDate,
  setWeekStart,
  dateKey,
  getStartOfWeek,
}) => (
  <>
    <div className="mb-6 grid grid-cols-7 gap-1 text-center text-xs text-[#5f6368]">
      {MINI_DAY_NAMES.map((day) => (
        <div key={day} className="font-semibold">
          {day}
        </div>
      ))}
      {miniMonthDays.map((date) => {
        const isSelected = sameDay(date, selectedDate);
        const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
        return (
          <button
            key={dateKey(date)}
            type="button"
            onClick={() => {
              setSelectedDate(date);
              setWeekStart(getStartOfWeek(date));
            }}
            className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full ${isSelected
              ? "bg-[#1a73e8] text-white"
              : isCurrentMonth
                ? "text-[#3c4043] hover:bg-[#e8eaed]"
                : "text-[#9aa0a6] hover:bg-[#e8eaed]"
              }`}
          >
            {date.getDate()}
          </button>
        );
      })}
    </div>
  </>
);

export default MiniMonthCalendar;
