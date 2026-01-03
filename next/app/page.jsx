"use client";

import { useState, useEffect } from 'react';
import { formatDate } from './lib/storage';
import Calendar from './components/Calendar';
import TasksList from './components/TasksList';
import CompletedTasks from './components/CompletedTasks';
import Settings from './components/Settings';
import WarningBar from './components/WarningBar';

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [calendarKey, setCalendarKey] = useState(0);

  useEffect(() => {
    // 初始化：设置当前日期为今天
    const today = new Date();
    setSelectedDate(today);
    setCurrentDateStr(formatDate(today));
  }, []);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setCurrentDateStr(formatDate(date));
  };

  const handleCalendarUpdate = () => {
    // 强制日历重新渲染以更新标记
    setCalendarKey(prev => prev + 1);
  };

  const handleDataImport = () => {
    // 数据导入后重新加载
    const today = new Date();
    setSelectedDate(today);
    setCurrentDateStr(formatDate(today));
    handleCalendarUpdate();
  };

  return (
    <>
      <WarningBar />
      <Settings onSettingsChange={() => {}} onDataImport={handleDataImport} />
      
      <div className="container">
        <div className="calendar-section">
          <Calendar
            key={calendarKey}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        <div className="tasks-section">
          {currentDateStr && (
            <TasksList
              currentDateStr={currentDateStr}
              onCalendarUpdate={handleCalendarUpdate}
            />
          )}
        </div>
      </div>

      {currentDateStr && (
        <div className="completed-section">
          <details>
            <summary>Completed</summary>
            <CompletedTasks
              currentDateStr={currentDateStr}
              onCalendarUpdate={handleCalendarUpdate}
            />
          </details>
        </div>
      )}

      <footer className="footer">
        <p>
          数据丢失将无法找回，请定期备份并妥善保存。<br />
          Data cannot be recovered if lost. Please back up regularly.
        </p>
      </footer>
    </>
  );
}
