// client/src/components/Board/KanbanBoard.js
import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import Column from './Column';
import TaskCard from './TaskCard';
import { taskAPI } from '../../services/api';
import { authUtils } from '../../utils/auth';
import './Board.css';

const KanbanBoard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTask, setActiveTask] = useState(null);

    // Pointers for 
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const columns = [
        { id: 'To Do', title: 'To Do' },
        { id: 'In Progress', title: 'In Progress' },
        { id: 'Done', title: 'Done' }
    ];

    // Zustand also applicable, will check if required
    useEffect(() => {
        fetchTasks();
    }, []);

    // Fetch all tasks from API
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await taskAPI.getAllTasks();
            const tasksWithPositions = (response.tasks || []).map((task, index) => ({
                ...task,
                position: task.position ?? index // Check Postion of each task and ensure it has a value corresponding to it
            }));
            setTasks(tasksWithPositions);
            setError('');
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            setError('Failed to load tasks. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    // Handle creation
    const handleCreateTask = async (taskData) => {
        try {
            // Calculate position for new task (last in the column)
            const tasksInColumn = tasks.filter(t => t.status === taskData.status);
            const newPosition = tasksInColumn.length;
            
            const response = await taskAPI.createTask({
                ...taskData,
                position: newPosition
            });
            
            const newTask = {
                ...response.task,
                position: newPosition
            };
            
            setTasks(prev => [...prev, newTask]);
            setError('');
        } catch (error) {
            console.error('Failed to create task:', error);
            setError('Failed to create task. Please try again.');
        }
    };

    // Handle editing
    const handleEditTask = async (taskId, taskData) => {
        try {
            const response = await taskAPI.updateTask(taskId, taskData);
            setTasks(prev =>
                prev.map(task => task._id === taskId ? { ...response.task, position: task.position } : task)
            );
            setError('');
        } catch (error) {
            console.error('Failed to update task:', error);
            setError('Failed to update task. Please try again.');
        }
    };

    // Handle deletion
    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await taskAPI.deleteTask(taskId);
                setTasks(prev => prev.filter(task => task._id !== taskId));
                setError('');
            } catch (error) {
                console.error('Failed to delete task:', error);
                setError('Failed to delete task. Please try again.');
            }
        }
    };

    // Handle drag start
    const handleDragStart = (event) => {
        const { active } = event;
        const task = tasks.find(t => t._id === active.id);
        setActiveTask(task);
    };

    // Handle drag end
    const handleDragEnd = async (event) => {
        const { active, over } = event;
        
        setActiveTask(null);
        
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeTask = tasks.find(task => task._id === activeId);
        if (!activeTask) return;

        // Check if user can edit this task
        if (!authUtils.canEditTask(activeTask.createdBy._id)) {
            setError('You can only move your own tasks.');
            return;
        }

        const activeStatus = activeTask.status;
        let targetStatus = activeStatus;

        // Determine the target status based on the drop target
        if (columns.some(col => col.id === overId)) {
            // Dropped on a column
            targetStatus = overId;
        } else {
            const targetTask = tasks.find(task => task._id === overId);
            if (targetTask) {
                targetStatus = targetTask.status;
            }
        }

        // Handle moving between columns
        if (activeStatus !== targetStatus) {
            try {
                // Calculate new position (last in the target column)
                const tasksInTargetColumn = tasks.filter(t => t.status === targetStatus && t._id !== activeId);
                const newPosition = tasksInTargetColumn.length;

                // Update task 
                const updatedTask = {
                    ...activeTask,
                    status: targetStatus,
                    position: newPosition
                };

                // Update state immediately
                setTasks(prev => prev.map(task => 
                    task._id === activeId ? updatedTask : task
                ));

                // Update on server
                await taskAPI.updateTask(activeId, {
                    status: targetStatus,
                    position: newPosition
                });

                setError('');
            } catch (error) {
                console.error('Failed to move task:', error);
                setError('Failed to move task. Please try again.');
                // Revert by refetching
                fetchTasks();
            }
        } 
        // reording withing same col:-
        else if (activeId !== overId) {
            const tasksInColumn = getTasksByStatus(activeStatus);
            const activeIndex = tasksInColumn.findIndex(task => task._id === activeId);
            let targetIndex = tasksInColumn.findIndex(task => task._id === overId);

            if (activeIndex !== -1 && targetIndex !== -1 && activeIndex !== targetIndex) {
                try {
                    // Create updated  array
                    const reorderedTasks = arrayMove(tasksInColumn, activeIndex, targetIndex);
                    
                    // Update positions for all tasks in  updated array
                    const updatedTasksInColumn = reorderedTasks.map((task, index) => ({
                        ...task,
                        position: index
                    }));

                    // Update state - replace tasks in this column with reordered ones
                    setTasks(prev => {
                        const otherTasks = prev.filter(task => task.status !== activeStatus);
                        return [...otherTasks, ...updatedTasksInColumn];
                    });

                    // Update position for any task that has changed position
                    await taskAPI.updateTask(activeId, {
                        position: targetIndex
                    });

                    setError('911');
                } catch (error) {
                    console.error('Failed to reorder task:', error);
                    setError('Failed to reorder task. Please try again.');
                    fetchTasks();
                }
            }
        }
    };

    // Group tasks by status and sort by position
    const getTasksByStatus = (status) => {
        return tasks
            .filter(task => task.status === status)
            .sort((a, b) => {
                const posA = a.position ?? 0;
                const posB = b.position ?? 0;
                return posA - posB;
            });
    };

    if (loading) {
        return (
            <div className="board-container">
                <div className="loading">Loading tasks...</div>
            </div>
        );
    }

    return (
        <div className="board-container">
            {error && (
                <div className="error-banner">
                    {error}
                    <button onClick={() => setError('')} className="error-close">×</button>
                </div>
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="board">
                    {columns.map(column => (
                        <Column
                            key={column.id}
                            columnId={column.id}
                            title={column.title}
                            tasks={getTasksByStatus(column.id)}
                            onCreateTask={handleCreateTask}
                            onEditTask={handleEditTask}
                            onDeleteTask={handleDeleteTask}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <TaskCard
                            task={activeTask}
                            onEdit={() => {}}
                            onDelete={() => {}}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default KanbanBoard;