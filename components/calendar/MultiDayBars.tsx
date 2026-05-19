import React from "react";

export interface MultiDayBarsProps {
  multiDayBars: any[];
  weekDays: { label: string; date: Date }[];
  formatHourLabel: (hour: number) => string;
}

const MultiDayBars: React.FC<MultiDayBarsProps> = ({ multiDayBars, weekDays, formatHourLabel }) => {
  if (multiDayBars.length === 0) return null;
  const ROW_HEIGHT = 32;
  const maxRow = multiDayBars.reduce((max, bar) => Math.max(max, bar.row), 0);
  return (
    <div className="relative mb-2" style={{ height: `${(maxRow + 1) * ROW_HEIGHT}px` }}>
      <div className="absolute left-[44px] right-0 top-0 h-full">
        <div className="absolute inset-0 flex h-full">
          {weekDays.map((_, idx) => (
            <div key={idx} className="flex-1 border-l border-[#e8eaed] h-full" />
          ))}
        </div>
        {multiDayBars.map((bar, i) => {
          const colCount = bar.endCol - bar.startCol + 1;
          return (
            <div
              key={bar.task.id}
              className={`absolute h-7 rounded-full bg-[#03a9f4] text-white text-xs font-semibold flex items-center px-3 shadow-md`}
              style={{
                left: `calc(44px + ${(bar.startCol) * 100 / 7}% )`,
                width: `calc(${colCount * 100 / 7}% - 8px)` ,
                top: `${bar.row * ROW_HEIGHT + 2}px`,
                zIndex: 30 + i,
                opacity: 0.98,
              }}
              title={bar.task.title + (bar.task.description ? ": " + bar.task.description : "")}
            >
              {bar.task.title}
              {bar.task.startAt.getHours() !== 0 || bar.task.startAt.getMinutes() !== 0
                ? `, ${formatHourLabel(bar.task.startAt.getHours())}` : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiDayBars;
