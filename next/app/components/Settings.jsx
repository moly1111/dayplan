"use client";

import { useState, useEffect, useRef } from 'react';
import { Storage } from '../lib/storage';

export default function Settings({ onSettingsChange, onDataImport }) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(Storage.getSettings());
  const fileInputRef = useRef(null);

  useEffect(() => {
    // 应用主题
    if (settings.theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    Storage.saveSettings({ [key]: value });
  };

  const handleExport = () => {
    Storage.exportData();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonString = event.target.result;
      if (Storage.importData(jsonString)) {
        const newSettings = Storage.getSettings();
        setSettings(newSettings);
        onDataImport();
        alert('导入成功！');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // 清空 input，以便可以重复选择同一文件
  };

  return (
    <>
      <button
        id="settings-btn"
        className="settings-btn"
        title="设置"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15.6066 12.5C15.4566 12.7333 15.2833 12.95 15.0916 13.1416L13.1416 15.0916C12.95 15.2833 12.7333 15.4566 12.5 15.6066V17.5C12.5 17.7761 12.2761 18 12 18H8C7.72386 18 7.5 17.7761 7.5 17.5V15.6066C7.26667 15.4566 7.05 15.2833 6.85833 15.0916L4.90833 13.1416C4.71667 12.95 4.54333 12.7333 4.39333 12.5H2.5C2.22386 12.5 2 12.2761 2 12V8C2 7.72386 2.22386 7.5 2.5 7.5H4.39333C4.54333 7.26667 4.71667 7.05 4.90833 6.85833L6.85833 4.90833C7.05 4.71667 7.26667 4.54333 7.5 4.39333V2.5C7.5 2.22386 7.72386 2 8 2H12C12.2761 2 12.5 2.22386 12.5 2.5V4.39333C12.7333 4.54333 12.95 4.71667 13.1416 4.90833L15.0916 6.85833C15.2833 7.05 15.4566 7.26667 15.6066 7.5H17.5C17.7761 7.5 18 7.72386 18 8V12C18 12.2761 17.7761 12.5 17.5 12.5H15.6066Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="settings-panel-overlay"
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998
            }}
          />
          <div id="settings-panel" className="settings-panel">
            <div className="settings-content">
              <h3>设置</h3>
              
              <div className="settings-section">
                <h4>数据</h4>
                <div className="settings-item">
                  <button id="export-btn" onClick={handleExport}>备份</button>
                  <button id="import-btn" onClick={handleImportClick}>导入</button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="import-input"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleImport}
                  />
                </div>
              </div>

              <div className="settings-section">
                <h4>顶部提醒</h4>
                <div className="settings-item">
                  <label>
                    <input
                      type="checkbox"
                      id="show-warning-checkbox"
                      checked={settings.showWarning}
                      onChange={(e) => handleSettingChange('showWarning', e.target.checked)}
                    />
                    显示本地存储警告
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h4>完成任务特效</h4>
                <div className="settings-item">
                  <label>
                    <input
                      type="checkbox"
                      id="kill-animation-checkbox"
                      checked={settings.killAnimation}
                      onChange={(e) => handleSettingChange('killAnimation', e.target.checked)}
                    />
                    动画开关
                  </label>
                </div>
                <div className="settings-item">
                  <label>
                    <input
                      type="checkbox"
                      id="kill-sound-checkbox"
                      checked={settings.killSound}
                      onChange={(e) => handleSettingChange('killSound', e.target.checked)}
                    />
                    音效开关
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h4>外观</h4>
                <div className="settings-item">
                  <label>
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      id="theme-light"
                      checked={settings.theme === 'light'}
                      onChange={() => handleSettingChange('theme', 'light')}
                    />
                    Light
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      id="theme-dark"
                      checked={settings.theme === 'dark'}
                      onChange={() => handleSettingChange('theme', 'dark')}
                    />
                    Dark
                  </label>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

