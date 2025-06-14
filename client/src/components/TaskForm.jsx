import React from 'react';

export default function TaskForm({ task, setTask, onSubmit, onCancel }) {
  const handleSubmit = () => {
    if (!task.title || task.title.trim().length < 3) {
      alert('Tytuł musi mieć co najmniej 3 znaki');
      return;
    }
    if (!task.description || task.description.trim().length < 5) {
      alert('Opis musi mieć co najmniej 5 znaków');
      return;
    }
    onSubmit();
  };

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
      <button onClick={handleSubmit}>{task._id ? 'Zapisz' : 'Dodaj'}</button>
      <button onClick={onCancel}>Anuluj</button>
    </div>
  );
}
