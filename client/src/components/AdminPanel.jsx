import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPanel = ({ token, currentUserRole }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const API = 'http://localhost:5000/api/admin';
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const loadUsers = async () => {
    try {
      const res = await axios.get(`${API}/users`, headers);
      setUsers(res.data);
    } catch (err) {
      setError('Brak dostępu do panelu admina');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Na pewno usunąć użytkownika?')) return;
    await axios.delete(`${API}/users/${id}`, headers);
    setUsers(users.filter(u => u._id !== id));
  };

  const changeRole = async (id, newRole) => {
    await axios.put(`${API}/users/${id}/role`, { role: newRole }, headers);
    setUsers(users.map(u => (u._id === id ? { ...u, role: newRole } : u)));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (error) return <div>{error}</div>;

  return (
    <div className="admin-panel">
      <h3>Panel administratora</h3>
      <table className="board-table">
        <thead>
          <tr>
            <th>Użytkownik</th>
            <th>Rola</th>
            {currentUserRole === 'admin' && <th>Zmień rolę</th>}
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.username}</td>
              <td>{u.role}</td>
              {currentUserRole === 'admin' && (
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u._id, e.target.value)}
                  >
                    <option value="user">user</option>
                    <option value="moderator">moderator</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              )}
              <td>
                {(currentUserRole === 'admin' || (currentUserRole === 'moderator' && u.role === 'user')) && (
                  <button onClick={() => deleteUser(u._id)}>Usuń</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
