import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import BoardForm from './components/BoardForm';
import BoardEditForm from './components/BoardEditForm';
import TaskForm from './components/TaskForm';

const API = 'http://localhost:5000/api';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [formError, setFormError] = useState('');

  const [showBoardForm, setShowBoardForm] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [editingBoard, setEditingBoard] = useState(null);
  const [showBoardEditForm, setShowBoardEditForm] = useState(false);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: '', _id: null });



  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const login = async () => {
    if (!username || !password) return setFormError('Pola nie mogą być puste');
    try {
      const res = await axios.post(`${API}/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setFormError('');
    } catch {
      setFormError('Błędne dane logowania');
    }
  };

  const register = async () => {
    if (!username || !password) return setFormError('Pola nie mogą być puste');
    await axios.post(`${API}/register`, { username, password });
    login();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setBoards([]);
    setTasks([]);
    setSelectedBoard(null);
  };

  const loadBoards = async () => {
    const res = await axios.get(`${API}/boards`, authHeader);
    setBoards(res.data);
  };

  const createBoard = async () => {
    if (!newBoardName) return;
    const res = await axios.post(`${API}/boards`, { name: newBoardName }, authHeader);
    setBoards([...boards, res.data]);
    setNewBoardName('');
    setShowBoardForm(false);
  };

  const openBoardEditForm = (board) => {
    setEditingBoard(board);
    setShowBoardEditForm(true);
  };

  const submitBoardEdit = async () => {
    const res = await axios.put(`${API}/boards/${editingBoard._id}`, { name: editingBoard.name }, authHeader);
    setBoards(boards.map(b => b._id === editingBoard._id ? res.data : b));
    setShowBoardEditForm(false);
  };


  const deleteBoard = async (boardId) => {
    if (!window.confirm('Usunąć tablicę? Spowoduje to też usunięcie jej zadań.')) return;
    await axios.delete(`${API}/boards/${boardId}`, authHeader);
    setBoards(boards.filter(b => b._id !== boardId));
    if (selectedBoard === boardId) {
      setSelectedBoard(null);
      setTasks([]);
    }
  };


  const loadTasks = async (boardId) => {
    const res = await axios.get(`${API}/tasks/${boardId}`, authHeader);
    setTasks(res.data);
    setSelectedBoard(boardId);
  };

  const openTaskForm = (status) => {
    setNewTask({ title: '', description: '', status, _id: null });
    setShowTaskForm(true);
  };

  const submitNewTask = async () => {
    const { title, description, status, _id } = newTask;

    if (!title || !description) return alert('Pola nie mogą być puste');
    if (_id) {
      const res = await axios.put(`${API}/tasks/${_id}`, { title, description, status }, authHeader);
      setTasks(tasks.map((t) => (t._id === _id ? res.data : t)));
    } else {
      const res = await axios.post(
        `${API}/tasks`,
        { title, description, status, boardId: selectedBoard },
        authHeader
      );

      setTasks([...tasks, res.data]);
    }
    setShowTaskForm(false);
  };

  const editTask = (task) => {
    setNewTask(task);
    setShowTaskForm(true);
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Na pewno usunąć zadanie?')) return;
    await axios.delete(`${API}/tasks/${taskId}`, authHeader);
    setTasks(tasks.filter((t) => t._id !== taskId));
  };

  const updateTaskStatus = async (taskId, status) => {
    const task = tasks.find((t) => t._id === taskId);
    const res = await axios.put(`${API}/tasks/${taskId}`, { ...task, status }, authHeader);
    setTasks(tasks.map((t) => (t._id === taskId ? res.data : t)));
  };

  useEffect(() => {
    if (token) loadBoards();
  }, [token]);

  if (!token)
    return (
      <div className="auth">
        <h2>Logowanie / Rejestracja</h2>
        <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button onClick={login}>Zaloguj</button>
        <button onClick={register}>Zarejestruj</button>
        {formError && <p style={{ color: 'red' }}>{formError}</p>}
      </div>
    );

  return (
    <div className="app">
      <header>
        <h2>Twoje tablice</h2>
        <button onClick={() => setShowBoardForm(true)}>+ Nowa tablica</button>
        <button onClick={logout}>Wyloguj</button>
      </header>
      <table className="board-table">
        <tbody>
          {boards.map((b) => (
            <tr key={b._id}>
              <td onClick={() => loadTasks(b._id)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                {b.name}
              </td>
              <td className="actions-cell">
                <button onClick={() => openBoardEditForm(b)}>Edytuj</button>
              </td>
              <td className="actions-cell">
                <button onClick={() => deleteBoard(b._id)}>Usuń</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedBoard && (
        <div className="kanban">
          <h3>Kanban</h3>
          <div className="columns">
            {['TO DO', 'IN PROGRESS', 'DONE'].map((status) => {
              const className = status.toLowerCase().replace(/\s/g, '-');
              return (
                <div key={status} className={`column ${className}`}>
                  <h4>{status}</h4>
                  <button onClick={() => openTaskForm(status)}>+ Dodaj</button>
                  {tasks.filter((t) => t.status === status).map((task) => (
                    <div key={task._id} className="task">
                      <strong>{task.title}</strong>
                      <p>{task.description}</p>
                      <div className="actions">
                        {['TO DO', 'IN PROGRESS', 'DONE'].filter(s => s !== status).map((s) => (
                          <button key={s} onClick={() => updateTaskStatus(task._id, s)}>{s}</button>
                        ))}
                        <button onClick={() => editTask(task)}>Edytuj</button>
                        <button onClick={() => deleteTask(task._id)}>Usuń</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {showBoardForm && (
        <BoardForm
          value={newBoardName}
          setValue={setNewBoardName}
          onSubmit={createBoard}
          onCancel={() => setShowBoardForm(false)}
        />
      )}

      {showTaskForm && (
        <TaskForm
          task={newTask}
          setTask={setNewTask}
          onSubmit={submitNewTask}
          onCancel={() => setShowTaskForm(false)}
        />
      )}

      {showBoardEditForm && (
        <BoardEditForm
          board={editingBoard}
          setBoard={setEditingBoard}
          onSubmit={submitBoardEdit}
          onCancel={() => setShowBoardEditForm(false)}
        />
      )}

    </div>
  );
};

export default App;
