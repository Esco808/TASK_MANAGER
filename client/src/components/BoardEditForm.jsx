import React from 'react';

export default function BoardEditForm({ board, setBoard, onSubmit, onCancel }) {
  const handleSubmit = () => {
    if (!board.name || board.name.trim().length < 3) {
      alert('Nazwa tablicy musi mieć co najmniej 3 znaki');
      return;
    }
    onSubmit();
  };

  return (
    <div className="modal">
      <h3>Edytuj tablicę</h3>
      <input
        placeholder="Nazwa"
        value={board.name}
        onChange={(e) => setBoard({ ...board, name: e.target.value })}
      />
      <button onClick={handleSubmit}>Zapisz</button>
      <button onClick={onCancel}>Anuluj</button>
    </div>
  );
}
