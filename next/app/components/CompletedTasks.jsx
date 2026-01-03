"use client";

import { useState, useEffect } from 'react';
import TaskItem from './TaskItem';
import { Storage } from '../lib/storage';

export default function CompletedTasks({ currentDateStr, onCalendarUpdate }) {
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    loadTasks();
  }, [currentDateStr]);

  const loadTasks = () => {
    const tasks = Storage.getTasksByDate(currentDateStr);
    setCompletedTasks(tasks.completed);
    onCalendarUpdate();
  };

  const handleDelete = (taskId) => {
    Storage.deleteTask(currentDateStr, taskId, true);
    loadTasks();
  };

  const handleUpdate = (taskId, newText) => {
    Storage.updateTask(currentDateStr, taskId, newText, true);
    loadTasks();
  };

  return (
    <div id="completed-tasks" className="tasks-list">
      {completedTasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          isCompleted={true}
          onComplete={() => {}}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}

