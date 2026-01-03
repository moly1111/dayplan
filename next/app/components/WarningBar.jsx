"use client";

import { useState, useEffect } from 'react';
import { Storage } from '../lib/storage';

export default function WarningBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissedThisSession, setDismissedThisSession] = useState(false);

  useEffect(() => {
    const settings = Storage.getSettings();
    if (settings.showWarning) {
      const closed = sessionStorage.getItem('warningClosedThisSession');
      if (!closed) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('warningClosedThisSession', 'true');
    setIsVisible(false);
    setDismissedThisSession(true);
  };

  const handleDismiss = () => {
    Storage.saveSettings({ showWarning: false });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div id="warning-bar" className="warning-bar">
      <div className="warning-content">
        <p>
          本工具的所有数据仅存储在本地浏览器中，不会同步或上传到云端。<br />
          清理浏览器数据或更换设备将导致数据永久丢失。<br />
          建议定期使用右上角「备份」功能保存数据。<br />
          Data is stored locally only and cannot be recovered if lost. Please back up regularly.
        </p>
        <div className="warning-buttons">
          <button id="close-warning" onClick={handleClose}>关闭</button>
          <button id="dismiss-warning" onClick={handleDismiss}>永久关闭</button>
        </div>
      </div>
    </div>
  );
}

