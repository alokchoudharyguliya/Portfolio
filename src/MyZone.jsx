import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars, FaTrash, FaPlus, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import './MyZone.css';

const MyZoneCard = ({ isNavBarClosed, setIsNavBarClosed }) => {
  const location = useLocation();
  const isActive = location.pathname === '/myzone';

  // ToDo State
  const [todos, setTodos] = useState([
    { id: 1, title: 'Complete React project', description: 'Build a responsive dashboard with React hooks', priority: 1, completed: false },
    { id: 5, title: 'Fix API endpoints', description: 'Debug and optimize backend API calls', priority: 2, completed: false },
    { id: 6, title: 'Design UI mockups', description: 'Create wireframes for new features', priority: 3, completed: false },
    { id: 4, title: 'Database migration', description: 'Migrate data to PostgreSQL', priority: 4, completed: false },
    { id: 3, title: 'Code review', description: 'Review pull requests from team members', priority: 5, completed: false },
    { id: 2, title: 'Write blog post', description: 'Document best practices for React state management', priority: 6, completed: true },
  ]);
  const [todoInput, setTodoInput] = useState('');
  const [todoDescription, setTodoDescription] = useState('');
  const [todoPriority, setTodoPriority] = useState('1');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('1');

  // Expense Tracker State
  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Food', amount: 250, date: '2024-03-05', description: 'Lunch at restaurant', createdAt: '2024-03-05' },
    { id: 2, category: 'Transport', amount: 150, date: '2024-03-06', description: 'Uber commute to office', createdAt: '2024-03-06' },
  ]);
  const [expenseForm, setExpenseForm] = useState({ category: '', amount: '', date: '', description: '' });
  const [expenseSortBy, setExpenseSortBy] = useState('createdAt');
  const [expenseSortOrder, setExpenseSortOrder] = useState('desc');

  // Gallery State
  const [albums, setAlbums] = useState([
    { 
      id: 1, 
      name: 'Travel 2024', 
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1502581578749-8d8dafce60c6?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1532274040911-5f82f20ae318?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
      ]
    },
    { 
      id: 2, 
      name: 'Events', 
      images: [
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop',
      ]
    },
    {
      id: 3,
      name: 'Nature & Wildlife',
      images: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1504006833117-8886a355efbf?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=300&fit=crop',
      ]
    },
    {
      id: 4,
      name: 'Food & Dining',
      images: [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
      ]
    },
    {
      id: 5,
      name: 'City Life',
      images: [
        'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?w=400&h=300&fit=crop',
      ]
    },
    {
      id: 6,
      name: 'People & Portraits',
      images: [
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      ]
    },
    {
      id: 7,
      name: 'Architecture',
      images: [
        'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1480837539958-13e4affa7a78?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1464146072230-91cabc968266?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop',
      ]
    },
    {
      id: 8,
      name: 'Sunsets & Skies',
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&h=300&fit=crop',
      ]
    },
  ]);
  const [albumName, setAlbumName] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  // ToDo Handlers
  const addTodo = () => {
    if (todoInput.trim() && todoDescription.trim()) {
      setTodos([...todos, { id: Date.now(), title: todoInput, description: todoDescription, priority: parseInt(todoPriority), completed: false }]);
      setTodoInput('');
      setTodoDescription('');
      setTodoPriority('1');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description);
    setEditPriority(todo.priority.toString());
  };

  const saveEdit = (id) => {
    if (editTitle.trim() && editDescription.trim()) {
      setTodos(todos.map(todo => 
        todo.id === id 
          ? { ...todo, title: editTitle, description: editDescription, priority: parseInt(editPriority) } 
          : todo
      ));
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const sortedTodos = [...todos].sort((a, b) => a.priority - b.priority);

  // Expense Handlers
  const addExpense = () => {
    if (expenseForm.category && expenseForm.amount && expenseForm.date && expenseForm.description) {
      setExpenses([...expenses, { id: Date.now(), ...expenseForm, amount: parseFloat(expenseForm.amount), createdAt: new Date().toISOString().split('T')[0] }]);
      setExpenseForm({ category: '', amount: '', date: '', description: '' });
    }
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const getSortedExpenses = () => {
    let sorted = [...expenses];
    sorted.sort((a, b) => {
      let compareVal = 0;
      if (expenseSortBy === 'amount') {
        compareVal = a.amount - b.amount;
      } else if (expenseSortBy === 'createdAt') {
        compareVal = new Date(a.createdAt) - new Date(b.createdAt);
      }
      return expenseSortOrder === 'asc' ? compareVal : -compareVal;
    });
    return sorted;
  };

  // Album Handlers
  const addAlbum = () => {
    if (albumName.trim()) {
      setAlbums([...albums, { id: Date.now(), name: albumName, images: [] }]);
      setAlbumName('');
    }
  };

  const deleteAlbum = (id) => {
    setAlbums(albums.filter(album => album.id !== id));
  };

  // Album Image Handlers
  const addImageToAlbum = (albumId) => {
    if (newImageUrl.trim()) {
      setAlbums(albums.map(album =>
        album.id === albumId
          ? { ...album, images: [...album.images, newImageUrl] }
          : album
      ));
      setNewImageUrl('');
    }
  };

  const deleteImageFromAlbum = (albumId, imageIndex) => {
    setAlbums(albums.map(album =>
      album.id === albumId
        ? { ...album, images: album.images.filter((_, idx) => idx !== imageIndex) }
        : album
    ));
  };

  const moveImageInAlbum = (albumId, fromIndex, toIndex) => {
    setAlbums(albums.map(album => {
      if (album.id === albumId) {
        const newImages = [...album.images];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);
        return { ...album, images: newImages };
      }
      return album;
    }));
  };

  const startEditingAlbum = (album) => {
    setEditingAlbumId(album.id);
    setSelectedAlbum(album);
  };

  return (
    <div className={`card ${isActive ? 'card-visible' : ''}`}>
      <div className='card-header' style={{ background: '#f39c12', '--clr': '#f39c12' }}>
        <h2>MyZone</h2>
        <NavLink
          to="/"
          className={isNavBarClosed ? 'cross-button-closed' : 'cross-button-open'}
          onClick={() => setIsNavBarClosed(!isNavBarClosed)}
        >
          <FaBars />
        </NavLink>
      </div>
      <div className='card-body myzone-container'>

        {/* ToDo Section */}
        <div className='myzone-section todo-section'>
          <div className='section-header'>
            <h3>📝 My ToDo List</h3>
            <div className='todo-stats'>
              <span className='stat-item'><strong>{todos.length}</strong> Total</span>
              <span className='stat-item'><strong>{todos.filter(t => t.completed).length}</strong> Done</span>
              <span className='stat-item'><strong>{todos.filter(t => !t.completed).length}</strong> Pending</span>
            </div>
          </div>
          <div className='section-content'>
            <div className='input-group'>
              <input
                type='text'
                value={todoInput}
                onChange={(e) => setTodoInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                placeholder='Task title...'
                className='todo-input'
              />
              <input
                type='text'
                value={todoDescription}
                onChange={(e) => setTodoDescription(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                placeholder='Task description...'
                className='todo-input'
              />
              <select 
                value={todoPriority} 
                onChange={(e) => setTodoPriority(e.target.value)}
                className='priority-select'
              >
                {[1, 2, 3, 4, 5].map(p => <option key={p} value={p}>P{p}</option>)}
              </select>
              <button onClick={addTodo} className='add-btn'>
                <FaPlus />
              </button>
            </div>
            <div className='todos-list'>
              {sortedTodos.length === 0 && (
                <div className='todos-empty-state'>
                  <span>📋</span>
                  <p>No todos yet. Add one above to get started!</p>
                </div>
              )}
              {sortedTodos.map(todo => (
                <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                  {editingId === todo.id ? (
                    <>
                      <input
                        type='checkbox'
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className='todo-checkbox'
                        disabled
                      />
                      <div className='todo-edit-form'>
                        <input
                          type='text'
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className='edit-input edit-title'
                          placeholder='Task title'
                        />
                        <input
                          type='text'
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className='edit-input edit-description'
                          placeholder='Task description'
                        />
                        <select 
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value)}
                          className='edit-priority'
                        >
                          {[1, 2, 3, 4, 5].map(p => <option key={p} value={p}>P{p}</option>)}
                        </select>
                      </div>
                      <div className='edit-actions'>
                        <button onClick={() => saveEdit(todo.id)} className='save-btn' title='Save'>
                          <FaSave />
                        </button>
                        <button onClick={cancelEdit} className='cancel-btn' title='Cancel'>
                          <FaTimes />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <input
                        type='checkbox'
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className='todo-checkbox'
                      />
                      <div className='todo-content'>
                        <div className='todo-header'>
                          <span className='todo-title'>{todo.title}</span>
                          <span className={`priority-badge priority-${todo.priority}`}>P{todo.priority}</span>
                        </div>
                        <span className='todo-description'>{todo.description}</span>
                      </div>
                      <div className='todo-actions'>
                        <button onClick={() => startEdit(todo)} className='edit-btn' title='Edit'>
                          <FaEdit />
                        </button>
                        <button onClick={() => deleteTodo(todo.id)} className='delete-btn' title='Delete'>
                          <FaTrash />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expense Tracker Section */}
        <div className='myzone-section expense-section'>
          <div className='section-header'>
            <h3>💰 Expense Tracker</h3>
            <span className='total-expense'>Total: ₹{totalExpense.toFixed(2)}</span>
          </div>
          <div className='section-content'>
            <div className='expense-form'>
              <input
                type='text'
                placeholder='Category'
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className='expense-input'
              />
              <input
                type='number'
                placeholder='Amount'
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className='expense-input'
              />
              <input
                type='date'
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className='expense-input'
              />
              <input
                type='text'
                placeholder='Description'
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className='expense-input'
              />
              <button onClick={addExpense} className='add-btn'>
                <FaPlus />
              </button>
            </div>
            <div className='sort-controls'>
              <select 
                value={expenseSortBy} 
                onChange={(e) => setExpenseSortBy(e.target.value)}
                className='sort-select'
              >
                <option value='createdAt'>Sort by Date Created</option>
                <option value='amount'>Sort by Amount</option>
              </select>
              <select 
                value={expenseSortOrder} 
                onChange={(e) => setExpenseSortOrder(e.target.value)}
                className='sort-select'
              >
                <option value='desc'>Descending</option>
                <option value='asc'>Ascending</option>
              </select>
            </div>
            <div className='expenses-list'>
              {expenses.length === 0 && (
                <div className='expenses-empty-state'>
                  <span>💳</span>
                  <p>No expenses recorded yet. Add one above to start tracking!</p>
                </div>
              )}
              {getSortedExpenses().map(exp => (
                <div key={exp.id} className='expense-item'>
                  <div className='expense-info'>
                    <span className='expense-category'>{exp.category}</span>
                    <span className='expense-description'>{exp.description}</span>
                    <span className='expense-date'>{exp.date}</span>
                  </div>
                  <div className='expense-amount'>
                    <span>₹{exp.amount.toFixed(2)}</span>
                    <button onClick={() => deleteExpense(exp.id)} className='delete-btn'>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className='myzone-section gallery-section'>
          <div className='section-header'>
            <h3>🎨 Gallery Albums</h3>
          </div>
          <div className='section-content'>
            <div className='input-group'>
              <input
                type='text'
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAlbum()}
                placeholder='Create new album...'
                className='todo-input'
              />
              <button onClick={addAlbum} className='add-btn'>
                <FaPlus />
              </button>
            </div>
            <div className='albums-list'>
              {albums.length === 0 && (
                <div className='albums-empty-state'>
                  <span>📷</span>
                  <p>No albums yet. Create your first album above!</p>
                </div>
              )}
              {albums.map(album => (
                <div key={album.id} className='album-card'>
                  <div className='album-header'>
                    <h4>{album.name}</h4>
                    <div className='album-header-actions'>
                      <button 
                        onClick={() => startEditingAlbum(album)}
                        className='edit-btn'
                        title='Edit album'
                      >
                        <FaEdit />
                      </button>
                      <button onClick={() => deleteAlbum(album.id)} className='delete-btn' title='Delete album'>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className='album-content'>
                    {album.images.length > 0 ? (
                      <>
                        <div className='album-thumbnails'>
                          {album.images.slice(0, 3).map((img, idx) => (
                            <img 
                              key={idx} 
                              src={img} 
                              alt={`thumb-${idx}`}
                              className='thumbnail'
                              onClick={() => setFullscreenImage(img)}
                            />
                          ))}
                        </div>
                        <button 
                          onClick={() => setSelectedAlbum(album)}
                          className='see-all-btn'
                        >
                          See All ({album.images.length})
                        </button>
                      </>
                    ) : (
                      <p className='empty-state'>No images yet. Click to add photos to this album.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Album Modal */}
        {selectedAlbum && (
          <div className='modal-overlay' onClick={() => { setSelectedAlbum(null); setEditingAlbumId(null); }}>
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
              <button 
                className='modal-close' 
                onClick={() => { setSelectedAlbum(null); setEditingAlbumId(null); }}
              >
                ✕
              </button>
              <h3 className='modal-title'>{selectedAlbum.name}</h3>

              {/* Add Image Section */}
              {editingAlbumId === selectedAlbum.id && (
                <div className='album-add-image-section'>
                  <input
                    type='text'
                    placeholder='Paste image URL here...'
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addImageToAlbum(selectedAlbum.id)}
                    className='image-url-input'
                  />
                  <button 
                    onClick={() => addImageToAlbum(selectedAlbum.id)}
                    className='add-image-btn'
                  >
                    <FaPlus /> Add Image
                  </button>
                </div>
              )}

              <div className='modal-images-grid-container'>
                <div className='modal-images-grid'>
                  {selectedAlbum.images.map((img, idx) => (
                    <div key={idx} className='modal-image-wrapper'>
                      <img
                        src={img}
                        alt={`${selectedAlbum.name}-${idx}`}
                        className='modal-image'
                        onClick={() => setFullscreenImage(img)}
                      />
                      {editingAlbumId === selectedAlbum.id && (
                        <div className='image-controls'>
                          <button 
                            onClick={() => deleteImageFromAlbum(selectedAlbum.id, idx)}
                            className='delete-image-btn'
                            title='Delete image'
                          >
                            <FaTrash />
                          </button>
                          <div className='image-move-buttons'>
                            <button 
                              onClick={() => moveImageInAlbum(selectedAlbum.id, idx, Math.max(0, idx - 1))}
                              disabled={idx === 0}
                              className='move-btn'
                              title='Move left'
                            >
                              ←
                            </button>
                            <button 
                              onClick={() => moveImageInAlbum(selectedAlbum.id, idx, Math.min(selectedAlbum.images.length - 1, idx + 1))}
                              disabled={idx === selectedAlbum.images.length - 1}
                              className='move-btn'
                              title='Move right'
                            >
                              →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className='modal-footer'>
                {editingAlbumId === selectedAlbum.id ? (
                  <button 
                    onClick={() => setEditingAlbumId(null)}
                    className='done-btn'
                  >
                    Done Editing
                  </button>
                ) : (
                  <button 
                    onClick={() => startEditingAlbum(selectedAlbum)}
                    className='edit-modal-btn'
                  >
                    <FaEdit /> Edit Images
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Image Viewer */}
        {fullscreenImage && (
          <div className='fullscreen-overlay' onClick={() => setFullscreenImage(null)}>
            <button 
              className='fullscreen-close' 
              onClick={() => setFullscreenImage(null)}
            >
              ✕
            </button>
            <img 
              src={fullscreenImage} 
              alt='fullscreen'
              className='fullscreen-image'
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default MyZoneCard;
