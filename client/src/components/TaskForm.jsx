import React from 'react';

export default function TaskForm({ task, setTask, onSubmit, onCancel }) {
  return (
    <div className="modal">
      <h3>{task._id ? 'Edytuj zadanie' : 'Nowe zadanie'} ({task.status?.toUpperCase()})</h3>
      <input
        placeholder="Tytuł"
        value={task.title}
        onChange={(e) => setTask({ ...task, title: e.target.value })}
      />
      <textarea
        placeholder="Opis"
        value={task.description}
        onChange={(e) => setTask({ ...task, description: e.target.value })}
      />
      <button onClick={onSubmit}>{task._id ? 'Zapisz' : 'Dodaj'}</button>
      <button onClick={onCancel}>Anuluj</button>
    </div>
  );
}
