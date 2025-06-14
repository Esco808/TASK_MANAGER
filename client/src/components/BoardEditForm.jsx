import React from 'react';

export default function BoardEditForm({ board, setBoard, onSubmit, onCancel }) {
    return (
        <div className="modal">
            <h3>Edytuj tablicę</h3>
            <input
                placeholder="Nazwa"
                value={board.name}
                onChange={(e) => setBoard({ ...board, name: e.target.value })}
            />
            <button onClick={onSubmit}>Zapisz</button>
            <button onClick={onCancel}>Anuluj</button>
        </div>
    );
}
