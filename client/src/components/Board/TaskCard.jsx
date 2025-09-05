// client/src/components/Board/TaskCard.js
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { authUtils } from '../../utils/auth';
import './Board.css';

const TaskCard = ({ task, onEdit, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        id: task._id,
        title: task.title,
        description: task.description,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        position: task.position
    });

    const currentUser = authUtils.getCurrentUser();
    const canEdit = authUtils.canEditTask(task.createdBy._id);

    // Set up sortable functionality
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task._id,
        data: {
            type: 'task',
            task,
        },
        disabled: !canEdit || isEditing, // Users can only drag their own tasks
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // Handle edit mode toggle
    const handleEditToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(!isEditing);
        if (!isEditing) {
            setEditData({
                title: task.title,
                description: task.description
            });
        }
    };

    // Handle edit form submission
    const handleEditSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (editData.title.trim() && editData.description.trim()) {
            onEdit(task._id, editData);
            setIsEditing(false);
        }
    };

    // Handle edit form cancel
    const handleEditCancel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditData({
            title: task.title,
            description: task.description
        });
        setIsEditing(false);
    };

    const handleTitleChange = (e) => {
        e.stopPropagation();
        setEditData({ ...editData, title: e.target.value });
    };

    const handleDescriptionChange = (e) => {
        e.stopPropagation();
        setEditData({ ...editData, description: e.target.value });
    };

    const handleKeyDown = (e) => {
        if (e.key === ' ') {
            e.stopPropagation(); // Prevent space from interfering with drag
        }
        if (e.key === 'Escape') {
            handleEditCancel(e);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`task-card ${isDragging ? 'dragging' : ''} ${!canEdit ? 'non-draggable' : ''} ${isEditing ? 'editing' : ''}`}
            {...attributes}
            {...listeners}
        >
            {isEditing ? (
                <div onClick={(e) => e.stopPropagation()}>
                    <form onSubmit={handleEditSubmit} className="task-edit-form">
                        <input
                            type="text"
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            className="task-edit-title"
                            required
                        />
                        <textarea
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            className="task-edit-description"
                            rows="3"
                            required
                        />
                        <div className="task-edit-actions">
                            <button type="submit" className="btn-save">Save</button>
                            <button type="button" onClick={handleEditCancel} className="btn-cancel">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                // View mode
                <>
                    <div className="task-content">
                        <h4 className="task-title">{task.title}</h4>
                        <p className="task-description">{task.description}</p>
                        <div className='task-created'>
                            <p>Created Date: {new Date(task.createdAt).toLocaleDateString()}</p>
                            <p>Created Time: {new Date(task.createdAt).toLocaleTimeString()}</p>
                            <p>Position: {task.position} </p>
                        </div>
                    </div>

                    <div className="task-footer">
                        <div className="task-creator">
                            <small>
                                Created by: <strong>{task.createdBy.username}</strong>
                                {task.createdBy.role === 'admin' && (
                                    <span className="creator-badge admin">Admin</span>
                                )}
                            </small>
                        </div>

                        {canEdit && (
                            <div className="task-actions">
                                <button
                                    onClick={handleEditToggle}
                                    className="btn-edit"
                                    title="Edit task"
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => onDelete(task._id)}
                                    className="btn-delete"
                                    title="Delete task"
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    🗑️
                                </button>
                            </div>
                        )}
                    </div>

                    {!canEdit && (
                        <div className="task-locked">
                            <small>🔒 View only</small>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TaskCard;