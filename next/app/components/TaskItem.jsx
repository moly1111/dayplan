"use client";

import { useState, useRef, useEffect } from 'react';

export default function TaskItem({ task, isCompleted, onComplete, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    if (!isCompleted) {
      setIsEditing(true);
      setEditText(task.text);
    }
  };

  const handleSave = () => {
    const newText = editText.trim();
    if (newText && newText !== task.text) {
      onUpdate(task.id, newText);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(task.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="task-item" data-task-id={task.id}>
      <div className="task-item-content">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={isCompleted}
          onChange={() => !isCompleted && onComplete?.(task.id)}
          disabled={isCompleted}
        />
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="task-edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div
            className="task-text"
            onDoubleClick={handleDoubleClick}
            style={isCompleted ? { textDecoration: 'line-through', opacity: 0.7 } : {}}
          >
            {task.text}
          </div>
        )}
      </div>
      <button
        className="task-delete"
        onClick={() => onDelete(task.id, isCompleted)}
        title="删除"
      >
        ×
      </button>
    </div>
  );
}

