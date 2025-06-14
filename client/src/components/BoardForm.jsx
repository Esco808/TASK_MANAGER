import React from 'react';

export default function BoardForm({ value, setValue, onSubmit, onCancel }) {
  const handleSubmit = () => {
    if (!value || value.trim().length < 3) {
      alert('Nazwa tablicy musi mieć co najmniej 3 znaki');
      return;
    }
    onSubmit();
  };

  return (
    <div className="modal">
      <h3>Nowa tablica</h3>
      <input
        placeholder="Nazwa"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={handleSubmit}>Dodaj</button>
      <button onClick={onCancel}>Anuluj</button>
    </div>
  );
}
