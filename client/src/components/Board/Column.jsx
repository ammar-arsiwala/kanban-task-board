// client/src/components/Board/Column.js
import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import './Board.css';

const Column = ({
    columnId,
    title,
    tasks,
    onCreateTask,
    onEditTask,
    onDeleteTask
}) => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: ''
    });

    const { isOver, setNodeRef } = useDroppable({
        id: columnId,
    });

    const handleCreateTask = (e) => {
        e.preventDefault();
        if (newTask.title.trim() && newTask.description.trim()) {
            onCreateTask({
                ...newTask,
                status: columnId 
            });
            setNewTask({ title: '', description: '' });
            setShowCreateForm(false);
        }
    };

    // Handle create form cancel
    const handleCreateCancel = () => {
        setNewTask({ title: '', description: '' });
        setShowCreateForm(false);
    };

    // Get task IDs 
    const taskIds = tasks.map(task => task._id);

    const style = {
        backgroundColor: isOver ? '#f0f8ff' : undefined,
    };

    return (
        <div className="column">
            <div className="column-header">
                <h3 className="column-title">{title}</h3>
                <span className="task-count">{tasks.length}</span>
            </div>

            <div
                ref={setNodeRef}
                style={style}
                className={`column-content ${isOver ? 'drag-over' : ''}`}
            >
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                        />
                    ))}
                </SortableContext>

                {/* Add a new task form */}
                {showCreateForm ? (
                    <div className="task-create-form">
                        <form onSubmit={handleCreateTask}>
                            <input
                                type="text"
                                placeholder="Task title"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                className="task-create-title"
                                required
                                autoFocus
                            />
                            <textarea
                                placeholder="Task description"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                className="task-create-description"
                                rows="3"
                                required
                            />
                            <div className="task-create-actions">
                                <button type="submit" className="btn-create">
                                    Create Task
                                </button>
                                <button type="button" onClick={handleCreateCancel} className="btn-cancel">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="add-task-button"
                    >
                        + Add a task
                    </button>
                )}
            </div>
        </div>
    );
};

export default Column;