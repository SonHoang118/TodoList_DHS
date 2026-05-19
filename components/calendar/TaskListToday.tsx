import React from "react";

export interface TaskListTodayProps {
  tasksToday: any[];
  openEditForm: (task: any) => void;
  toggleTaskDone: (id: number) => void;
  formatDateTimeText: (date: Date) => string;
  sameDay: (a: Date, b: Date) => boolean;
  selectedDate: Date;
}

const TaskListToday: React.FC<TaskListTodayProps> = ({
  tasksToday,
  openEditForm,
  toggleTaskDone,
  formatDateTimeText,
}) => (
  <div className="space-y-2 text-sm">
    {tasksToday.length === 0 ? (
      <div className="rounded-lg border border-[#dadce0] bg-white px-3 py-2 text-[#70757a]">Chua co task cho ngay nay.</div>
    ) : (
      tasksToday.map((task) => (
        <div
          key={task.id}
          className="rounded-lg border border-[#dadce0] bg-white px-3 py-2 cursor-pointer hover:bg-[#f5f7fa]"
          onClick={() => openEditForm(task)}
        >
          <div className="mb-1 flex items-start gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggleTaskDone(task.id); }}
              className="mt-0.75 inline-flex h-4 w-4 items-center justify-center rounded border border-[#5f6368] text-[10px]"
            >
              {task.done ? "x" : ""}
            </button>
            <div className="min-w-0 flex-1">
              <p className={task.done ? "truncate line-through text-[#70757a]" : "truncate text-[#202124]"}>{task.title}</p>
              <p className="truncate text-[11px] text-[#70757a]">{task.description}</p>
              <p className="truncate text-[11px] text-[#70757a]">
                {formatDateTimeText(task.startAt)} - {formatDateTimeText(task.deadline)}
              </p>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);

export default TaskListToday;
