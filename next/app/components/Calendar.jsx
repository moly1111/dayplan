"use client";

import { useState, useEffect } from 'react';
import { Storage, formatDate, isSameDate } from '../lib/storage';

export default function Calendar({ selectedDate, onDateSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [taskDates, setTaskDates] = useState(new Set());

  // 更新任务日期标记
  useEffect(() => {
    const dates = Storage.getAllTaskDates();
    setTaskDates(new Set(dates));
  }, [selectedDate]); // 当选中日期变化时更新

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 获取月份第一天是星期几
  const firstDay = new Date(year, month, 1).getDay();
  // 获取月份天数
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // 获取上个月最后几天（用于填充第一周）
  const prevMonthDays = new Date(year, month, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (date) => {
    onDateSelect(date);
  };

  const getDateStatus = (dateStr) => {
    if (!taskDates.has(dateStr)) return null;
    if (Storage.isOverdue(dateStr)) return 'overdue';
    if (Storage.hasCompletedTasks(dateStr) && !Storage.hasPendingTasks(dateStr)) {
      return 'completed';
    }
    return 'planned';
  };

  // 生成日期网格
  const days = [];
  
  // 填充上个月的日期（灰色显示，不可点击）
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    days.push(
      <div key={`prev-${day}`} className="calendar-day" style={{ opacity: 0.3, cursor: 'default' }}>
        <div className="calendar-day-number">{day}</div>
      </div>
    );
  }

  // 填充当前月的日期
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDate(date);
    const isToday = date.getTime() === today.getTime();
    const isSelected = selectedDate && isSameDate(date, selectedDate);
    const status = getDateStatus(dateStr);

    days.push(
      <div
        key={day}
        className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => handleDateClick(date)}
      >
        <div className="calendar-day-number">{day}</div>
        {status && (
          <div className={`calendar-day-dot ${status}`}></div>
        )}
      </div>
    );
  }

  // 填充下个月的日期（灰色显示，不可点击）
  const totalCells = days.length;
  const remainingCells = 42 - totalCells; // 6行 x 7列 = 42
  for (let day = 1; day <= remainingCells && day <= 14; day++) {
    days.push(
      <div key={`next-${day}`} className="calendar-day" style={{ opacity: 0.3, cursor: 'default' }}>
        <div className="calendar-day-number">{day}</div>
      </div>
    );
  }

  return (
    <div id="calendar">
      <div className="calendar-header">
        <button onClick={prevMonth}>←</button>
        <div className="calendar-month">{year}年{month + 1}月</div>
        <button onClick={nextMonth}>→</button>
      </div>
      
      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="calendar-day-name">{day}</div>
        ))}
      </div>
      
      <div className="calendar-grid">
        {days}
      </div>
    </div>
  );
}

