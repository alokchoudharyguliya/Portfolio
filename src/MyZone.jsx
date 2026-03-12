import { useState } from 'react';
import useTodos from './hooks/useTodos';
import useExpenses from './hooks/useExpenses';
import useAlbums from './hooks/useAlbums';
import { usePermissions } from './contexts/PermissionsProvider';
import { NavLink } from 'react-router-dom';
import { FaBars, FaTrash, FaPlus, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import './MyZone.css';

const MyZoneCard = ({ isNavBarClosed, setIsNavBarClosed }) => {
  const location = useLocation();
  const isActive = location.pathname === '/myzone';

  // ToDo State (fetched from backend)
  // useTodos hook provides `todos` and CRUD operations
  const {
    todos,
    loading: todosLoading,
    error: todosError,
    refetch: refetchTodos,
    createTodo,
    updateTodo,
    deleteTodo: apiDeleteTodo,
    toggleTodo: apiToggleTodo,
  } = useTodos();
  const { isSuperuser } = usePermissions();
  const {expenses, totalExpenditure, loading:expensesLoading,error:expensesError,refetch:refetchExpenses,createExpense,updateExpense,deleteExpense}=useExpenses()
  const [todoInput, setTodoInput] = useState('');
  const [todoDescription, setTodoDescription] = useState('');
  const [todoPriority, setTodoPriority] = useState('1');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('1');

  // Expense Tracker State (fetched from backend via `useExpenses`)
  const [expenseForm, setExpenseForm] = useState({ category: '', amount: '', date: '', description: '' });
  const [expenseSortBy, setExpenseSortBy] = useState('createdAt');
  const [expenseSortOrder, setExpenseSortOrder] = useState('desc');

  // Gallery (backed by API)
  const {
    albums,
    loading: albumsLoading,
    error: albumsError,
    refetch: refetchAlbums,
    createAlbum: apiCreateAlbum,
    deleteAlbum: apiDeleteAlbum,
    uploadImage,
    deleteImage: apiDeleteImage,
    moveImage: apiMoveImage,
    addLocalImage,
  } = useAlbums();
  const [albumName, setAlbumName] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [moveTargets, setMoveTargets] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadModalAlbumId, setUploadModalAlbumId] = useState(null);

  // ToDo Handlers
  const addTodo = async () => {
    if (!todoInput.trim() || !todoDescription.trim()) return;
    try {
      await createTodo({ title: todoInput, description: todoDescription, priority: parseInt(todoPriority), completed: false });
      setTodoInput('');
      setTodoDescription('');
      setTodoPriority('1');
    } catch (err) {
      console.error('createTodo failed', err);
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    try {
      await apiToggleTodo(id, !todo.completed);
    } catch (err) {
      console.error('toggle failed', err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await apiDeleteTodo(id);
    } catch (err) {
      console.error('delete failed', err);
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description);
    setEditPriority((todo.priority || 1).toString());
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim() || !editDescription.trim()) return;
    try {
      await updateTodo(id, { title: editTitle, description: editDescription, priority: parseInt(editPriority) });
      setEditingId(null);
    } catch (err) {
      console.error('update failed', err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const sortedTodos = [...todos].sort((a, b) => a.priority - b.priority);

  // Expense Handlers
  const addExpense = async () => {
    if (!(expenseForm.category && expenseForm.amount && expenseForm.date && expenseForm.description)) return;
    try {
      await createExpense({ ...expenseForm, amount: parseFloat(expenseForm.amount) });
      setExpenseForm({ category: '', amount: '', date: '', description: '' });
    } catch (err) {
      console.error('createExpense failed', err);
    }
  };

  // const deleteExpense = async (id) => {
  //   try {
  //     await deleteExpense(id);
  //   } catch (err) {
  //     console.error('deleteExpense failed', err);
  //   }
  // };

  const totalExpense = totalExpenditure || 0;

  // Server-side ordering is used; return list as provided by backend.
  const getSortedExpenses = () => Array.isArray(expenses) ? expenses : [];

  // Album Handlers
  const addAlbum = async () => {
    if (!albumName.trim()) return;
    try {
      await apiCreateAlbum({ title: albumName });
      setAlbumName('');
      refetchAlbums();
    } catch (err) {
      console.error('create album failed', err);
    }
  };

  const deleteAlbum = async (id) => {
    try {
      await apiDeleteAlbum(id);
      refetchAlbums();
    } catch (err) {
      console.error('delete album failed', err);
    }
  };

  // Album Image Handlers
  const addImageToAlbum = async (albumId, file, title) => {
    if (!file) return;
    try {
      const created = await uploadImage(albumId, file, title);
      return created;
    } catch (err) {
      console.error('add image failed', err);
      throw err;
    }
  };

  const deleteImageFromAlbum = async (albumId, imageId, idx) => {
    try {
      if (imageId) {
        await apiDeleteImage(albumId, imageId);
        // also refetch global albums to keep in sync
        refetchAlbums();
      } else if (typeof idx === 'number') {
        // remove local non-uploaded image by index
        setSelectedAlbum(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
      }
    } catch (err) {
      console.error('delete image failed', err);
    }
  };

  const moveImageInAlbum = async (albumId, imageId, targetAlbumId, idx) => {
    try {
      if (!imageId) return; // only move uploaded images via API
      await apiMoveImage(albumId, imageId, targetAlbumId);
      // remove from current modal view
      setSelectedAlbum(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
      // refresh global albums to reflect server change
      refetchAlbums();
    } catch (err) {
      console.error('move image failed', err);
    }
  };

  const startEditingAlbum = (album) => {
    setEditingAlbumId(album.id);
    setSelectedAlbum(album);
  };

  const openUploadModal = (albumId) => {
    setUploadModalAlbumId(albumId);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadModalAlbumId(null);
    setUploadFile(null);
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
            {isSuperuser && (
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
            )}
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
                      {isSuperuser && (
                        <input
                          type='checkbox'
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id)}
                          className='todo-checkbox'
                          disabled
                        />
                      )}
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
                      {isSuperuser && (
                        <input
                          type='checkbox'
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id)}
                          className='todo-checkbox'
                        />
                      )}
                      <div className='todo-content'>
                        <div className='todo-header'>
                          <span className='todo-title'>{todo.title}</span>
                          <span className={`priority-badge priority-${todo.priority}`}>P{todo.priority}</span>
                        </div>
                        <span className='todo-description'>{todo.description}</span>
                      </div>
                      <div className='todo-actions'>
                        {isSuperuser && (
                          <>
                            <button onClick={() => startEdit(todo)} className='edit-btn' title='Edit'>
                              <FaEdit />
                            </button>
                            <button onClick={() => deleteTodo(todo.id)} className='delete-btn' title='Delete'>
                              <FaTrash />
                            </button>
                          </>
                        )}
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
            {isSuperuser && (
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
              <textarea
                placeholder='Description'
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className='expense-textarea'
                rows={4}
              />
              <button onClick={addExpense} className='add-btn'>
                <FaPlus />
              </button>
            </div>
            )}
            <div className='sort-controls'>
              <select
                value={expenseSortBy}
                onChange={(e) => {
                  const v = e.target.value;
                  setExpenseSortBy(v);
                  const dir = expenseSortOrder === 'asc' ? '' : '-';
                  let field = 'created_at';
                  if (v === 'amount') field = 'amount';
                  else if (v === 'createdAt') field = 'created_at';
                  else if (v === 'date') field = 'date';
                  refetchExpenses({ ordering: dir + field });
                }}
                className='sort-select'
              >
                <option value='createdAt'>Sort by Date Created</option>
                <option value='date'>Sort by Expense Date</option>
                <option value='amount'>Sort by Amount</option>
              </select>
              <select
                value={expenseSortOrder}
                onChange={(e) => {
                  const dirVal = e.target.value;
                  setExpenseSortOrder(dirVal);
                  const dir = dirVal === 'asc' ? '' : '-';
                  let field = 'created_at';
                  if (expenseSortBy === 'amount') field = 'amount';
                  else if (expenseSortBy === 'createdAt') field = 'created_at';
                  else if (expenseSortBy === 'date') field = 'date';
                  refetchExpenses({ ordering: dir + field });
                }}
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
                      {isSuperuser && (
                        <button onClick={() => deleteExpense(exp.id)} className='delete-btn'>
                          <FaTrash />
                        </button>
                      )}
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
            {isSuperuser && (
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
            )}
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
                      {isSuperuser && (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                  <div className='album-content'>
                    {album.images.length > 0 ? (
                      <>
                        <div className='album-thumbnails'>
                          {album.images.slice(0, 3).map((img, idx) => {
                            const src = (img && typeof img === 'object') ? (img.image || img.url) : img;
                            const key = (img && typeof img === 'object' && img.id) ? img.id : idx;
                            return (
                              <img
                                key={key}
                                src={src}
                                alt={`thumb-${idx}`}
                                className='thumbnail'
                                onClick={() => setFullscreenImage(src)}
                              />
                            );
                          })}
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
              {editingAlbumId === selectedAlbum.id && isSuperuser && (
                <div style={{ marginBottom: 20, textAlign: 'center' }}>
                  <button 
                    onClick={() => openUploadModal(selectedAlbum.id)}
                    className='add-image-btn'
                    style={{ margin: '0 auto' }}
                  >
                    <FaPlus /> Upload Image
                  </button>
                </div>
              )}

              <div className='modal-images-grid-container'>
                <div className='modal-images-grid'>
                  {selectedAlbum.images.map((img, idx) => {
                    const isObject = img && typeof img === 'object';
                    const src = isObject ? (img.image || img.url) : img;
                    const imgId = isObject ? img.id : null;
                    const key = imgId || idx;
                    return (
                      <div key={imgId || idx} className='modal-image-wrapper'>
                        <img
                          src={src}
                          alt={`${selectedAlbum.name}-${idx}`}
                          className='modal-image'
                          onClick={() => setFullscreenImage(src)}
                        />
                        {editingAlbumId === selectedAlbum.id && isSuperuser && (
                          <div className='image-controls'>
                            <button 
                              onClick={async () => {
                                try {
                                  await deleteImageFromAlbum(selectedAlbum.id, imgId || null, idx);
                                  setSelectedAlbum(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
                                  refetchAlbums();
                                } catch (err) {
                                  console.error('delete image failed', err);
                                }
                              }}
                              className='delete-image-btn'
                              title='Delete image'
                            >
                              <FaTrash />
                            </button>
                            <div className='image-move-actions'>
                              <select
                                className='move-select'
                                value={moveTargets[key] || ''}
                                onChange={(e) => setMoveTargets(prev => ({ ...prev, [key]: e.target.value }))}
                              >
                                <option value=''>Move to...</option>
                                {albums.filter(a => a.id !== selectedAlbum.id).map(a => (
                                  <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                              </select>
                              <button
                                className='move-action-btn'
                                disabled={!moveTargets[key]}
                                onClick={async () => {
                                  const target = moveTargets[key];
                                  if (!target) return;
                                  try {
                                    await moveImageInAlbum(selectedAlbum.id, imgId, target, idx);
                                    setMoveTargets(prev => ({ ...prev, [key]: '' }));
                                  } catch (err) {
                                    console.error('move failed', err);
                                  }
                                }}
                              >
                                Move
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                  isSuperuser ? (
                    <button 
                      onClick={() => startEditingAlbum(selectedAlbum)}
                      className='edit-modal-btn'
                    >
                      <FaEdit /> Edit Images
                    </button>
                  ) : null
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

        {/* Upload Image Modal */}
        {showUploadModal && (
          <div className='modal-overlay' onClick={closeUploadModal}>
            <div className='modal-content upload-modal-content' onClick={(e) => e.stopPropagation()}>
              <button 
                className='modal-close' 
                onClick={closeUploadModal}
              >
                ✕
              </button>
              <h3 className='modal-title'>Upload Image</h3>
              <div className='upload-modal-body'>
                <label className='upload-label-large'>
                  <input
                    type='file'
                    accept='image/*'
                    className='upload-input'
                    onChange={(e) => setUploadFile(e.target.files && e.target.files[0])}
                  />
                  📸 Choose Image
                </label>
                {uploadFile && (
                  <div className='upload-preview-large'>
                    <span className='file-name-large'>✓ {uploadFile.name}</span>
                  </div>
                )}
                <button 
                  onClick={async () => {
                    if (!uploadFile || !uploadModalAlbumId) return;
                    try {
                      const created = await addImageToAlbum(uploadModalAlbumId, uploadFile, '');
                      // update local modal view
                      setSelectedAlbum(prev => ({ ...prev, images: [...(prev.images||[]), created] }));
                      closeUploadModal();
                      // refresh global albums state
                      refetchAlbums();
                    } catch (err) {
                      console.error('upload failed', err);
                    }
                  }}
                  className='add-image-btn'
                  disabled={!uploadFile}
                  style={{ alignSelf: 'center', marginTop: 16 }}
                >
                  <FaPlus /> Upload
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyZoneCard;
