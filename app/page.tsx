"use client";
import React from "react";

import { useMemo, useState, useEffect, useCallback } from "react";

import {
  TaskForm,
  TaskListToday,
  MiniMonthCalendar,
  MultiDayBars,
  CalendarGrid,
  Header,
} from "../components/calendar";
import Modal from "../components/ui/Modal";

type Task = {
  id: number;
  title: string;
  description: string;
  startAt: Date;
  deadline: Date;
  done: boolean;
};

type TaskForm = {
  title: string;
  description: string;
  startAt: string;
  deadline: string;
  done: boolean;
};

const HOUR_START = 5;
const SLOT_COUNT = 13;
const ROW_HEIGHT = 56;
const DAY_NAMES = ["CN", "TH 2", "TH 3", "TH 4", "TH 5", "TH 6", "TH 7"];
const MINI_DAY_NAMES = ["Cn", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTH_NAMES = [
  "thang 1",
  "thang 2",
  "thang 3",
  "thang 4",
  "thang 5",
  "thang 6",
  "thang 7",
  "thang 8",
  "thang 9",
  "thang 10",
  "thang 11",
  "thang 12",
];

function getStartOfWeek(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatInputDateTime(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

function formatDateTimeText(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${h}:${min}`;
}

function parseInputDateTime(value: string) {
  return new Date(value);
}

function formatHourLabel(hour: number) {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

function resetFormValues(baseDate: Date): TaskForm {
  const start = new Date(baseDate);
  start.setHours(9, 0, 0, 0);
  const end = new Date(baseDate);
  end.setHours(10, 0, 0, 0);

  return {
    title: "",
    description: "",
    startAt: formatInputDateTime(start),
    deadline: formatInputDateTime(end),
    done: false,
  };
}


export default function Home() {
  const initialDate = new Date(2026, 4, 19, 9, 0, 0, 0);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [weekStart, setWeekStart] = useState(getStartOfWeek(initialDate));
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);
  const [dropCellKey, setDropCellKey] = useState<string | null>(null);
  const [resizingTaskId, setResizingTaskId] = useState<number | null>(null);
  const [resizeStartY, setResizeStartY] = useState<number | null>(null);
  const [resizeOriginDeadline, setResizeOriginDeadline] = useState<Date | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: number; fullName: string } | null>(null);

  const loadTasks = useCallback(async () => {
    if (!currentUser) {
      setTasks([]);
      return;
    }

    try {
      const res = await fetch(`/api/tasks?user=${currentUser.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setTasks(
        data.map((t: { id: number; title: string; description: string; startAt: string; deadline: string; done: boolean }) => ({
          ...t,
          startAt: new Date(t.startAt),
          deadline: new Date(t.deadline),
        }))
      );
    } catch (e) {
      console.error("Failed to load tasks", e);
    }
  }, [currentUser]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const [taskForm, setTaskForm] = useState<TaskForm>(() => resetFormValues(initialDate));

  const hourLabels = useMemo(() => {
    return Array.from({ length: SLOT_COUNT }, (_, index) => formatHourLabel(HOUR_START + index));
  }, []);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, idx) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + idx);
      return { label: DAY_NAMES[idx], date };
    });
  }, [weekStart]);

  const miniMonthDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const startDate = new Date(year, month, 1 - startOffset);
    return Array.from({ length: 42 }, (_, idx) => {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + idx);
      return day;
    });
  }, [selectedDate]);

  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 7);
    return end;
  }, [weekStart]);

  const headerTitle = `${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]}, ${selectedDate.getFullYear()}`;
  const monthTitle = `${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  const tasksToday = useMemo(() => {
    return tasks.filter((task) => {
      const start = task.startAt;
      const end = task.deadline;
      const dayStart = new Date(selectedDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      if (end <= dayStart || start >= dayEnd) return false;
      return true;
    });
  }, [tasks, selectedDate]);

  const multiDayBars = useMemo(() => {
    const bars = tasks
      .map((task) => {
        const start = task.startAt;
        const end = task.deadline;
        if (end <= weekStart || start >= weekEnd) return null;
        const firstCol = weekDays.findIndex((d) =>
          d.date.getFullYear() === start.getFullYear() &&
          d.date.getMonth() === start.getMonth() &&
          d.date.getDate() === start.getDate()
        );
        const lastCol = weekDays.findIndex((d) =>
          d.date.getFullYear() === end.getFullYear() &&
          d.date.getMonth() === end.getMonth() &&
          d.date.getDate() === end.getDate()
        );
        const startIdx = firstCol === -1 ? 0 : firstCol;
        let endIdx = lastCol === -1 ? 6 : lastCol;
        if (end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0 && endIdx > startIdx) {
          endIdx -= 1;
        }
        if (endIdx - startIdx >= 1) {
          return { task, startCol: startIdx, endCol: endIdx };
        }
        return null;
      })
      .filter(Boolean);
    const rows: Array<Array<{ task: Task, startCol: number, endCol: number }>> = [];
    const barWithRow: Array<{ task: Task, startCol: number, endCol: number, row: number }> = [];
    bars.forEach((bar) => {
      let placed = false;
      for (let row = 0; row < rows.length; row++) {
        if (!rows[row].some((b) => !(bar!.endCol < b.startCol || bar!.startCol > b.endCol))) {
          rows[row].push(bar!);
          barWithRow.push({ ...bar!, row });
          placed = true;
          break;
        }
      }
      if (!placed) {
        rows.push([bar!]);
        barWithRow.push({ ...bar!, row: rows.length - 1 });
      }
    });
    return barWithRow;
  }, [tasks, weekDays, weekStart, weekEnd]);

  const calendarSegments = useMemo(() => {
    const segments: Array<{
      taskId: number; dayIndex: number; top: number; height: number;
      title: string; description: string; done: boolean;
      startTimeText: string; endTimeText: string;
    }> = [];
    const multiDayTaskIds = new Set(multiDayBars.map((bar) => bar!.task.id));
    tasks.forEach((task) => {
      if (multiDayTaskIds.has(task.id)) return;
      if (task.deadline <= weekStart || task.startAt >= weekEnd) return;
      weekDays.forEach((day, dayIndex) => {
        const dayStart = new Date(day.date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const segmentStart = task.startAt > dayStart ? task.startAt : dayStart;
        const segmentEnd = task.deadline < dayEnd ? task.deadline : dayEnd;
        if (segmentEnd <= segmentStart) return;
        const startFloat = segmentStart.getHours() + segmentStart.getMinutes() / 60 + segmentStart.getSeconds() / 3600;
        const endFloat = segmentEnd.getHours() + segmentEnd.getMinutes() / 60 + segmentEnd.getSeconds() / 3600;
        const visibleStart = Math.max(startFloat, HOUR_START);
        const visibleEnd = Math.min(endFloat, HOUR_START + SLOT_COUNT);
        if (visibleEnd <= visibleStart) return;
        segments.push({
          taskId: task.id, dayIndex,
          top: (visibleStart - HOUR_START) * ROW_HEIGHT,
          height: Math.max((visibleEnd - visibleStart) * ROW_HEIGHT - 4, 20),
          title: task.title, description: task.description, done: task.done,
          startTimeText: formatDateTimeText(task.startAt),
          endTimeText: formatDateTimeText(task.deadline),
        });
      });
    });
    return segments;
  }, [tasks, weekDays, weekStart, weekEnd, multiDayBars]);

  // Listen for calendar segment click to open edit modal
  React.useEffect(() => {
    function handleOpenEditTaskFromCalendar(e: any) {
      const taskId = e.detail;
      const task = tasks.find((t) => t.id === taskId);
      if (task) openEditForm(task);
    }
    window.addEventListener('openEditTaskFromCalendar', handleOpenEditTaskFromCalendar);
    return () => {
      window.removeEventListener('openEditTaskFromCalendar', handleOpenEditTaskFromCalendar);
    };
  }, [tasks]);

  const goToToday = () => {
    const now = new Date();
    setSelectedDate(now);
    setWeekStart(getStartOfWeek(now));
  };

  const moveWeek = (amount: number) => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + amount * 7);
    setWeekStart(next);

    const nextSelected = new Date(selectedDate);
    nextSelected.setDate(nextSelected.getDate() + amount * 7);
    setSelectedDate(nextSelected);
  };

  const openCreateForm = () => {
    setEditingTaskId(null);
    setFormError("");
    setTaskForm(resetFormValues(selectedDate));
    setShowTaskForm(true);
  };

  const openEditForm = (task: Task) => {
    setEditingTaskId(task.id);
    setFormError("");
    setTaskForm({
      title: task.title,
      description: task.description,
      startAt: formatInputDateTime(task.startAt),
      deadline: formatInputDateTime(task.deadline),
      done: task.done,
    });
    setShowTaskForm(true);
  };

  const closeForm = () => {
    setShowTaskForm(false);
    setEditingTaskId(null);
    setFormError("");
  };

  const onChangeFormField = (field: keyof TaskForm, value: string | boolean) => {
    setTaskForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSaveTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const title = taskForm.title.trim();
    const description = taskForm.description.trim();
    const startAt = parseInputDateTime(taskForm.startAt);
    const deadline = parseInputDateTime(taskForm.deadline);

    if (!title || !description || !taskForm.startAt || !taskForm.deadline) {
      setFormError("Vui long nhap day du thong tin task.");
      return;
    }

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(deadline.getTime())) {
      setFormError("Thoi gian khong hop le.");
      return;
    }

    if (deadline <= startAt) {
      setFormError("Han chot phai sau thoi gian bat dau.");
      return;
    }

    if (editingTaskId === null) {
      if (!currentUser) {
        setFormError("Vui long chon nguoi dung truoc khi tao task.");
        return;
      }

      const res = await fetch(`/api/tasks?user=${currentUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          startAt: startAt.toISOString(),
          deadline: deadline.toISOString(),
          done: taskForm.done,
          userId: currentUser.id,
        }),
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks((prev) => [...prev, { ...newTask, startAt: new Date(newTask.startAt), deadline: new Date(newTask.deadline) }]);
      }
    } else {
      const editingTask = tasks.find((t) => t.id === editingTaskId);
      const res = await fetch(`/api/tasks/${editingTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          startAt: startAt.toISOString(),
          deadline: deadline.toISOString(),
          done: taskForm.done,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) =>
          prev.map((task) =>
            task.id === editingTaskId
              ? { ...updated, startAt: new Date(updated.startAt), deadline: new Date(updated.deadline) }
              : task
          )
        );
      }
    }

    setSelectedDate(startAt);
    setWeekStart(getStartOfWeek(startAt));
    closeForm();
  };

  const onDeleteTask = async (taskId: number) => {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    if (editingTaskId === taskId) {
      closeForm();
    }
  };

  const toggleTaskDone = async (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newDone = !task.done;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: newDone } : t))
    );
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        startAt: task.startAt.toISOString(),
        deadline: task.deadline.toISOString(),
        done: newDone,
      }),
    });
  };

  const onDragTaskStart = (taskId: number) => {
    setDraggingTaskId(taskId);
  };

  const onDropTaskToCell = async (dayDate: Date, hourIndex: number) => {
    if (draggingTaskId === null) {
      return;
    }

    let updatedTask: Task | undefined;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== draggingTaskId) {
          return task;
        }

        const duration = task.deadline.getTime() - task.startAt.getTime();
        const newStart = new Date(dayDate);
        newStart.setHours(HOUR_START + hourIndex, 0, 0, 0);
        const newEnd = new Date(newStart.getTime() + duration);
        updatedTask = { ...task, startAt: newStart, deadline: newEnd };

        return updatedTask;
      })
    );

    if (updatedTask) {
      await fetch(`/api/tasks/${updatedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedTask.title,
          description: updatedTask.description,
          startAt: updatedTask.startAt.toISOString(),
          deadline: updatedTask.deadline.toISOString(),
          done: updatedTask.done,
        }),
      });
    }

    setDraggingTaskId(null);
    setDropCellKey(null);
  };

  // Resize logic
  const onResizeStart = (taskId: number, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setResizingTaskId(taskId);
    setResizeStartY(e.clientY);
    const task = tasks.find((t) => t.id === taskId);
    setResizeOriginDeadline(task ? new Date(task.deadline) : null);
    document.body.style.userSelect = "none";
  };

  const onResizeMove = (e: MouseEvent) => {
    if (resizingTaskId === null || resizeStartY === null || !resizeOriginDeadline) return;
    const deltaY = e.clientY - resizeStartY;
    // Mỗi ROW_HEIGHT là 1h
    const hoursDelta = Math.round(deltaY / ROW_HEIGHT * 2) / 2; // 0.5h step
    if (hoursDelta === 0) return;
    setTasks((prev) => prev.map((task) => {
      if (task.id !== resizingTaskId) return task;
      let newDeadline = new Date(resizeOriginDeadline);
      newDeadline.setMinutes(newDeadline.getMinutes() + hoursDelta * 60);
      // Không cho deadline < startAt + 15p
      if (newDeadline.getTime() < task.startAt.getTime() + 15 * 60 * 1000) {
        newDeadline = new Date(task.startAt.getTime() + 15 * 60 * 1000);
      }
      return { ...task, deadline: newDeadline };
    }));
  };

  const onResizeEnd = () => {
    if (resizingTaskId !== null) {
      const task = tasks.find((t) => t.id === resizingTaskId);
      if (task) {
        fetch(`/api/tasks/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            startAt: task.startAt.toISOString(),
            deadline: task.deadline.toISOString(),
            done: task.done,
          }),
        });
      }
    }
    setResizingTaskId(null);
    setResizeStartY(null);
    setResizeOriginDeadline(null);
    document.body.style.userSelect = "";
  };

  // Attach global mousemove/mouseup for resize
  if (typeof window !== "undefined" && resizingTaskId !== null) {
    window.onmousemove = onResizeMove;
    window.onmouseup = onResizeEnd;
  } else if (typeof window !== "undefined") {
    window.onmousemove = null;
    window.onmouseup = null;
  }

  const editingTask = editingTaskId === null ? null : tasks.find((task) => task.id === editingTaskId);

  return (
    <div className="min-h-screen bg-[#f1f3f4] text-[#1f1f1f]">
      <Header
        goToToday={goToToday}
        moveWeek={moveWeek}
        headerTitle={headerTitle}
        onCurrentUserChange={setCurrentUser}
      />

      <div className="mx-auto flex max-w-400">
        <aside className="hidden w-65 border-r border-[#e0e0e0] px-4 py-5 md:block">
          <button
            type="button"
            onClick={openCreateForm}
            className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-[#dadce0] bg-white px-5 py-3 text-sm font-semibold shadow-sm hover:bg-[#fafafa]"
          >
            <span className="text-xl leading-none">+</span>
            Tao
          </button>

          <Modal open={showTaskForm} onClose={closeForm}>
            <TaskForm
              editingTask={editingTask}
              taskForm={taskForm}
              formError={formError}
              onChangeFormField={(field, value) => onChangeFormField(field as keyof TaskForm, value)}
              onSaveTask={onSaveTask}
              closeForm={closeForm}
              onDeleteTask={onDeleteTask}
            />
          </Modal>

          <h2 className="mb-3 text-sm font-semibold text-[#5f6368]">{monthTitle}</h2>

          <MiniMonthCalendar
            MINI_DAY_NAMES={MINI_DAY_NAMES}
            miniMonthDays={miniMonthDays}
            sameDay={sameDay}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setWeekStart={setWeekStart}
            dateKey={dateKey}
            getStartOfWeek={getStartOfWeek}
          />

          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#5f6368]">Việc cần làm hôm nay</h3>
          <TaskListToday
            tasksToday={tasksToday}
            openEditForm={openEditForm}
            toggleTaskDone={toggleTaskDone}
            formatDateTimeText={formatDateTimeText}
            sameDay={sameDay}
            selectedDate={selectedDate}
          />
        </aside>

        <main className="min-w-0 flex-1 overflow-x-auto pb-8">
          <div className="min-w-215 px-3 pt-4 md:px-0">
            <div className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))] border-b border-[#e0e0e0]">
              <div />
              {weekDays.map((day) => (
                <button
                  key={dateKey(day.date)}
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  className="pb-2 text-center text-xs font-semibold tracking-wide text-[#5f6368]"
                >
                  <div>{day.label}</div>
                  <div
                    className={`mx-auto mt-1 flex h-9 w-9 items-center justify-center rounded-full text-2xl font-normal ${sameDay(day.date, selectedDate) ? "bg-[#1a73e8] text-white" : "text-[#202124]"
                      }`}
                  >
                    {day.date.getDate()}
                  </div>
                </button>
              ))}
            </div>

            {/* Multi-day bar rows with stacking */}
            <MultiDayBars
              multiDayBars={multiDayBars}
              weekDays={weekDays}
              formatHourLabel={formatHourLabel}
            />
            <CalendarGrid
              hourLabels={hourLabels}
              weekDays={weekDays}
              dateKey={dateKey}
              sameDay={sameDay}
              selectedDate={selectedDate}
              calendarSegments={calendarSegments}
              onDragTaskStart={onDragTaskStart}
              setDraggingTaskId={setDraggingTaskId}
              setDropCellKey={setDropCellKey}
              draggingTaskId={draggingTaskId}
              dropCellKey={dropCellKey}
              onDropTaskToCell={onDropTaskToCell}
              resizingTaskId={resizingTaskId}
              onResizeStart={onResizeStart}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
