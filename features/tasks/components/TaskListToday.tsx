import React, { useEffect, useState } from "react";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface TaskListTodayProps {
  currentUser: string;
}

const TaskListToday: React.FC<TaskListTodayProps> = ({ currentUser }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/tasks?user=${currentUser}`);
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks", error);
      }
    };

    fetchTasks();
  }, [currentUser]);

  return (
    <div>
      <h2 className="text-lg font-semibold">Lịch công việc hôm nay</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-2">
            <input type="checkbox" checked={task.completed} readOnly />
            <span>{task.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskListToday;