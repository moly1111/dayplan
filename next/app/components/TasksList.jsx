"use client";

import { useState, useEffect, useRef } from 'react';
import TaskItem from './TaskItem';
import { Storage } from '../lib/storage';

export default function TasksList({ currentDateStr, onCalendarUpdate }) {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [killingTaskId, setKillingTaskId] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    loadTasks();
  }, [currentDateStr]);

  const loadTasks = () => {
    const tasks = Storage.getTasksByDate(currentDateStr);
    setPendingTasks(tasks.pending);
    setCompletedTasks(tasks.completed);
    onCalendarUpdate();
  };

  const handleAddTask = (e) => {
    if (e.key === 'Enter' && taskInput.trim()) {
      Storage.addTask(currentDateStr, taskInput.trim());
      setTaskInput('');
      loadTasks();
    }
  };

  const handleComplete = (taskId) => {
    const settings = Storage.getSettings();
    
    if (settings.killAnimation) {
      setKillingTaskId(taskId);
      
      // 播放音效
      if (settings.killSound && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log('Sound play failed:', e));
      }
      
      // 动画完成后移动任务
      setTimeout(() => {
        Storage.completeTask(currentDateStr, taskId);
        setKillingTaskId(null);
        loadTasks();
      }, 300);
    } else {
      Storage.completeTask(currentDateStr, taskId);
      loadTasks();
    }
  };

  const handleDelete = (taskId, fromCompleted) => {
    Storage.deleteTask(currentDateStr, taskId, fromCompleted);
    loadTasks();
  };

  const handleUpdate = (taskId, newText) => {
    Storage.updateTask(currentDateStr, taskId, newText, false);
    loadTasks();
  };

  const getDateTitle = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(currentDateStr + 'T00:00:00');
    
    if (selectedDate.getTime() === today.getTime()) {
      return 'Today';
    } else {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    }
  };

  return (
    <>
      <audio ref={audioRef} preload="auto">
        <source src="/audio/kill.wav" type="audio/wav" />
      </audio>
      
      <h2 id="date-title">{getDateTitle()}</h2>
      
      <div className="task-input-container">
        <input
          type="text"
          id="task-input"
          placeholder="添加计划，按 Enter 确认"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          onKeyPress={handleAddTask}
        />
      </div>

      <div id="pending-tasks" className="tasks-list">
        {pendingTasks.map(task => (
          <div
            key={task.id}
            className={killingTaskId === task.id ? 'task-item killing' : ''}
          >
            <TaskItem
              task={task}
              isCompleted={false}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          </div>
        ))}
      </div>
    </>
  );
}

