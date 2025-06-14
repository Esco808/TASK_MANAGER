import React from 'react';

export default function BoardForm({ value, setValue, onSubmit, onCancel }) {
  return (
    <div className="modal">
      <h3>Nowa tablica</h3>
      <input
        placeholder="Nazwa"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={onSubmit}>Dodaj</button>
      <button onClick={onCancel}>Anuluj</button>
    </div>
  );
}
