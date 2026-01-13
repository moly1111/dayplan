// 存储管理模块
const Storage = {
    // 获取所有数据
    getAllData() {
        const data = localStorage.getItem('todoApp');
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('Failed to parse data:', e);
                return this.getDefaultData();
            }
        }
        return this.getDefaultData();
    },

    // 获取默认数据结构
    getDefaultData() {
        return {
            settings: {
                showWarning: true,
                killAnimation: true,
                killSound: false,
                theme: 'light',
                // DeepSeek API Key（仅存储在本地，供 xkm 版本使用）
                deepseekApiKey: '',
                // 快捷任务（仅存储在本地，供 xkm 版本使用）
                // 格式：[{ text: '任务内容', estimatedMinutes: 30 }, ...]
                quickTasks: [
                    { text: '喝水', estimatedMinutes: null },
                    { text: '短暂休息5分钟', estimatedMinutes: 5 },
                    { text: '复盘/整理', estimatedMinutes: null }
                ]
            },
            tasks: {}
        };
    },

    // 保存所有数据
    saveAllData(data) {
        try {
            localStorage.setItem('todoApp', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save data:', e);
            alert('保存数据失败，可能是存储空间不足');
        }
    },

    // 获取设置
    getSettings() {
        const data = this.getAllData();
        return data.settings || this.getDefaultData().settings;
    },

    // 保存设置
    saveSettings(settings) {
        const data = this.getAllData();
        data.settings = { ...data.settings, ...settings };
        this.saveAllData(data);
    },

    // 获取指定日期的任务
    getTasksByDate(dateStr) {
        const data = this.getAllData();
        return data.tasks[dateStr] || { pending: [], completed: [] };
    },

    // 保存指定日期的任务
    saveTasksByDate(dateStr, tasks) {
        const data = this.getAllData();
        data.tasks[dateStr] = tasks;
        this.saveAllData(data);
    },

    // 添加任务
    addTask(dateStr, text) {
        const tasks = this.getTasksByDate(dateStr);
        const newId = this.getNextTaskId(dateStr);
        tasks.pending.push({ id: newId, text: text });
        this.saveTasksByDate(dateStr, tasks);
        return newId;
    },

    // 完成任务（从 pending 移到 completed）
    completeTask(dateStr, taskId) {
        const tasks = this.getTasksByDate(dateStr);
        const taskIndex = tasks.pending.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            const task = tasks.pending.splice(taskIndex, 1)[0];
            tasks.completed.push(task);
            this.saveTasksByDate(dateStr, tasks);
            return true;
        }
        return false;
    },

    // 删除任务
    deleteTask(dateStr, taskId, fromCompleted = false) {
        const tasks = this.getTasksByDate(dateStr);
        if (fromCompleted) {
            const index = tasks.completed.findIndex(t => t.id === taskId);
            if (index !== -1) {
                tasks.completed.splice(index, 1);
                this.saveTasksByDate(dateStr, tasks);
                return true;
            }
        } else {
            const index = tasks.pending.findIndex(t => t.id === taskId);
            if (index !== -1) {
                tasks.pending.splice(index, 1);
                this.saveTasksByDate(dateStr, tasks);
                return true;
            }
        }
        return false;
    },

    // 更新任务文本
    updateTask(dateStr, taskId, newText, fromCompleted = false) {
        const tasks = this.getTasksByDate(dateStr);
        if (fromCompleted) {
            const task = tasks.completed.find(t => t.id === taskId);
            if (task) {
                task.text = newText;
                this.saveTasksByDate(dateStr, tasks);
                return true;
            }
        } else {
            const task = tasks.pending.find(t => t.id === taskId);
            if (task) {
                task.text = newText;
                this.saveTasksByDate(dateStr, tasks);
                return true;
            }
        }
        return false;
    },

    // 获取下一个任务ID
    getNextTaskId(dateStr) {
        const tasks = this.getTasksByDate(dateStr);
        const allTasks = [...tasks.pending, ...tasks.completed];
        if (allTasks.length === 0) return 1;
        return Math.max(...allTasks.map(t => t.id)) + 1;
    },

    // 获取所有有任务的日期
    getAllTaskDates() {
        const data = this.getAllData();
        return Object.keys(data.tasks || {});
    },

    // 检查日期是否有任务
    hasTasks(dateStr) {
        const tasks = this.getTasksByDate(dateStr);
        return tasks.pending.length > 0 || tasks.completed.length > 0;
    },

    // 检查日期是否有未完成任务
    hasPendingTasks(dateStr) {
        const tasks = this.getTasksByDate(dateStr);
        return tasks.pending.length > 0;
    },

    // 检查日期是否有已完成任务
    hasCompletedTasks(dateStr) {
        const tasks = this.getTasksByDate(dateStr);
        return tasks.completed.length > 0;
    },

    // 检查日期是否过期且有未完成任务
    isOverdue(dateStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        return date < today && this.hasPendingTasks(dateStr);
    },

    // 导出数据
    exportData() {
        const data = this.getAllData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // 导入数据
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            // 验证数据结构
            if (!data.settings || !data.tasks) {
                throw new Error('Invalid data structure');
            }
            // 验证 settings 结构
            if (typeof data.settings.showWarning !== 'boolean' ||
                typeof data.settings.killAnimation !== 'boolean' ||
                typeof data.settings.killSound !== 'boolean' ||
                !['light', 'dark'].includes(data.settings.theme)) {
                throw new Error('Invalid settings structure');
            }
            // 验证 tasks 结构
            for (const dateStr in data.tasks) {
                if (!Array.isArray(data.tasks[dateStr].pending) ||
                    !Array.isArray(data.tasks[dateStr].completed)) {
                    throw new Error('Invalid tasks structure');
                }
                // 验证任务项结构
                for (const task of [...data.tasks[dateStr].pending, ...data.tasks[dateStr].completed]) {
                    if (typeof task.id !== 'number' || typeof task.text !== 'string') {
                        throw new Error('Invalid task structure');
                    }
                }
            }
            // 数据验证通过，保存
            this.saveAllData(data);
            return true;
        } catch (e) {
            console.error('Failed to import data:', e);
            alert('导入失败：数据格式不正确');
            return false;
        }
    }
};

