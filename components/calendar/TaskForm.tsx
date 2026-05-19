import React from "react";

export interface TaskFormProps {
  editingTask: any;
  taskForm: any;
  formError: string;
  onChangeFormField: (field: string, value: string) => void;
  onSaveTask: (event: React.FormEvent<HTMLFormElement>) => void;
  closeForm: () => void;
  onDeleteTask: (id: number) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  editingTask,
  taskForm,
  formError,
  onChangeFormField,
  onSaveTask,
  closeForm,
  onDeleteTask,
}) => (
  <form onSubmit={onSaveTask} className="space-y-2 text-sm">
    <h3 className="text-xs font-semibold uppercase tracking-wide text-[#5f6368]">
      {editingTask ? "Sua task" : "Tao task"}
    </h3>
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#5f6368]">Ten task</label>
      <input
        value={taskForm.title}
        onChange={(event) => onChangeFormField("title", event.target.value)}
        className="w-full rounded border border-[#dadce0] px-2 py-1.5"
        placeholder="Nhap ten task"
      />
    </div>
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#5f6368]">Mo ta</label>
      <textarea
        value={taskForm.description}
        onChange={(event) => onChangeFormField("description", event.target.value)}
        className="w-full rounded border border-[#dadce0] px-2 py-1.5"
        rows={2}
        placeholder="Nhap mo ta task"
      />
    </div>
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#5f6368]">Thoi gian bat dau</label>
      <input
        type="datetime-local"
        value={taskForm.startAt}
        onChange={(event) => onChangeFormField("startAt", event.target.value)}
        className="w-full rounded border border-[#dadce0] px-2 py-1.5"
      />
    </div>
    <div>
      <label className="mb-1 block text-xs font-semibold text-[#5f6368]">Han chot</label>
      <input
        type="datetime-local"
        value={taskForm.deadline}
        onChange={(event) => onChangeFormField("deadline", event.target.value)}
        className="w-full rounded border border-[#dadce0] px-2 py-1.5"
      />
    </div>
    {formError ? <p className="text-xs text-[#d93025]">{formError}</p> : null}
    <div className="grid grid-cols-2 gap-2">
      <button type="submit" className="rounded bg-[#1a73e8] px-3 py-2 text-xs font-semibold text-white">
        {editingTask ? "Cap nhat" : "Luu task"}
      </button>
      <button
        type="button"
        onClick={closeForm}
        className="rounded border border-[#dadce0] bg-white px-3 py-2 text-xs font-semibold text-[#5f6368]"
      >
        Huy
      </button>
      {editingTask && (
        <button
          type="button"
          onClick={() => { onDeleteTask(editingTask.id); }}
          className="col-span-2 rounded border border-[#f3c6c4] bg-white px-3 py-2 text-xs font-semibold text-[#d93025] mt-1"
        >
          Xoa task
        </button>
      )}
    </div>
  </form>
);

export default TaskForm;
